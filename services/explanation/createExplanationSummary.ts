import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type {
  AlignmentState,
  Certainty,
  EventType,
  MarketEvent,
} from '@/core/types/marketEvent';
import type { OrientationContext } from '@/services/orientation/createOrientationContext';

import type { ExplanationAvailability, ExplanationConfidence, ExplanationLineageItem } from './types';

type ExplanationTarget = {
  symbol?: string;
  accountId?: string;
  strategyId?: string;
  eventType: EventType;
  alignmentState?: AlignmentState;
  certainty?: Certainty;
  timestamp: number;
};

function isMarketEvent(entry: EventLedgerEntry | MarketEvent | null | undefined): entry is MarketEvent {
  return Boolean(entry && 'strategyId' in entry && 'eventType' in entry && 'signalsTriggered' in entry);
}

function toIsoTimestamp(timestamp: number | null | undefined): string | null {
  if (timestamp === null || timestamp === undefined || !Number.isFinite(timestamp)) {
    return null;
  }

  return new Date(timestamp).toISOString();
}

function normaliseAlignmentState(
  alignmentState: AlignmentState | string | null | undefined,
): AlignmentState | null {
  if (!alignmentState) {
    return null;
  }

  const upperCased = alignmentState.toUpperCase().replace(/\s+/g, '_');

  if (
    upperCased === 'ALIGNED' ||
    upperCased === 'WATCHFUL' ||
    upperCased === 'NEEDS_REVIEW'
  ) {
    return upperCased;
  }

  return null;
}

function formatAlignmentState(alignmentState: AlignmentState | string | null | undefined): string | null {
  switch (normaliseAlignmentState(alignmentState)) {
    case 'ALIGNED':
      return 'aligned';
    case 'WATCHFUL':
      return 'watchful';
    case 'NEEDS_REVIEW':
      return 'needs review';
    default:
      return null;
  }
}

function formatSubject(symbol?: string): string {
  return symbol ?? 'This focus item';
}

function formatEventLabel(eventType: EventType, symbol?: string | null): string {
  switch (eventType) {
    case 'DATA_QUALITY':
      return symbol ? `${symbol} data context` : 'Data context';
    case 'ESTIMATED_PRICE':
      return symbol ? `${symbol} price context` : 'Price context';
    case 'MOMENTUM_BUILDING':
      return symbol ? `${symbol} momentum context` : 'Momentum context';
    case 'DIP_DETECTED':
      return symbol ? `${symbol} pullback context` : 'Pullback context';
    default:
      return symbol ? `${symbol} price movement` : 'Price movement';
  }
}

function formatEventDetail(eventType: EventType, symbol?: string | null): string {
  const subject = formatSubject(symbol ?? undefined);

  switch (eventType) {
    case 'DATA_QUALITY':
      return `${subject} remains in focus because data quality limits are part of the current interpreted picture.`;
    case 'ESTIMATED_PRICE':
      return `${subject} remains in focus because pricing context is still estimated in the current interpreted picture.`;
    case 'MOMENTUM_BUILDING':
      return `${subject} remains in focus because momentum is strengthening in the current interpreted picture.`;
    case 'DIP_DETECTED':
      return `${subject} remains in focus because a measured pullback is part of the current interpreted picture.`;
    default:
      return `${subject} remains in focus because recent price movement kept it active in the current interpreted picture.`;
  }
}

function createMarketEventLineageItem(event: MarketEvent | ExplanationTarget): ExplanationLineageItem {
  return {
    kind: 'MARKET_EVENT',
    label: formatEventLabel(event.eventType, event.symbol),
    detail: formatEventDetail(event.eventType, event.symbol),
    timestamp: toIsoTimestamp(event.timestamp),
  };
}

