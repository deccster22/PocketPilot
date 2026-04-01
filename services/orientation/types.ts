import type { UserProfile } from '@/core/profile/types';
import type { OrientationContext } from '@/services/orientation/createOrientationContext';
import type { SnapshotModel } from '@/services/snapshot/types';

export type ReorientationSummaryItemKind =
  | 'PRICE_CHANGE'
  | 'STRATEGY_SHIFT'
  | 'VOLATILITY_CHANGE'
  | 'MARKET_EVENT'
  | 'ACCOUNT_CONTEXT';

export type ReorientationSummaryItem = {
  kind: ReorientationSummaryItemKind;
  label: string;
  detail: string;
};

export type ReorientationPreference = {
  enabled: boolean;
  thresholdDaysOverride?: number | null;
};

export type ReorientationEligibility =
  | {
      status: 'NOT_NEEDED';
      reason: 'BELOW_THRESHOLD' | 'DISABLED_FOR_PROFILE' | 'NO_MEANINGFUL_CHANGE';
    }
  | {
      status: 'AVAILABLE';
      profileId: UserProfile;
      inactiveDays: number;
      headline: string;
      summaryItems: ReadonlyArray<ReorientationSummaryItem>;
      generatedFrom: {
        lastActiveAt: string;
        now: string;
      };
      maxItems: number;
    };

export type ReorientationSummarySource = {
  snapshotModel: SnapshotModel;
  orientationContext: OrientationContext;
  accountId?: string;
};
