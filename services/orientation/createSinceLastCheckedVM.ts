import type { EventLedgerEntry } from '@/core/types/eventLedger';
import { createOrientationBriefingItems } from '@/services/orientation/createOrientationBriefingItems';
import type {
  SinceLastCheckedAvailability,
  SinceLastCheckedItemEmphasis,
  SinceLastCheckedUnavailableReason,
} from '@/services/orientation/types';
import type { SnapshotVM } from '@/services/snapshot/snapshotService';

const MAX_ITEMS = 3;

type SinceLastCheckedSurface = 'SNAPSHOT' | 'DASHBOARD' | 'TRADE_HUB' | 'NONE';

function isForSelectedAccount(accountId: string, entry: EventLedgerEntry): boolean {
  return entry.accountId === accountId;
}

function resolveAccountId(snapshot: Pick<SnapshotVM, 'orientationContext'>): string | null {
  return (
    snapshot.orientationContext.accountId ??
    snapshot.orientationContext.historyContext.sinceLastChecked?.accountId ??
    null
  );
}

function createEmphasis(
  kind: 'PRICE_CHANGE' | 'STRATEGY_SHIFT' | 'VOLATILITY_CHANGE' | 'MARKET_EVENT' | 'ACCOUNT_CONTEXT',
): SinceLastCheckedItemEmphasis {
  switch (kind) {
    case 'ACCOUNT_CONTEXT':
      return 'CONTEXT';
    case 'MARKET_EVENT':
      return 'NEUTRAL';
    default:
      return 'CHANGE';
  }
}

function createUnavailable(reason: SinceLastCheckedUnavailableReason): SinceLastCheckedAvailability {
  return {
    status: 'UNAVAILABLE',
    reason,
  };
}

export function createSinceLastCheckedVM(params: {
  snapshot: Pick<SnapshotVM, 'model' | 'orientationContext'>;
  surface?: SinceLastCheckedSurface;
}): SinceLastCheckedAvailability {
  const surface = params.surface ?? 'SNAPSHOT';

  if (surface !== 'SNAPSHOT') {
    return createUnavailable('NOT_ENABLED_FOR_SURFACE');
  }

  const accountId = resolveAccountId(params.snapshot);
  if (!accountId) {
    return createUnavailable('NO_ACCOUNT_CONTEXT');
  }

  const historyContext = params.snapshot.orientationContext.historyContext;
  const lastViewedBoundary = historyContext.sinceLastChecked;

  if (!lastViewedBoundary) {
    return createUnavailable('NO_MEANINGFUL_CHANGES');
  }

  const eventsSinceLastChecked = historyContext.eventsSinceLastViewed.filter((entry) =>
    isForSelectedAccount(accountId, entry),
  );

  if (eventsSinceLastChecked.length === 0) {
    return createUnavailable('NO_MEANINGFUL_CHANGES');
  }

  const items = createOrientationBriefingItems({
    eventsSinceLastViewed: eventsSinceLastChecked,
    snapshotState: {
      currentState: params.snapshot.model.core.currentState.value,
      strategyStatus: params.snapshot.model.core.strategyStatus.value,
    },
  })
    .slice(0, MAX_ITEMS)
    .map((item) => ({
      title: item.label,
      summary: item.detail,
      emphasis: createEmphasis(item.kind),
    }));

  if (items.length === 0) {
    return createUnavailable('NO_MEANINGFUL_CHANGES');
  }

  return {
    status: 'AVAILABLE',
    title: 'Since last checked',
    summary: 'A calm read on the most meaningful interpreted changes since your last visit.',
    items,
  };
}