function createStateTransitionLineageItem(params: {
  target: ExplanationTarget;
  strategyAlignment?: string | null;
  currentCertainty?: Certainty | null;
}): ExplanationLineageItem | null {
  const alignmentState =
    formatAlignmentState(params.target.alignmentState) ??
    formatAlignmentState(params.strategyAlignment);
  const certainty = params.target.certainty ?? params.currentCertainty ?? null;

  if (!alignmentState && !certainty) {
    return null;
  }

  const detailParts = [];

  if (alignmentState) {
    detailParts.push(`The current interpreted state reads ${alignmentState}.`);
  }

  if (certainty === 'confirmed') {
    detailParts.push('The current pricing context is confirmed.');
  } else if (certainty === 'estimated') {
    detailParts.push('Some of the current pricing context remains estimated.');
  }

  return {
    kind: 'STATE_TRANSITION',
    label: 'Current interpreted state',
    detail: detailParts.join(' '),
    timestamp: toIsoTimestamp(params.target.timestamp),
  };
}

function createHistoryContextLineageItem(params: {
  count: number;
  latestTimestamp: number | null;
}): ExplanationLineageItem | null {
  if (params.count <= 0) {
    return null;
  }

  const detail =
    params.count === 1
      ? 'One recent interpreted event since the last check still supports this picture.'
      : `${params.count} recent interpreted events since the last check still support this picture.`;

  return {
    kind: 'CONTEXT',
    label: 'Recent interpreted history',
    detail,
    timestamp: toIsoTimestamp(params.latestTimestamp),
  };
}

function matchesTarget(event: MarketEvent, target: ExplanationTarget): boolean {
  if (target.symbol) {
    return event.symbol === target.symbol;
  }

  if (target.strategyId) {
    return event.strategyId === target.strategyId;
  }

  if (target.accountId) {
    return event.accountId === target.accountId;
  }

  return false;
}

function isSameEvent(left: MarketEvent | null, right: MarketEvent | null): boolean {
  if (!left || !right) {
    return false;
  }

  return (
    left.eventId === right.eventId &&
    left.timestamp === right.timestamp &&
    left.accountId === right.accountId &&
    left.strategyId === right.strategyId
  );
}

function sortEventsDescending(events: ReadonlyArray<MarketEvent>): MarketEvent[] {
  return [...events].sort((left, right) => {
    const timestampDiff = right.timestamp - left.timestamp;
    if (timestampDiff !== 0) {
      return timestampDiff;
    }

    return right.eventId.localeCompare(left.eventId);
  });
}

function sanitiseLineage(items: ReadonlyArray<ExplanationLineageItem | null>): ExplanationLineageItem[] {
  const result: ExplanationLineageItem[] = [];
  const seenKeys = new Set<string>();

  for (const item of items) {
    if (!item) {
      continue;
    }

    const key = `${item.kind}:${item.label}:${item.detail}:${item.timestamp ?? 'none'}`;
    if (seenKeys.has(key)) {
      continue;
    }

    seenKeys.add(key);
    result.push(item);

    if (result.length === 3) {
      break;
    }
  }

  return result;
}

function createSummary(params: {
  target: ExplanationTarget;
  strategyAlignment?: string | null;
  supportingHistoryCount: number;
}): string {
  const subject = formatSubject(params.target.symbol);
  const alignmentState =
    formatAlignmentState(params.target.alignmentState) ??
    formatAlignmentState(params.strategyAlignment);

  const summaryParts = [formatEventDetail(params.target.eventType, params.target.symbol)];

  if (alignmentState) {
    summaryParts.push(`The current interpreted state reads ${alignmentState}.`);
  }

  if (params.supportingHistoryCount > 0) {
    summaryParts.push('Recent interpreted history still supports that reading.');
  }

  return summaryParts
    .join(' ')
    .replace(`${subject} remains in focus because`, `${subject} is in focus because`);
}

function resolveConfidence(params: {
  hasPrimaryEvent: boolean;
  hasStateContext: boolean;
  hasSupportingHistory: boolean;
  hasConfirmedContext: boolean;
}): ExplanationConfidence {
  if (
    params.hasPrimaryEvent &&
    params.hasStateContext &&
    params.hasSupportingHistory &&
    params.hasConfirmedContext
  ) {
    return 'HIGH';
  }

  if (
    (params.hasPrimaryEvent && params.hasStateContext) ||
    (params.hasPrimaryEvent && params.hasSupportingHistory) ||
    (params.hasStateContext && params.hasSupportingHistory)
  ) {
    return 'MODERATE';
  }

  return 'LOW';
}

