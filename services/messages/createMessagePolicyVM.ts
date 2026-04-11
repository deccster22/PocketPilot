import { applyMessageProfileTuning } from '@/services/messages/applyMessageProfileTuning';
import { createPreparedMessageInputs } from '@/services/messages/createPreparedMessageInputs';
import {
  createPreparedMessageRationale,
  type PreparedMessageRationaleSource,
} from '@/services/messages/createPreparedMessageRationale';
import type {
  AlertThresholdDecision,
  MessagePolicyAvailability,
  MessagePolicyDashboardContext,
  MessagePriority,
  MessageSurfaceEligibility,
  MessagePolicySnapshotContext,
  MessagePolicyTradeHubContext,
  MessageSensitivityProfile,
  PreparedMessageInputContext,
  PreparedMessage,
} from '@/services/messages/types';

type CreateMessagePolicyVMParams = {
  surface: MessageSurfaceEligibility;
  snapshot?: MessagePolicySnapshotContext | null;
  dashboard?: MessagePolicyDashboardContext | null;
  tradeHub?: MessagePolicyTradeHubContext | null;
};

const SURFACELESS_MESSAGE: MessageSurfaceEligibility = 'NONE';

type MessagePolicyCandidate = {
  message: PreparedMessage;
  rationaleSource: PreparedMessageRationaleSource;
  inputContext?: PreparedMessageInputContext | null;
  decision?: AlertThresholdDecision | null;
  sensitivity?: MessageSensitivityProfile | null;
};

function createPreparedMessage(params: {
  kind: PreparedMessage['kind'];
  title: string;
  summary: string;
  priority: MessagePriority;
  surface: MessageSurfaceEligibility;
  dismissible?: boolean;
}): PreparedMessage {
  return {
    kind: params.kind,
    title: params.title,
    summary: params.summary,
    priority: params.priority,
    surface: params.surface,
    dismissible: params.dismissible ?? false,
  };
}

function compactCopy(parts: ReadonlyArray<string | null | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(' ');
}

function createBriefingMessage(
  snapshot: NonNullable<CreateMessagePolicyVMParams['snapshot']>,
): MessagePolicyCandidate | null {
  if (snapshot.briefing.status !== 'VISIBLE') {
    return null;
  }

  const firstDetail = snapshot.briefing.items[0]?.detail;
  const summary =
    compactCopy([snapshot.briefing.subtitle, firstDetail]) ||
    'A prepared PocketPilot note is available.';

  if (snapshot.briefing.kind === 'REORIENTATION') {
    return {
      message: createPreparedMessage({
        kind: 'REORIENTATION',
        title: snapshot.briefing.title,
        summary,
        priority: 'MEDIUM',
        surface: 'SNAPSHOT',
        dismissible: snapshot.briefing.dismissible,
      }),
      rationaleSource: 'SNAPSHOT_REORIENTATION',
    };
  }

  return {
    message: createPreparedMessage({
      kind: 'BRIEFING',
      title: snapshot.briefing.title,
      summary,
      priority: 'LOW',
      surface: 'SNAPSHOT',
      dismissible: snapshot.briefing.dismissible,
    }),
    rationaleSource: 'SNAPSHOT_HISTORY_BRIEFING',
  };
}

function isAlertEligibleInput(
  inputContext: PreparedMessageInputContext | null,
): inputContext is PreparedMessageInputContext {
  if (!inputContext) {
    return false;
  }

  return inputContext.eventFamily !== 'NON_ALERTABLE';
}

function createAlertTitle(inputContext: PreparedMessageInputContext): string {
  switch (inputContext.eventFamily) {
    case 'PRICE_CHANGE':
      return 'Meaningful change noticed';
    case 'MOMENTUM':
      return 'Momentum is building';
    case 'PULLBACK':
      return 'A dip is standing out';
    default:
      return 'A meaningful change was noticed';
  }
}

function createAlertMessage(
  snapshot: NonNullable<CreateMessagePolicyVMParams['snapshot']>,
  inputContext: PreparedMessageInputContext | null,
): PreparedMessage | null {
  if (!snapshot.latestRelevantEvent || !isAlertEligibleInput(inputContext)) {
    return null;
  }

  return createPreparedMessage({
    kind: 'ALERT',
    title: createAlertTitle(inputContext),
    summary: 'A prepared alert is available for calm review in Snapshot.',
    priority: 'MEDIUM',
    surface: 'SNAPSHOT',
  });
}

function createReferralMessage(
  dashboard?: MessagePolicyDashboardContext | null,
): MessagePolicyCandidate | null {
  if (!dashboard) {
    return null;
  }

  if (dashboard.hasPrimeItems || !dashboard.hasSupportingItems) {
    return null;
  }

  return {
    message: createPreparedMessage({
      kind: 'REFERRAL',
      title: 'Snapshot is the steadier fit',
      summary:
        'Dashboard has supporting context but not a strong top-focus item right now. Snapshot is the better place for a calm first read.',
      priority: 'LOW',
      surface: 'DASHBOARD',
    }),
    rationaleSource: 'DASHBOARD_REFERRAL',
  };
}

