import type { UserProfile } from '@/core/profile/types';
import type { MarketEvent } from '@/core/types/marketEvent';
import {
  fetchDashboardSurfaceVM,
  type DashboardSurfaceVM,
} from '@/services/dashboard/dashboardSurfaceService';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import { createMessagePolicyVM } from '@/services/messages/createMessagePolicyVM';
import type {
  MessagePolicyAvailability,
  MessagePolicyDashboardContext,
  MessageSurfaceEligibility,
  MessagePolicySnapshotContext,
  MessagePolicyTradeHubContext,
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
import { fetchConfirmationSessionVM } from '@/services/trade/fetchConfirmationSessionVM';
import type { ConfirmationSession } from '@/services/trade/types';
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
  const sinceLastChecked =
    surface.snapshot.orientationContext.historyContext.sinceLastChecked;

  return {
    profile: surface.snapshot.model.profile,
    briefing: surface.briefing,
    reorientation: surface.reorientation,
    sinceLastCheckedSummaryCount: sinceLastChecked?.summaryCount ?? 0,
    latestRelevantEvent: isMarketEvent(latestRelevantEvent) ? latestRelevantEvent : null,
  };
}

function createDashboardContext(surface: DashboardSurfaceVM): MessagePolicyDashboardContext {
  return {
    hasPrimeItems: surface.model.meta.hasPrimeItems,
    hasSupportingItems: surface.model.meta.hasSecondaryItems || surface.model.meta.hasDeepItems,
  };
}

function createTradeHubContext(
  confirmationSession: ConfirmationSession | null | undefined,
): MessagePolicyTradeHubContext | null {
  if (!confirmationSession) {
    return null;
  }

  if (!confirmationSession.planId) {
    return {
      hasSelectedPlan: false,
      executionPathSupported: null,
      executionPathUnavailableReason: null,
    };
  }

  if (!confirmationSession.executionCapability) {
    return null;
  }

  return {
    hasSelectedPlan: true,
    executionPathSupported: confirmationSession.executionCapability.supported,
    executionPathUnavailableReason: confirmationSession.executionCapability.unavailableReason,
  };
}

export async function fetchMessagePolicyVM(params: {
  surface: MessageSurfaceEligibility;
  profile: UserProfile;
  snapshotSurface?: SnapshotSurfaceVM;
  dashboardSurface?: DashboardSurfaceVM;
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
  confirmationSession?: ConfirmationSession | null;
}): Promise<MessagePolicyAvailability> {
  switch (params.surface) {
    case 'SNAPSHOT': {
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
      });
    }
    case 'DASHBOARD': {
      const dashboardSurface =
        params.dashboardSurface ??
        (await fetchDashboardSurfaceVM({
          profile: params.profile,
          baselineScan: params.baselineScan,
          nowProvider: params.nowProvider,
        }));

      return createMessagePolicyVM({
        surface: params.surface,
        dashboard: createDashboardContext(dashboardSurface),
      });
    }
    case 'TRADE_HUB': {
      const confirmationSession =
        params.confirmationSession ??
        (
          await fetchConfirmationSessionVM({
            profile: params.profile,
            baselineScan: params.baselineScan,
            nowProvider: params.nowProvider,
            eventLedger: params.eventLedger,
            eventLedgerQueries: params.eventLedgerQueries,
            lastViewedTimestamp: params.lastViewedTimestamp,
            lastViewedState: params.lastViewedState,
          })
        ).session;

      return createMessagePolicyVM({
        surface: params.surface,
        tradeHub: createTradeHubContext(confirmationSession),
      });
    }
    default:
      return createMessagePolicyVM({
        surface: params.surface,
      });
  }
}
