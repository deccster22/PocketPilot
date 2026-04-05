import type { UserProfile } from '@/core/profile/types';
import type {
  AlertThresholdDecision,
  MessagePolicySnapshotContext,
  MessageSensitivityProfile,
  PreparedMessageInputContext,
  PreparedMessage,
} from '@/services/messages/types';

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

function decideAlertThreshold(
  inputContext: PreparedMessageInputContext | null | undefined,
  sensitivity: MessageSensitivityProfile,
): AlertThresholdDecision {
  if (
    !inputContext ||
    inputContext.eventFamily === 'NON_ALERTABLE' ||
    inputContext.confirmationSupport === 'ESTIMATED_OR_THIN' ||
    inputContext.changeStrength === 'THIN' ||
    inputContext.subjectScope === 'PORTFOLIO'
  ) {
    return 'SUPPRESS';
  }

  if (!inputContext.isSingleSymbolScope) {
    return inputContext.changeStrength === 'STRONG' &&
      inputContext.confirmationSupport === 'CONFIRMED_WITH_HISTORY'
      ? 'DOWNGRADE_TO_BRIEFING'
      : 'SUPPRESS';
  }

  if (sensitivity === 'GUIDED') {
    return inputContext.changeStrength === 'STRONG' ? 'DOWNGRADE_TO_BRIEFING' : 'SUPPRESS';
  }

  if (sensitivity === 'BALANCED') {
    if (inputContext.changeStrength === 'STRONG') {
      return 'KEEP_AS_ALERT';
    }

    return inputContext.changeStrength === 'MEANINGFUL' ? 'DOWNGRADE_TO_BRIEFING' : 'SUPPRESS';
  }

  if (inputContext.changeStrength === 'STRONG') {
    return 'KEEP_AS_ALERT';
  }

  if (
    inputContext.changeStrength === 'MEANINGFUL' &&
    inputContext.confirmationSupport === 'CONFIRMED_WITH_HISTORY'
  ) {
    return 'KEEP_AS_ALERT';
  }

  return 'SUPPRESS';
}

function compactCopy(parts: ReadonlyArray<string | null | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(' ');
}

function createEventSubject(inputContext: PreparedMessageInputContext): string {
  if (inputContext.subjectLabel) {
    return `${inputContext.subjectLabel} is standing out in recent interpreted context.`;
  }

  if (inputContext.subjectScope === 'MULTI_SYMBOL') {
    return 'A small group of symbols is standing out in recent interpreted context.';
  }

  return 'Recent interpreted context is standing out at the portfolio level.';
}

function createHistorySupportSentence(
  inputContext: PreparedMessageInputContext,
): string | null {
  return inputContext.confirmationSupport === 'CONFIRMED_WITH_HISTORY'
    ? 'Recent interpreted history supports keeping it in view.'
    : null;
}

function createDowngradedBriefingTitle(
  inputContext: PreparedMessageInputContext,
): string {
  switch (inputContext.eventFamily) {
    case 'MOMENTUM':
      return 'Momentum is worth watching';
    case 'PULLBACK':
      return 'A dip is worth keeping in view';
    default:
      return 'A change is worth a calm look';
  }
}

function createDowngradedBriefingSummary(
  inputContext: PreparedMessageInputContext,
  sensitivity: MessageSensitivityProfile,
): string {
  const subject = createEventSubject(inputContext);
  const historySupport = createHistorySupportSentence(inputContext);

  switch (inputContext.eventFamily) {
    case 'MOMENTUM':
      return sensitivity === 'GUIDED'
        ? compactCopy([
            subject,
            historySupport,
            'Snapshot can help you judge whether the momentum belongs in view without rushing.',
          ])
        : compactCopy([
            subject,
            historySupport,
            'Snapshot can help you judge whether the momentum matters to your setup.',
          ]);
    case 'PULLBACK':
      return sensitivity === 'GUIDED'
        ? compactCopy([
            subject,
            historySupport,
            'Snapshot can help you decide whether the dip belongs in view without rushing.',
          ])
        : compactCopy([
            subject,
            historySupport,
            'Snapshot can help you judge whether the dip belongs in scope.',
          ]);
    default:
      return sensitivity === 'GUIDED'
        ? compactCopy([
            subject,
            historySupport,
            'Snapshot can help you decide whether it changes your plan without rushing.',
          ])
        : compactCopy([
            subject,
            historySupport,
            'Snapshot can help you judge whether it changes your current setup.',
          ]);
  }
}

function createAlertSummary(
  inputContext: PreparedMessageInputContext,
  sensitivity: MessageSensitivityProfile,
): string {
  const subject = createEventSubject(inputContext);
  const historySupport = createHistorySupportSentence(inputContext);

  if (sensitivity === 'DIRECT') {
    switch (inputContext.eventFamily) {
      case 'MOMENTUM':
        return compactCopy([
          subject,
          historySupport,
          'Review Snapshot if the momentum matters to your setup.',
        ]);
      case 'PULLBACK':
        return compactCopy([
          subject,
          historySupport,
          'Review Snapshot if the dip belongs in scope.',
        ]);
      default:
        return compactCopy([subject, historySupport, 'Review Snapshot if it changes your plan.']);
    }
  }

  switch (inputContext.eventFamily) {
    case 'MOMENTUM':
      return compactCopy([
        subject,
        historySupport,
        'Snapshot can help you judge whether momentum matters without rushing.',
      ]);
    case 'PULLBACK':
      return compactCopy([
        subject,
        historySupport,
        'Snapshot can help you decide whether the dip belongs in view.',
      ]);
    default:
      return compactCopy([
        subject,
        historySupport,
        'Review Snapshot before deciding whether it changes your plan.',
      ]);
  }
}

export function applyMessageProfileTuning(params: {
  candidate: PreparedMessage;
  snapshot: MessagePolicySnapshotContext;
  inputContext: PreparedMessageInputContext | null;
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

  const decision = decideAlertThreshold(params.inputContext, sensitivity);

  if (!params.inputContext || decision === 'SUPPRESS') {
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
        title: createDowngradedBriefingTitle(params.inputContext),
        summary: createDowngradedBriefingSummary(params.inputContext, sensitivity),
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
      summary: createAlertSummary(params.inputContext, sensitivity),
    },
  };
}
