import type { UserProfile } from '@/core/profile/types';
import type { MarketEvent } from '@/core/types/marketEvent';
import type { ReorientationSurfaceState } from '@/services/orientation/createReorientationSurfaceState';
import type {
  SinceLastCheckedAvailability,
  SnapshotBriefingState,
} from '@/services/orientation/types';

export type MessagePolicyKind =
  | 'BRIEFING'
  | 'ALERT'
  | 'REORIENTATION'
  | 'REFERRAL'
  | 'GUARDED_STOP';

export type MessagePriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type MessageSensitivityProfile = 'GUIDED' | 'BALANCED' | 'DIRECT';

export type AlertThresholdDecision = 'KEEP_AS_ALERT' | 'DOWNGRADE_TO_BRIEFING' | 'SUPPRESS';

export type MessageSurfaceEligibility = 'SNAPSHOT' | 'DASHBOARD' | 'TRADE_HUB' | 'NONE';

export type PreparedMessageSubjectScope = 'SINGLE_SYMBOL' | 'MULTI_SYMBOL' | 'PORTFOLIO';

export type PreparedMessageEventFamily =
  | 'PRICE_CHANGE'
  | 'MOMENTUM'
  | 'PULLBACK'
  | 'NON_ALERTABLE';

export type PreparedMessageChangeStrength = 'THIN' | 'MODEST' | 'MEANINGFUL' | 'STRONG';

export type PreparedMessageConfirmationSupport =
  | 'ESTIMATED_OR_THIN'
  | 'CONFIRMED_EVENT'
  | 'CONFIRMED_WITH_HISTORY';

export type PreparedMessageInputContext = {
  subjectLabel: string | null;
  subjectScope: PreparedMessageSubjectScope;
  isSingleSymbolScope: boolean;
  eventFamily: PreparedMessageEventFamily;
  confirmationSupport: PreparedMessageConfirmationSupport;
  changeStrength: PreparedMessageChangeStrength;
  hasSinceLastCheckedContext: boolean;
  hasReorientationContext: boolean;
};

export type PreparedMessage = {
  kind: MessagePolicyKind;
  title: string;
  summary: string;
  priority: MessagePriority;
  surface: MessageSurfaceEligibility;
  dismissible: boolean;
};

export type MessageRationale = {
  title: string;
  summary: string;
  items: ReadonlyArray<string>;
};

export type MessageRationaleAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_RATIONALE_AVAILABLE' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      rationale: MessageRationale;
    };

export type MessagePolicyUnavailableReason =
  | 'NO_MESSAGE'
  | 'NOT_ENABLED_FOR_SURFACE'
  | 'INSUFFICIENT_INTERPRETED_CONTEXT';

export type MessagePolicyAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: MessagePolicyUnavailableReason;
      rationale: MessageRationaleAvailability;
    }
  | {
      status: 'AVAILABLE';
      messages: ReadonlyArray<PreparedMessage>;
      rationale: MessageRationaleAvailability;
    };

export type MessagePolicyLane = {
  policyAvailability: MessagePolicyAvailability;
  rationaleAvailability: MessageRationaleAvailability;
};

export type MessagePolicyReferralInput = {
  title: string;
  summary: string;
  priority?: MessagePriority;
  surface?: MessageSurfaceEligibility;
};

export type MessagePolicyGuardedStopInput = {
  title: string;
  summary: string;
  priority?: MessagePriority;
  surface?: MessageSurfaceEligibility;
};

export type MessagePolicySnapshotContext = {
  profile: UserProfile;
  briefing: SnapshotBriefingState;
  reorientation: ReorientationSurfaceState;
  sinceLastChecked?: SinceLastCheckedAvailability | null;
  sinceLastCheckedSummaryCount: number;
  latestRelevantEvent?: MarketEvent | null;
};

export type MessagePolicyDashboardContext = {
  hasPrimeItems: boolean;
  hasSupportingItems: boolean;
};

export type MessagePolicyTradeHubContext = {
  hasSelectedPlan: boolean;
  executionPathSupported: boolean | null;
  executionPathUnavailableReason: string | null;
};
