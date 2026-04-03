import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type {
  AlignmentState,
  Certainty,
  EventType,
  MarketEvent,
} from '@/core/types/marketEvent';
import type { OrientationContext } from '@/services/orientation/createOrientationContext';

import type { ExplanationLineageItem } from './types';

export type ExplanationTarget = {
  symbol?: string;
  accountId?: string;
  strategyId?: string;
  eventType: EventType;
  alignmentState?: AlignmentState;
  certainty?: Certainty;
  timestamp: number;
};

export type SelectedExplanationLineage = {
  items: ReadonlyArray<ExplanationLineageItem>;
  primaryEvent: MarketEvent | null;
  supportingHistoryCount: number;
  hasStateContext: boolean;
  hasEstimatedHistoryContext: boolean;
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

export function formatAlignmentState(
  alignmentState: AlignmentState | string | null | undefined,
): string | null {
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

export function formatSubject(symbol?: string): string {
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

function createPrimaryEventDetail(eventType: EventType, symbol?: string | null): string {
  const subject = formatSubject(symbol ?? undefined);

  switch (eventType) {
    case 'DATA_QUALITY':
      return `${subject} stays in focus because data quality limits are still shaping the current read.`;
    case 'ESTIMATED_PRICE':
      return `${subject} stays in focus because some of the current price context is still estimated.`;
    case 'MOMENTUM_BUILDING':
      return `${subject} stays in focus because momentum has continued to build in the current read.`;
    case 'DIP_DETECTED':
      return `${subject} stays in focus because a measured pullback is still part of the current read.`;
    default:
      return `${subject} stays in focus because recent price movement is still shaping the current read.`;
  }
}

function createSupportingEventDetail(event: MarketEvent): string {
  const subject = event.symbol ?? 'this focus item';

  switch (event.eventType) {
    case 'DATA_QUALITY':
      return `A recent interpreted data-quality limit still shapes how ${subject} is being read.`;
    case 'ESTIMATED_PRICE':
      return `Recent interpreted pricing context for ${subject} is still partly estimated.`;
    case 'MOMENTUM_BUILDING':
      return `A recent interpreted momentum build still supports the current reading for ${subject}.`;
    case 'DIP_DETECTED':
      return `A recent interpreted pullback still supports the current reading for ${subject}.`;
    default:
      return `A recent interpreted price move still supports the current reading for ${subject}.`;
  }
}

function createMarketEventLineageItem(
  event: MarketEvent | ExplanationTarget,
  role: 'PRIMARY' | 'SUPPORTING',
): ExplanationLineageItem {
  const detail =
    role === 'PRIMARY'
      ? createPrimaryEventDetail(event.eventType, event.symbol)
      : createSupportingEventDetail(event as MarketEvent);

  return {
    kind: 'MARKET_EVENT',
    label: formatEventLabel(event.eventType, event.symbol),
    detail,
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

  if (alignmentState && certainty === 'estimated') {
    return {
      kind: 'STATE_TRANSITION',
      label: 'Current interpreted state',
      detail: `The current interpreted state reads ${alignmentState}, with part of the supporting price context still estimated.`,
      timestamp: toIsoTimestamp(params.target.timestamp),
    };
  }

  if (alignmentState) {
    return {
      kind: 'STATE_TRANSITION',
      label: 'Current interpreted state',
      detail: `The current interpreted state reads ${alignmentState}.`,
      timestamp: toIsoTimestamp(params.target.timestamp),
    };
  }

  if (certainty !== 'estimated') {
    return null;
  }

  return {
    kind: 'STATE_TRANSITION',
    label: 'Current interpreted state',
    detail: 'Some of the current supporting price context remains estimated.',
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
      ? 'One recent interpreted update since the last check still supports this picture.'
      : `${params.count} recent interpreted updates since the last check still support this picture.`;

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

function getEventWeight(eventType: EventType): number {
  switch (eventType) {
    case 'DATA_QUALITY':
      return 5;
    case 'ESTIMATED_PRICE':
      return 4;
    case 'MOMENTUM_BUILDING':
    case 'DIP_DETECTED':
      return 3;
    default:
      return 1;
  }
}

function sortEventsDescending(events: ReadonlyArray<MarketEvent>): MarketEvent[] {
  return [...events].sort((left, right) => {
    const weightDiff = getEventWeight(right.eventType) - getEventWeight(left.eventType);
    if (weightDiff !== 0) {
      return weightDiff;
    }

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

    const key = `${item.kind}:${item.label}:${item.detail}`;
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

function selectSupportingHistoryLineageItem(params: {
  events: ReadonlyArray<MarketEvent>;
  primaryEventType: EventType;
  currentCertainty?: Certainty | null;
}): ExplanationLineageItem | null {
  if (params.events.length === 0) {
    return null;
  }

  const distinctSupport = sortEventsDescending(params.events).find((event) => {
    if (event.eventType === params.primaryEventType) {
      return false;
    }

    if (event.eventType === 'PRICE_MOVEMENT') {
      return false;
    }

    if (event.eventType === 'ESTIMATED_PRICE' && params.currentCertainty === 'estimated') {
      return false;
    }

    return true;
  });

  if (distinctSupport) {
    return createMarketEventLineageItem(distinctSupport, 'SUPPORTING');
  }

  return createHistoryContextLineageItem({
    count: params.events.length,
    latestTimestamp: params.events.reduce<number | null>(
      (latest, event) => (latest === null || event.timestamp > latest ? event.timestamp : latest),
      null,
    ),
  });
}

export function selectExplanationLineage(params: {
  target: ExplanationTarget;
  currentEvent?: MarketEvent | null;
  orientationContext: Pick<OrientationContext, 'currentState' | 'historyContext'>;
}): SelectedExplanationLineage {
  const latestRelevantEvent = isMarketEvent(params.orientationContext.currentState.latestRelevantEvent)
    ? params.orientationContext.currentState.latestRelevantEvent
    : null;
  const effectiveCertainty =
    params.target.certainty ?? params.orientationContext.currentState.certainty ?? null;
  const supportingHistory = sortEventsDescending(
    params.orientationContext.historyContext.eventsSinceLastViewed
      .filter(isMarketEvent)
      .filter((event) => matchesTarget(event, params.target)),
  );
  const primaryEvent =
    params.currentEvent ??
    (latestRelevantEvent && matchesTarget(latestRelevantEvent, params.target)
      ? latestRelevantEvent
      : null);
  const supportingHistoryWithoutPrimary = primaryEvent
    ? supportingHistory.filter((event) => !isSameEvent(event, primaryEvent))
    : supportingHistory;
  const stateItem = createStateTransitionLineageItem({
    target: params.target,
    strategyAlignment: params.orientationContext.currentState.strategyAlignment,
    currentCertainty: params.orientationContext.currentState.certainty,
  });
  const historyItem = selectSupportingHistoryLineageItem({
    events: supportingHistoryWithoutPrimary,
    primaryEventType: primaryEvent?.eventType ?? params.target.eventType,
    currentCertainty: effectiveCertainty,
  });
  const fallbackPrimary =
    primaryEvent || stateItem || historyItem
      ? createMarketEventLineageItem(primaryEvent ?? params.target, 'PRIMARY')
      : null;

  return {
    items: sanitiseLineage([fallbackPrimary, stateItem, historyItem]),
    primaryEvent,
    supportingHistoryCount: supportingHistoryWithoutPrimary.length,
    hasStateContext: Boolean(stateItem),
    hasEstimatedHistoryContext: supportingHistoryWithoutPrimary.some(
      (event) => event.certainty === 'estimated',
    ),
  };
}
