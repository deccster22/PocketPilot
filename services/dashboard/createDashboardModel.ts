import type { MarketEvent } from '@/core/types/marketEvent';

import {
  prioritiseDashboardEvents,
} from '@/services/dashboard/prioritiseDashboardEvents';
import { shapeDashboardForProfile } from '@/services/dashboard/shapeDashboardForProfile';
import type {
  DashboardItem,
  DashboardModel,
  DashboardTrendDirection,
  OrientationContext,
  OrientationContextAsset,
} from '@/services/dashboard/types';

function createOrientationKey(params: {
  symbol?: string;
  accountId?: string;
  strategyId?: string;
}): string {
  return [params.symbol ?? '', params.accountId ?? '', params.strategyId ?? ''].join('::');
}

function buildOrientationIndex(
  assets: OrientationContextAsset[],
): Map<string, OrientationContextAsset> {
  return assets.reduce((index, asset) => {
    index.set(
      createOrientationKey({
        symbol: asset.symbol,
        accountId: asset.accountId,
        strategyId: asset.strategyId,
      }),
      asset,
    );
    return index;
  }, new Map<string, OrientationContextAsset>());
}

function deriveTrendDirectionFromEvent(event: MarketEvent): DashboardTrendDirection {
  switch (event.eventType) {
    case 'MOMENTUM_BUILDING':
      return 'strengthening';
    case 'DIP_DETECTED':
      return 'weakening';
    case 'PRICE_MOVEMENT':
      if ((event.pctChange ?? 0) > 0) {
        return 'strengthening';
      }

      if ((event.pctChange ?? 0) < 0) {
        return 'weakening';
      }

      return 'neutral';
    default:
      return 'neutral';
  }
}

function selectOrientationAsset(
  event: MarketEvent,
  index: Map<string, OrientationContextAsset>,
): OrientationContextAsset | undefined {
  return (
    index.get(
      createOrientationKey({
        symbol: event.symbol ?? undefined,
        accountId: event.accountId,
        strategyId: event.strategyId,
      }),
    ) ??
    index.get(
      createOrientationKey({
        symbol: event.symbol ?? undefined,
        accountId: event.accountId,
      }),
    ) ??
    index.get(
      createOrientationKey({
        accountId: event.accountId,
        strategyId: event.strategyId,
      }),
    ) ??
    index.get(
      createOrientationKey({
        symbol: event.symbol ?? undefined,
      }),
    )
  );
}

function createDashboardItem(
  event: MarketEvent,
  orientationAsset?: OrientationContextAsset,
): DashboardItem {
  return {
    symbol: event.symbol ?? orientationAsset?.symbol,
    accountId: event.accountId,
    strategyId: event.strategyId,
    eventType: event.eventType,
    alignmentState: orientationAsset?.alignmentState ?? event.alignmentState,
    trendDirection: orientationAsset?.trendDirection ?? deriveTrendDirectionFromEvent(event),
    certainty: orientationAsset?.certainty ?? event.certainty,
    timestamp: event.timestamp,
  };
}

export function createDashboardModel(params: {
  orientationContext: OrientationContext;
  events: MarketEvent[];
}): DashboardModel {
  const orientationIndex = buildOrientationIndex(params.orientationContext.assets);
  const baseModel = prioritiseDashboardEvents(
    params.events.map((event) =>
      createDashboardItem(event, selectOrientationAsset(event, orientationIndex)),
    ),
  );

  return shapeDashboardForProfile({
    model: baseModel,
    profile: params.orientationContext.profile,
  });
}