function createGuardedStopMessage(
  tradeHub?: MessagePolicyTradeHubContext | null,
): MessagePolicyCandidate | null {
  if (!tradeHub) {
    return null;
  }

  if (!tradeHub.hasSelectedPlan || tradeHub.executionPathSupported !== false) {
    return null;
  }

  return {
    message: createPreparedMessage({
      kind: 'GUARDED_STOP',
      title: 'Protected path unavailable',
      summary: compactCopy([
        tradeHub.executionPathUnavailableReason ??
          'A protected execution path is not available for this plan.',
        'Trade Hub will keep the plan visible as a read-only framing note instead of carrying the action path further.',
      ]),
      priority: 'HIGH',
      surface: 'TRADE_HUB',
    }),
    rationaleSource: 'TRADE_HUB_GUARDED_STOP',
  };
}

function createCandidates(params: CreateMessagePolicyVMParams): MessagePolicyCandidate[] {
  const candidates: MessagePolicyCandidate[] = [];

  const guardedStop = createGuardedStopMessage(params.tradeHub);
  if (guardedStop) {
    candidates.push(guardedStop);
  }

  const referral = createReferralMessage(params.dashboard);
  if (referral) {
    candidates.push(referral);
  }

  if (!params.snapshot) {
    return candidates;
  }

  const briefingMessage = createBriefingMessage(params.snapshot);
  if (briefingMessage) {
    candidates.push(briefingMessage);
    return candidates;
  }

  const hasDismissedReorientation =
    params.snapshot.reorientation.summary?.status === 'AVAILABLE' &&
    params.snapshot.reorientation.status === 'HIDDEN' &&
    params.snapshot.reorientation.reason === 'DISMISSED';

  if (hasDismissedReorientation) {
    return candidates;
  }

  const preparedInputContext = createPreparedMessageInputs(params.snapshot);
  const alertMessage = createAlertMessage(params.snapshot, preparedInputContext);
  if (alertMessage) {
    const tunedAlert = applyMessageProfileTuning({
      candidate: alertMessage,
      snapshot: params.snapshot,
      inputContext: preparedInputContext,
    });

    if (tunedAlert.message) {
      candidates.push({
        message: tunedAlert.message,
        rationaleSource: 'SNAPSHOT_TUNED_CHANGE',
        inputContext: preparedInputContext,
        decision: tunedAlert.decision,
        sensitivity: tunedAlert.sensitivity,
      });
    }
  }

  return candidates;
}

function hasInterpretedContext(params: CreateMessagePolicyVMParams): boolean {
  return Boolean(params.snapshot || params.dashboard || params.tradeHub);
}

function filterCandidatesForSurface(
  surface: MessageSurfaceEligibility,
  candidates: ReadonlyArray<MessagePolicyCandidate>,
): MessagePolicyCandidate[] {
  if (surface === SURFACELESS_MESSAGE) {
    return candidates.filter((candidate) => candidate.message.surface === SURFACELESS_MESSAGE);
  }

  return candidates.filter((candidate) => candidate.message.surface === surface);
}

export function createMessagePolicyVM(
  params: CreateMessagePolicyVMParams,
): MessagePolicyAvailability {
  if (!hasInterpretedContext(params)) {
    return {
      status: 'UNAVAILABLE',
      reason: 'INSUFFICIENT_INTERPRETED_CONTEXT',
      rationale: createPreparedMessageRationale({
        status: 'UNAVAILABLE',
        reason: 'INSUFFICIENT_INTERPRETED_CONTEXT',
      }),
    };
  }

  const candidates = createCandidates(params);
  const visibleCandidates = filterCandidatesForSurface(params.surface, candidates).slice(0, 1);

  if (visibleCandidates.length > 0) {
    const visibleCandidate = visibleCandidates[0];

    return {
      status: 'AVAILABLE',
      messages: [visibleCandidate.message],
      rationale: createPreparedMessageRationale({
        status: 'AVAILABLE',
        message: visibleCandidate.message,
        source: visibleCandidate.rationaleSource,
        inputContext: visibleCandidate.inputContext,
        decision: visibleCandidate.decision,
        sensitivity: visibleCandidate.sensitivity,
      }),
    };
  }

  if (candidates.length > 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
      rationale: createPreparedMessageRationale({
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      }),
    };
  }

  return {
    status: 'UNAVAILABLE',
    reason: 'NO_MESSAGE',
    rationale: createPreparedMessageRationale({
      status: 'UNAVAILABLE',
      reason: 'NO_MESSAGE',
    }),
  };
}
