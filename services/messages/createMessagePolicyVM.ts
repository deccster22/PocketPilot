import type { EventType, MarketEvent } from '@/core/types/marketEvent';
import type {
  MessagePolicyAvailability,
  MessagePolicyDashboardContext,
  MessagePriority,
  MessageSurfaceEligibility,
  MessagePolicySnapshotContext,
  MessagePolicyTradeHubContext,
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

function isAlertEligibleEvent(event: MarketEvent | null | undefined): boolean {
  if (!event || event.certainty !== 'confirmed') {
    return false;
  }

  return (
    event.eventType === 'PRICE_MOVEMENT' ||
    event.eventType === 'MOMENTUM_BUILDING' ||
    event.eventType === 'DIP_DETECTED'
  );
}

function createAlertTitle(eventType: EventType): string {
  switch (eventType) {
    case 'PRICE_MOVEMENT':
      return 'Meaningful change noticed';
    case 'MOMENTUM_BUILDING':
      return 'Momentum is building';
    case 'DIP_DETECTED':
      return 'A dip is standing out';
    default:
      return 'A meaningful change was noticed';
  }
}

function createAlertSummary(event: MarketEvent): string {
  const subject = event.symbol
    ? `${event.symbol} is standing out in recent interpreted context.`
    : 'Recent interpreted context is standing out.';

  switch (event.eventType) {
    case 'PRICE_MOVEMENT':
      return `${subject} Review Snapshot before deciding whether it changes your plan.`;
    case 'MOMENTUM_BUILDING':
      return `${subject} Snapshot can help you judge whether momentum matters without rushing.`;
    case 'DIP_DETECTED':
      return `${subject} Snapshot can help you decide whether the dip belongs in view.`;
    default:
      return `${subject} Snapshot is the right place for a calm review.`;
  }
}

function createAlertMessage(
  snapshot: NonNullable<CreateMessagePolicyVMParams['snapshot']>,
): PreparedMessage | null {
  const latestRelevantEvent = snapshot.latestRelevantEvent;

  if (snapshot.profile === 'BEGINNER') {
    return null;
  }

  if (!latestRelevantEvent || !isAlertEligibleEvent(latestRelevantEvent)) {
    return null;
  }

  return createPreparedMessage({
    kind: 'ALERT',
    title: createAlertTitle(latestRelevantEvent.eventType),
    summary: createAlertSummary(latestRelevantEvent),
    priority: 'HIGH',
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

  const alertMessage = createAlertMessage(params.snapshot);
  if (alertMessage) {
    candidates.push(alertMessage);
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
