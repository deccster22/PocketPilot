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

export type SnapshotBriefingItem = {
  label: string;
  detail: string;
};

export type SnapshotBriefingKind = 'REORIENTATION' | 'SINCE_LAST_CHECKED';

export type SnapshotBriefingState =
  | {
      status: 'HIDDEN';
      reason: 'NO_REORIENTATION' | 'NO_SINCE_LAST_CHECKED' | 'NO_MEANINGFUL_BRIEFING';
    }
  | {
      status: 'VISIBLE';
      kind: SnapshotBriefingKind;
      title: string;
      subtitle?: string | null;
      items: ReadonlyArray<SnapshotBriefingItem>;
      dismissible: boolean;
    };

export type SinceLastCheckedItemEmphasis = 'NEUTRAL' | 'CHANGE' | 'CONTEXT';

export type SinceLastCheckedItem = {
  title: string;
  summary: string;
  emphasis: SinceLastCheckedItemEmphasis;
};

export type SinceLastCheckedUnavailableReason =
  | 'NO_MEANINGFUL_CHANGES'
  | 'NO_ACCOUNT_CONTEXT'
  | 'NOT_ENABLED_FOR_SURFACE';

export type SinceLastCheckedAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: SinceLastCheckedUnavailableReason;
    }
  | {
      status: 'AVAILABLE';
      title: string;
      summary: string;
      items: ReadonlyArray<SinceLastCheckedItem>;
    };

export type ReorientationPreference = {
  enabled: boolean;
  thresholdDaysOverride?: number | null;
};

export type ReorientationVisibilityInput = {
  dismissedAt?: string | null;
  currentSessionDismissedAt?: string | null;
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
