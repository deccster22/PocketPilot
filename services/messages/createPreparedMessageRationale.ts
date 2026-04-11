import type {
  AlertThresholdDecision,
  MessagePolicyUnavailableReason,
  MessageRationaleAvailability,
  MessageSensitivityProfile,
  PreparedMessage,
  PreparedMessageInputContext,
} from '@/services/messages/types';

export type PreparedMessageRationaleSource =
  | 'SNAPSHOT_REORIENTATION'
  | 'SNAPSHOT_HISTORY_BRIEFING'
  | 'SNAPSHOT_TUNED_CHANGE'
  | 'DASHBOARD_REFERRAL'
  | 'TRADE_HUB_GUARDED_STOP';

export type CreatePreparedMessageRationaleParams =
  | {
      status: 'UNAVAILABLE';
      reason: MessagePolicyUnavailableReason;
    }
  | {
      status: 'AVAILABLE';
      message: PreparedMessage;
      source: PreparedMessageRationaleSource;
      inputContext?: PreparedMessageInputContext | null;
      decision?: AlertThresholdDecision | null;
      sensitivity?: MessageSensitivityProfile | null;
    };

const DEFAULT_TITLE = 'Why this is here';

function compactItems(parts: ReadonlyArray<string | null | undefined>): ReadonlyArray<string> {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .slice(0, 2);
}

function createUnavailableRationale(
  reason: MessagePolicyUnavailableReason,
): MessageRationaleAvailability {
  return {
    status: 'UNAVAILABLE',
    reason: reason === 'NOT_ENABLED_FOR_SURFACE' ? 'NOT_ENABLED_FOR_SURFACE' : 'NO_RATIONALE_AVAILABLE',
  };
}

function createSnapshotChangeSummary(params: {
  message: PreparedMessage;
  inputContext?: PreparedMessageInputContext | null;
  decision?: AlertThresholdDecision | null;
  sensitivity?: MessageSensitivityProfile | null;
}): string {
  if (params.message.kind === 'ALERT') {
    return "Shown as an alert because the change is focused enough for Snapshot's alert posture.";
  }

  if (params.decision === 'DOWNGRADE_TO_BRIEFING') {
    if (params.inputContext?.subjectScope !== 'SINGLE_SYMBOL') {
      return 'Shown as a briefing because the context is broader than PocketPilot uses for an alert.';
    }

    if (params.sensitivity === 'GUIDED') {
      return 'Shown as a briefing because PocketPilot keeps this kind of change quieter until the picture settles a bit more.';
    }

    return 'Shown as a briefing because the change is meaningful but not strong enough for an alert.';
  }

  return 'Shown as a briefing because the change belongs in a calmer note here.';
}

function createSnapshotChangeSpecificItem(
  inputContext?: PreparedMessageInputContext | null,
): string | null {
  if (!inputContext) {
    return null;
  }

  if (inputContext.subjectScope === 'MULTI_SYMBOL') {
    return 'The context spans more than one symbol, so PocketPilot keeps the posture quiet.';
  }

  if (inputContext.subjectScope === 'PORTFOLIO') {
    return 'Broader portfolio context stays quieter so the message does not overstate it.';
  }

  if (inputContext.confirmationSupport === 'CONFIRMED_WITH_HISTORY') {
    return 'Recent continuity supports keeping it visible without turning it into a feed item.';
  }

  if (inputContext.confirmationSupport === 'ESTIMATED_OR_THIN') {
    return 'Context that is still thin stays quiet rather than turning into a stronger message.';
  }

  return 'The change is focused enough to keep visible without crowding the surface.';
}

function createRationale(
  summary: string,
  items: ReadonlyArray<string | null | undefined>,
): MessageRationaleAvailability {
  return {
    status: 'AVAILABLE',
    rationale: {
      title: DEFAULT_TITLE,
      summary,
      items: compactItems(items),
    },
  };
}

export function createPreparedMessageRationale(
  params: CreatePreparedMessageRationaleParams,
): MessageRationaleAvailability {
  if (params.status === 'UNAVAILABLE') {
    return createUnavailableRationale(params.reason);
  }

  switch (params.source) {
    case 'SNAPSHOT_REORIENTATION':
      return createRationale(
        'Shown as a reorientation because you are returning after a meaningful gap and Snapshot should help you regain context first.',
        [
          'It stays separate from alerts so the surface can help you get your bearings first.',
          'The note stays compact because Snapshot already holds the fuller view.',
        ],
      );
    case 'SNAPSHOT_HISTORY_BRIEFING':
      return createRationale('Shown as a briefing because this is a calm recap, not a narrow alert.', [
        'It stays quiet because this context belongs in the briefing lane.',
        'Snapshot already holds the fuller context if you want a calmer read.',
      ]);
    case 'SNAPSHOT_TUNED_CHANGE':
      return createRationale(createSnapshotChangeSummary(params), [
        createSnapshotChangeSpecificItem(params.inputContext),
        params.message.kind === 'ALERT'
          ? 'The note stays compact so it points back to Snapshot instead of becoming a stream of messages.'
          : 'Snapshot keeps the fuller review space, so this note stays brief on purpose.',
      ]);
    case 'DASHBOARD_REFERRAL':
      return createRationale(
        'Shown as a referral because Dashboard has useful context, but Snapshot is the steadier first read right now.',
        [
          'Snapshot is the surface PocketPilot uses for a calmer first look when top focus is still forming.',
          'Routing notes stay compact instead of turning into alerts.',
        ],
      );
    case 'TRADE_HUB_GUARDED_STOP':
      return createRationale(
        'Shown as a guarded stop because Trade Hub should keep the current boundary visible instead of carrying the path further.',
        [
          'Trade Hub keeps the plan visible as read-only context when the path cannot continue here.',
          'The note is informational only and does not start an order path.',
        ],
      );
    default:
      return createUnavailableRationale('NO_MESSAGE');
  }
}
