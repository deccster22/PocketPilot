import type { UserProfile } from '@/core/profile/types';
import type { SinceLastCheckedPayload } from '@/services/events/createSinceLastChecked';
import type { ForegroundScanResult } from '@/services/types/scan';

import type { SnapshotModel, SnapshotTrendDirection } from '@/services/snapshot/types';

export function deriveTrendDirection(change24h: number): SnapshotTrendDirection {
  if (change24h > 0) {
    return 'UP';
  }

  if (change24h < 0) {
    return 'DOWN';
  }

  return 'FLAT';
}

export function formatCurrentState(trendDirection: SnapshotTrendDirection): string {
  switch (trendDirection) {
    case 'UP':
      return 'Up';
    case 'DOWN':
      return 'Down';
    default:
      return 'Flat';
  }
}

export function createSnapshotModel(params: {
  profile: UserProfile;
  scan: ForegroundScanResult;
  bundleName: string;
  portfolioValue: number;
  change24h: number;
  strategyAlignment: string;
  sinceLastChecked?: SinceLastCheckedPayload;
}): SnapshotModel {
  const trendDirection = deriveTrendDirection(params.change24h);

  return {
    profile: params.profile,
    core: {
      currentState: {
        label: 'Current State',
        value: formatCurrentState(trendDirection),
        trendDirection,
      },
      change24h: {
        label: 'Last 24h Change',
        value: params.change24h,
      },
      strategyStatus: {
        label: 'Strategy Status',
        value: params.strategyAlignment,
      },
    },
    secondary: {
      bundleName: params.bundleName,
      portfolioValue: params.portfolioValue,
    },
    history:
      params.sinceLastChecked === undefined
        ? undefined
        : {
            hasNewSinceLastCheck: params.sinceLastChecked.summaryCount > 0,
          },
  };
}
