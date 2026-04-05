import type { UserProfile } from '@/core/profile/types';
import type { EventType, MarketEvent } from '@/core/types/marketEvent';
import type {
  AlertThresholdDecision,
  MessagePolicySnapshotContext,
  MessageSensitivityProfile,
  PreparedMessage,
} from '@/services/messages/types';

type AlertThresholdRule = {
  minConfidence: number;
  minAbsPctChange: number;
};

export function resolveMessageSensitivityProfile(
  profile: UserProfile,
): MessageSensitivityProfile {
  switch (profile) {
    case 'BEGINNER':
      return 'GUIDED';
    case 'MIDDLE':
      return 'BALANCED';
    default:
      return 'DIRECT';
  }
}

function createAlertRule(eventType: EventType): AlertThresholdRule {
  switch (eventType) {
    case 'MOMENTUM_BUILDING':
      return {
        minConfidence: 0.92,
        minAbsPctChange: 0.04,
      };
    case 'DIP_DETECTED':
      return {
        minConfidence: 0.92,
        minAbsPctChange: 0.05,
      };
    default:
      return {
        minConfidence: 0.9,
        minAbsPctChange: 0.05,
      };
  }
}

function createCalmReviewRule(eventType: EventType): AlertThresholdRule {
  switch (eventType) {
    case 'MOMENTUM_BUILDING':
      return {
        minConfidence: 0.84,
        minAbsPctChange: 0.03,
      };
    case 'DIP_DETECTED':
      return {
        minConfidence: 0.84,
        minAbsPctChange: 0.04,
      };
    default:
      return {
        minConfidence: 0.82,
        minAbsPctChange: 0.03,
      };
  }
}

function hasUsableAlertMetrics(event: MarketEvent): boolean {
  return (
    typeof event.symbol === 'string' &&
    event.symbol.trim().length > 0 &&
    Number.isFinite(event.confidenceScore) &&
    typeof event.pctChange === 'number' &&
    Number.isFinite(event.pctChange)
  );
}

function meetsThreshold(event: MarketEvent, rule: AlertThresholdRule): boolean {
  return (
    event.confidenceScore >= rule.minConfidence &&
    Math.abs(event.pctChange ?? 0) >= rule.minAbsPctChange
  );
}

function decideAlertThreshold(
  event: MarketEvent | null | undefined,
  sensitivity: MessageSensitivityProfile,
): AlertThresholdDecision {
  if (!event || !hasUsableAlertMetrics(event)) {
    return 'SUPPRESS';
  }

  if (sensitivity === 'GUIDED') {
    return meetsThreshold(event, createCalmReviewRule(event.eventType))
      ? 'DOWNGRADE_TO_BRIEFING'
      : 'SUPPRESS';
  }

  if (meetsThreshold(event, createAlertRule(event.eventType))) {
    return 'KEEP_AS_ALERT';
  }

  if (sensitivity === 'BALANCED' && meetsThreshold(event, createCalmReviewRule(event.eventType))) {
    return 'DOWNGRADE_TO_BRIEFING';
  }

  return 'SUPPRESS';
}

function createEventSubject(event: MarketEvent): string {
  return `${event.symbol} is standing out in recent interpreted context.`;
}

function createDowngradedBriefingTitle(eventType: EventType): string {
  switch (eventType) {
    case 'MOMENTUM_BUILDING':
      return 'Momentum is worth watching';
    case 'DIP_DETECTED':
      return 'A dip is worth keeping in view';
    default:
      return 'A change is worth a calm look';
  }
}

function createDowngradedBriefingSummary(
  event: MarketEvent,
  sensitivity: MessageSensitivityProfile,
): string {
  const subject = createEventSubject(event);

  switch (event.eventType) {
    case 'MOMENTUM_BUILDING':
      return sensitivity === 'GUIDED'
        ? `${subject} Snapshot can help you judge whether the momentum belongs in view without rushing.`
        : `${subject} Snapshot can help you judge whether the momentum matters to your setup.`;
    case 'DIP_DETECTED':
      return sensitivity === 'GUIDED'
        ? `${subject} Snapshot can help you decide whether the dip belongs in view without rushing.`
        : `${subject} Snapshot can help you judge whether the dip belongs in scope.`;
    default:
      return sensitivity === 'GUIDED'
        ? `${subject} Snapshot can help you decide whether it changes your plan without rushing.`
        : `${subject} Snapshot can help you judge whether it changes your current setup.`;
  }
}

function createAlertSummary(
  event: MarketEvent,
  sensitivity: MessageSensitivityProfile,
): string {
  const subject = createEventSubject(event);

  if (sensitivity === 'DIRECT') {
    switch (event.eventType) {
      case 'MOMENTUM_BUILDING':
        return `${subject} Review Snapshot if the momentum matters to your setup.`;
      case 'DIP_DETECTED':
        return `${subject} Review Snapshot if the dip belongs in scope.`;
      default:
        return `${subject} Review Snapshot if it changes your plan.`;
    }
  }

  switch (event.eventType) {
    case 'MOMENTUM_BUILDING':
      return `${subject} Snapshot can help you judge whether momentum matters without rushing.`;
    case 'DIP_DETECTED':
      return `${subject} Snapshot can help you decide whether the dip belongs in view.`;
    default:
      return `${subject} Review Snapshot before deciding whether it changes your plan.`;
  }
}

export function applyMessageProfileTuning(params: {
  candidate: PreparedMessage;
  snapshot: MessagePolicySnapshotContext;
}): {
  decision: AlertThresholdDecision;
  sensitivity: MessageSensitivityProfile;
  message: PreparedMessage | null;
} {
  const sensitivity = resolveMessageSensitivityProfile(params.snapshot.profile);

  if (params.candidate.kind !== 'ALERT') {
    return {
      decision: 'KEEP_AS_ALERT',
      sensitivity,
      message: params.candidate,
    };
  }

  const latestRelevantEvent = params.snapshot.latestRelevantEvent;
  const decision = decideAlertThreshold(latestRelevantEvent, sensitivity);

  if (!latestRelevantEvent || decision === 'SUPPRESS') {
    return {
      decision,
      sensitivity,
      message: null,
    };
  }

  if (decision === 'DOWNGRADE_TO_BRIEFING') {
    return {
      decision,
      sensitivity,
      message: {
        ...params.candidate,
        kind: 'BRIEFING',
        title: createDowngradedBriefingTitle(latestRelevantEvent.eventType),
        summary: createDowngradedBriefingSummary(latestRelevantEvent, sensitivity),
        priority: 'LOW',
      },
    };
  }

  return {
    decision,
    sensitivity,
    message: {
      ...params.candidate,
      priority: 'MEDIUM',
      summary: createAlertSummary(latestRelevantEvent, sensitivity),
    },
  };
}
