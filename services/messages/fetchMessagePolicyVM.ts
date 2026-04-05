import type { UserProfile } from '@/core/profile/types';
import type { MarketEvent } from '@/core/types/marketEvent';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import { createMessagePolicyVM } from '@/services/messages/createMessagePolicyVM';
import type {
  MessagePolicyAvailability,
  MessagePolicyGuardedStopInput,
  MessagePolicyReferralInput,
  MessageSurfaceEligibility,
  MessagePolicySnapshotContext,
} from '@/services/messages/types';
import type { LastViewedState } from '@/services/orientation/lastViewedState';
import type {
  ReorientationPreference,
  ReorientationVisibilityInput,
} from '@/services/orientation/types';
import {
  fetchSnapshotSurfaceVM,
  type SnapshotSurfaceVM,
} from '@/services/snapshot/fetchSnapshotSurfaceVM';
import type { ForegroundScanResult } from '@/services/types/scan';
import type { ReorientationDismissState } from '@/services/orientation/reorientationPersistence';

function isMarketEvent(entry: unknown): entry is MarketEvent {
  return Boolean(
    entry &&
      typeof entry === 'object' &&
      'eventType' in entry &&
      'strategyId' in entry &&
      'signalsTriggered' in entry,
  );
}

function createSnapshotContext(surface: SnapshotSurfaceVM): MessagePolicySnapshotContext {
  const latestRelevantEvent = surface.snapshot.orientationContext.currentState.latestRelevantEvent;

  return {
    profile: surface.snapshot.model.profile,
    briefing: surface.briefing,
    reorientation: surface.reorientation,
    latestRelevantEvent: isMarketEvent(latestRelevantEvent) ? latestRelevantEvent : null,
  };
}

export async function fetchMessagePolicyVM(params: {
  surface: MessageSurfaceEligibility;
  profile: UserProfile;
  snapshotSurface?: SnapshotSurfaceVM;
  baselineScan?: ForegroundScanResult;
  nowProvider?: () => number;
  includeDebugObservatory?: boolean;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
  preference?: ReorientationPreference;
  reorientationDismissState?: ReorientationDismissState;
  currentSessionDismissState?: ReorientationDismissState;
  reorientationVisibility?: ReorientationVisibilityInput;
  referral?: MessagePolicyReferralInput | null;
  guardedStop?: MessagePolicyGuardedStopInput | null;
}): Promise<MessagePolicyAvailability> {
  const snapshotSurface =
    params.snapshotSurface ??
    (await fetchSnapshotSurfaceVM({
      profile: params.profile,
      baselineScan: params.baselineScan,
      nowProvider: params.nowProvider,
      includeDebugObservatory: params.includeDebugObservatory,
      eventLedger: params.eventLedger,
      eventLedgerQueries: params.eventLedgerQueries,
      lastViewedTimestamp: params.lastViewedTimestamp,
      lastViewedState: params.lastViewedState,
      preference: params.preference,
      reorientationDismissState: params.reorientationDismissState,
      currentSessionDismissState: params.currentSessionDismissState,
      reorientationVisibility: params.reorientationVisibility,
    }));

  return createMessagePolicyVM({
    surface: params.surface,
    snapshot: createSnapshotContext(snapshotSurface),
    referral: params.referral,
    guardedStop: params.guardedStop,
  });
}
