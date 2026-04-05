import { applyMessageProfileTuning } from '@/services/messages/applyMessageProfileTuning';
import { createPreparedMessageInputs } from '@/services/messages/createPreparedMessageInputs';
import type {
  MessagePolicyAvailability,
  MessagePolicyDashboardContext,
  MessagePriority,
  MessageSurfaceEligibility,
  MessagePolicySnapshotContext,
  MessagePolicyTradeHubContext,
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
): PreparedMessage | null {
  if (snapshot.briefing.status !== 'VISIBLE') {
    return null;
  }

  const firstDetail = snapshot.briefing.items[0]?.detail;
  const summary =
    compactCopy([snapshot.briefing.subtitle, firstDetail]) ||
    'A prepared PocketPilot note is available.';

  if (snapshot.briefing.kind === 'REORIENTATION') {
    return createPreparedMessage({
      kind: 'REORIENTATION',
      title: snapshot.briefing.title,
      summary,
      priority: 'MEDIUM',
      surface: 'SNAPSHOT',
      dismissible: snapshot.briefing.dismissible,
    });
  }

  return createPreparedMessage({
    kind: 'BRIEFING',
    title: snapshot.briefing.title,
    summary,
    priority: 'LOW',
    surface: 'SNAPSHOT',
    dismissible: snapshot.briefing.dismissible,
  });
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
): PreparedMessage | null {
  if (!dashboard) {
    return null;
  }

  if (dashboard.hasPrimeItems || !dashboard.hasSupportingItems) {
    return null;
  }

  return createPreparedMessage({
    kind: 'REFERRAL',
    title: 'Snapshot is the steadier fit',
    summary:
      'Dashboard has supporting context but not a strong top-focus item right now. Snapshot is the better place for a calm first read.',
    priority: 'LOW',
    surface: 'DASHBOARD',
  });
}

function createGuardedStopMessage(
  tradeHub?: MessagePolicyTradeHubContext | null,
): PreparedMessage | null {
  if (!tradeHub) {
    return null;
  }

  if (!tradeHub.hasSelectedPlan || tradeHub.executionPathSupported !== false) {
    return null;
  }

  return createPreparedMessage({
    kind: 'GUARDED_STOP',
    title: 'Protected path unavailable',
    summary: compactCopy([
      tradeHub.executionPathUnavailableReason ??
        'A protected execution path is not available for this plan.',
      'Trade Hub will keep the plan visible as a read-only framing note instead of carrying the action path further.',
    ]),
    priority: 'HIGH',
    surface: 'TRADE_HUB',
  });
}

function createCandidates(params: CreateMessagePolicyVMParams): PreparedMessage[] {
  const candidates: PreparedMessage[] = [];

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
      candidates.push(tunedAlert.message);
    }
  }

  return candidates;
}

function hasInterpretedContext(params: CreateMessagePolicyVMParams): boolean {
  return Boolean(params.snapshot || params.dashboard || params.tradeHub);
}

function filterCandidatesForSurface(
  surface: MessageSurfaceEligibility,
  candidates: ReadonlyArray<PreparedMessage>,
): PreparedMessage[] {
  if (surface === SURFACELESS_MESSAGE) {
    return candidates.filter((candidate) => candidate.surface === SURFACELESS_MESSAGE);
  }

  return candidates.filter((candidate) => candidate.surface === surface);
}

export function createMessagePolicyVM(
  params: CreateMessagePolicyVMParams,
): MessagePolicyAvailability {
  if (!hasInterpretedContext(params)) {
    return {
      status: 'UNAVAILABLE',
      reason: 'INSUFFICIENT_INTERPRETED_CONTEXT',
    };
  }

  const candidates = createCandidates(params);
  const messages = filterCandidatesForSurface(params.surface, candidates).slice(0, 1);

  if (messages.length > 0) {
    return {
      status: 'AVAILABLE',
      messages,
    };
  }

  if (candidates.length > 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    };
  }

  return {
    status: 'UNAVAILABLE',
    reason: 'NO_MESSAGE',
  };
}
