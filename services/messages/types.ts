import type { UserProfile } from '@/core/profile/types';
import type { MarketEvent } from '@/core/types/marketEvent';
import type { ReorientationSurfaceState } from '@/services/orientation/createReorientationSurfaceState';
import type { SnapshotBriefingState } from '@/services/orientation/types';

export type MessagePolicyKind =
  | 'BRIEFING'
  | 'ALERT'
  | 'REORIENTATION'
  | 'REFERRAL'
  | 'GUARDED_STOP';

export type MessagePriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type MessageSurfaceEligibility = 'SNAPSHOT' | 'DASHBOARD' | 'TRADE_HUB' | 'NONE';

export type PreparedMessage = {
  kind: MessagePolicyKind;
  title: string;
  summary: string;
  priority: MessagePriority;
  surface: MessageSurfaceEligibility;
  dismissible: boolean;
};

export type MessagePolicyAvailability =
  | {
      status: 'UNAVAILABLE';
      reason:
        | 'NO_MESSAGE'
        | 'NOT_ENABLED_FOR_SURFACE'
        | 'INSUFFICIENT_INTERPRETED_CONTEXT';
    }
  | {
      status: 'AVAILABLE';
      messages: ReadonlyArray<PreparedMessage>;
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