function createConfidenceNote(confidence: ExplanationConfidence): string {
  switch (confidence) {
    case 'HIGH':
      return 'Confidence is high because the current event, recent history, and current state support the same interpretation. It reflects evidence support, not a guaranteed outcome.';
    case 'MODERATE':
      return 'Confidence is moderate because more than one prepared input supports this interpretation. It reflects evidence support, not a guaranteed outcome.';
    default:
      return 'Confidence is low because this interpretation rests on a narrow prepared picture. It reflects evidence support, not a guaranteed outcome.';
  }
}

function createLimitations(params: {
  hasEstimatedContext: boolean;
  hasSupportingHistory: boolean;
}): string[] {
  const limitations = ['This explanation reflects current interpreted conditions only.'];

  if (params.hasEstimatedContext) {
    limitations.push('Some supporting context remains estimated.');
  } else if (!params.hasSupportingHistory) {
    limitations.push('Support is drawn from a narrow interpreted context right now.');
  }

  return limitations.slice(0, 2);
}

export function createExplanationSummary(params: {
  surface: 'DASHBOARD_PRIME';
  target?: ExplanationTarget | null;
  currentEvent?: MarketEvent | null;
  orientationContext: Pick<OrientationContext, 'currentState' | 'historyContext'>;
}): ExplanationAvailability {
  if (params.surface !== 'DASHBOARD_PRIME') {
    return {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    };
  }

  if (!params.target) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_EXPLANATION_TARGET',
    };
  }

  const latestRelevantEvent = isMarketEvent(params.orientationContext.currentState.latestRelevantEvent)
    ? params.orientationContext.currentState.latestRelevantEvent
    : null;
  const supportingHistory = sortEventsDescending(
    params.orientationContext.historyContext.eventsSinceLastViewed
      .filter(isMarketEvent)
      .filter((event) => matchesTarget(event, params.target as ExplanationTarget)),
  );
  const primaryEvent =
    params.currentEvent ??
    (latestRelevantEvent && matchesTarget(latestRelevantEvent, params.target)
      ? latestRelevantEvent
      : null);
  const historySupportCount = primaryEvent
    ? supportingHistory.filter((event) => !isSameEvent(event, primaryEvent)).length
    : supportingHistory.length;
  const currentAlignmentState =
    formatAlignmentState(params.target.alignmentState) ??
    formatAlignmentState(params.orientationContext.currentState.strategyAlignment);
  const hasConfirmedContext =
    (params.target.certainty ?? params.orientationContext.currentState.certainty) === 'confirmed';
  const hasEstimatedContext =
    (params.target.certainty ?? params.orientationContext.currentState.certainty) === 'estimated' ||
    supportingHistory.some((event) => event.certainty === 'estimated');

  if (!primaryEvent && !currentAlignmentState && historySupportCount === 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'INSUFFICIENT_INTERPRETED_CONTEXT',
    };
  }

  const historyContextLineage = createHistoryContextLineageItem({
    count: historySupportCount,
    latestTimestamp:
      supportingHistory.find((event) => !isSameEvent(event, primaryEvent ?? null))?.timestamp ?? null,
  });
  const confidence = resolveConfidence({
    hasPrimaryEvent: Boolean(primaryEvent),
    hasStateContext: Boolean(currentAlignmentState),
    hasSupportingHistory: historySupportCount > 0,
    hasConfirmedContext,
  });

  return {
    status: 'AVAILABLE',
    explanation: {
      title: params.target.symbol
        ? `Why ${params.target.symbol} is in focus`
        : 'Why this is in focus',
      summary: createSummary({
        target: params.target,
        strategyAlignment: params.orientationContext.currentState.strategyAlignment,
        supportingHistoryCount: historySupportCount,
      }),
      confidence,
      confidenceNote: createConfidenceNote(confidence),
      lineage: sanitiseLineage([
        primaryEvent ? createMarketEventLineageItem(primaryEvent) : createMarketEventLineageItem(params.target),
        createStateTransitionLineageItem({
          target: params.target,
          strategyAlignment: params.orientationContext.currentState.strategyAlignment,
          currentCertainty: params.orientationContext.currentState.certainty,
        }),
        historyContextLineage,
      ]),
      limitations: createLimitations({
        hasEstimatedContext,
        hasSupportingHistory: historySupportCount > 0,
      }),
    },
  };
}
