import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type { AlignmentState, EventType, MarketEvent } from '@/core/types/marketEvent';
import type { OrientationContext } from '@/services/orientation/createOrientationContext';

import type {
  EventHistoryEntry,
  EventHistorySection,
  InsightsArchiveSection,
  InsightsDetailEntry,
  InsightsEventKind,
} from './types';
import { INSIGHTS_LAST_VIEWED_SECTION_ID } from './types';

export type StoryGroup = {
  storyKey: string;
  event: MarketEvent;
  count: number;
};

export type StorySection = {
  id: string;
  title: string;
  groups: ReadonlyArray<StoryGroup>;
};

export function isMarketEvent(entry: EventLedgerEntry): entry is MarketEvent {
  return 'strategyId' in entry && 'eventType' in entry && 'signalsTriggered' in entry;
}

function prioritiseEventType(eventType: EventType): number {
  switch (eventType) {
    case 'DATA_QUALITY':
      return 0;
    case 'ESTIMATED_PRICE':
      return 1;
    case 'DIP_DETECTED':
      return 2;
    case 'MOMENTUM_BUILDING':
      return 3;
    default:
      return 4;
  }
}

function sortMarketEvents(events: ReadonlyArray<MarketEvent>): MarketEvent[] {
  return [...events].sort((left, right) => {
    const timestampDiff = right.timestamp - left.timestamp;
    if (timestampDiff !== 0) {
      return timestampDiff;
    }

    const priorityDiff = prioritiseEventType(left.eventType) - prioritiseEventType(right.eventType);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return left.eventId.localeCompare(right.eventId);
  });
}

function createStoryKey(event: MarketEvent): string {
  return [
    event.eventType,
    event.symbol ?? 'account',
    event.alignmentState,
    event.certainty,
  ].join(':');
}

export function createStoryGroups(
  events: ReadonlyArray<MarketEvent>,
  excludedStoryKeys: ReadonlySet<string> = new Set<string>(),
): StoryGroup[] {
  const groups = new Map<string, StoryGroup>();

  sortMarketEvents(events).forEach((event) => {
    const storyKey = createStoryKey(event);

    if (excludedStoryKeys.has(storyKey)) {
      return;
    }

    const existingGroup = groups.get(storyKey);

    if (existingGroup) {
      existingGroup.count += 1;
      return;
    }

    groups.set(storyKey, {
      storyKey,
      event,
      count: 1,
    });
  });

  return [...groups.values()];
}

function createStoryContinuationSentence(count: number): string | null {
  if (count <= 1) {
    return null;
  }

  return `The same interpreted picture appeared across ${count} recent updates.`;
}

function createArchiveCompressionSentence(count: number): string | null {
  if (count <= 1) {
    return null;
  }

  return `This archive note stands in for ${count} closely related updates.`;
}

function createEstimatedContextSentence(event: MarketEvent): string | null {
  if (event.certainty !== 'estimated') {
    return null;
  }

  return 'Some supporting price context remained estimated.';
}

function createAlignmentSentence(alignmentState: AlignmentState): string {
  switch (alignmentState) {
    case 'ALIGNED':
      return 'The interpreted posture stayed aligned rather than conflicted.';
    case 'NEEDS_REVIEW':
      return 'The interpreted posture stayed in review rather than settled.';
    default:
      return 'The interpreted posture stayed watchful rather than settled.';
  }
}

function createContextSubject(symbol: string | null, fallback: string): string {
  return symbol ? `${fallback} for ${symbol}` : fallback;
}

function formatPctMovement(pctChange: number | null): string | null {
  if (pctChange === null) {
    return null;
  }

  if (pctChange === 0) {
    return 'held roughly flat';
  }

  return pctChange > 0
    ? `moved up by ${(pctChange * 100).toFixed(2)}%`
    : `moved down by ${Math.abs(pctChange * 100).toFixed(2)}%`;
}

function createEventKind(eventType: EventType): InsightsEventKind {
  switch (eventType) {
    case 'MOMENTUM_BUILDING':
      return 'ALIGNMENT';
    case 'DIP_DETECTED':
      return 'VOLATILITY';
    case 'DATA_QUALITY':
    case 'ESTIMATED_PRICE':
      return 'CONTEXT';
    case 'PRICE_MOVEMENT':
      return 'STATE_CHANGE';
    default:
      return 'OTHER';
  }
}

export function createEventHistoryEntry(group: StoryGroup): EventHistoryEntry {
  const { event } = group;
  const repeatedContext = createStoryContinuationSentence(group.count);
  const estimatedContext = createEstimatedContextSentence(event);

  switch (event.eventType) {
    case 'DATA_QUALITY':
      return {
        title: event.symbol ? `${event.symbol} context carried data limits` : 'Recent context carried data limits',
        summary: [
          event.symbol
            ? `Recent context for ${event.symbol} was recorded with data limits in view, so this read stayed partial rather than settled.`
            : 'Recent market context was recorded with data limits in view, so this read stayed partial rather than settled.',
          repeatedContext,
        ]
          .filter(Boolean)
          .join(' '),
        timestamp: new Date(event.timestamp).toISOString(),
        symbol: event.symbol,
        eventKind: createEventKind(event.eventType),
      };
    case 'ESTIMATED_PRICE':
      return {
        title: event.symbol ? `${event.symbol} price context stayed estimated` : 'Price context stayed estimated',
        summary: [
          event.symbol
            ? `Recent pricing context for ${event.symbol} remained estimated, so this part of the picture stayed provisional.`
            : 'Recent pricing context remained estimated, so this part of the picture stayed provisional.',
          repeatedContext,
        ]
          .filter(Boolean)
          .join(' '),
        timestamp: new Date(event.timestamp).toISOString(),
        symbol: event.symbol,
        eventKind: createEventKind(event.eventType),
      };
    case 'MOMENTUM_BUILDING':
      return {
        title: event.symbol ? `${event.symbol} momentum kept building` : 'Momentum kept building',
        summary: [
          event.symbol
            ? `Momentum around ${event.symbol} continued to build in recent interpreted history.`
            : 'Momentum continued to build in recent interpreted history.',
          repeatedContext,
          estimatedContext,
        ]
          .filter(Boolean)
          .join(' '),
        timestamp: new Date(event.timestamp).toISOString(),
        symbol: event.symbol,
        eventKind: createEventKind(event.eventType),
      };
    case 'DIP_DETECTED':
      return {
        title: event.symbol ? `${event.symbol} pullback entered view` : 'A pullback entered view',
        summary: [
          event.symbol
            ? `A measured pullback around ${event.symbol} entered recent interpreted history.`
            : 'A measured pullback entered recent interpreted history.',
          repeatedContext,
          estimatedContext,
        ]
          .filter(Boolean)
          .join(' '),
        timestamp: new Date(event.timestamp).toISOString(),
        symbol: event.symbol,
        eventKind: createEventKind(event.eventType),
      };
    default: {
      const movement = formatPctMovement(event.pctChange);
      const subject = createContextSubject(event.symbol, 'Price context');

      return {
        title: event.symbol ? `${event.symbol} price picture shifted` : 'The price picture shifted',
        summary: [
          movement
            ? `${subject} ${movement} in the recent interpreted picture.`
            : `${subject} shifted in the recent interpreted picture.`,
          repeatedContext,
          estimatedContext,
        ]
          .filter(Boolean)
          .join(' '),
        timestamp: new Date(event.timestamp).toISOString(),
        symbol: event.symbol,
        eventKind: createEventKind(event.eventType),
      };
    }
  }
}

function createDetailNote(group: StoryGroup): string | null {
  const { event } = group;
  const compressionSentence = createArchiveCompressionSentence(group.count);
  const alignmentSentence = createAlignmentSentence(event.alignmentState);
  const estimatedSentence = createEstimatedContextSentence(event);
  const movement = formatPctMovement(event.pctChange);

  switch (event.eventType) {
    case 'DATA_QUALITY':
      return [
        alignmentSentence,
        'This note stayed bounded by data limits rather than treated as a complete read.',
        compressionSentence,
      ]
        .filter(Boolean)
        .join(' ');
    case 'ESTIMATED_PRICE':
      return [
        alignmentSentence,
        'Estimated pricing context remained part of this note, so the interpretation stayed provisional.',
        compressionSentence,
      ]
        .filter(Boolean)
        .join(' ');
    case 'MOMENTUM_BUILDING':
      return [
        alignmentSentence,
        'This described continuing momentum rather than a single isolated jump.',
        estimatedSentence,
        compressionSentence,
      ]
        .filter(Boolean)
        .join(' ');
    case 'DIP_DETECTED':
      return [
        alignmentSentence,
        'This described a measured pullback entering view, not a dispatch signal.',
        estimatedSentence,
        compressionSentence,
      ]
        .filter(Boolean)
        .join(' ');
    default:
      return [
        alignmentSentence,
        movement
          ? `Within this interpreted window, price context ${movement}.`
          : 'This note captured a price shift within the interpreted window.',
        estimatedSentence ?? 'This note remained descriptive rather than prescriptive.',
        compressionSentence,
      ]
        .filter(Boolean)
        .join(' ');
  }
}

export function createInsightsDetailEntry(group: StoryGroup): InsightsDetailEntry {
  const baseEntry = createEventHistoryEntry(group);

  return {
    ...baseEntry,
    detailNote: createDetailNote(group),
  };
}

export function createInsightsStorySections(params: {
  history: ReadonlyArray<EventLedgerEntry>;
  orientationContext?: Pick<OrientationContext, 'historyContext'> | null;
}): StorySection[] {
  const history = params.history.filter(isMarketEvent);

  if (history.length === 0) {
    return [];
  }

  const sinceLastViewedEvents =
    params.orientationContext?.historyContext.eventsSinceLastViewed.filter(isMarketEvent) ?? [];
  const sinceLastViewedGroups = createStoryGroups(sinceLastViewedEvents);
  const seenSinceLastViewedStoryKeys = new Set(
    sinceLastViewedGroups.map((group) => group.storyKey),
  );
  const recentHistoryGroups = createStoryGroups(history, seenSinceLastViewedStoryKeys);

  return [
    {
      id: INSIGHTS_LAST_VIEWED_SECTION_ID,
      title: 'Since you last viewed Insights',
      groups: sinceLastViewedGroups,
    },
    {
      id: sinceLastViewedGroups.length > 0 ? 'earlier-context' : 'recent-history',
      title: sinceLastViewedGroups.length > 0 ? 'Earlier context' : 'Recent history',
      groups: recentHistoryGroups,
    },
  ].filter((section) => section.groups.length > 0);
}

export function createEventHistorySection(params: {
  id: string;
  title: string;
  groups: ReadonlyArray<StoryGroup>;
  limit: number;
}): EventHistorySection | null {
  const items = params.groups.slice(0, params.limit).map(createEventHistoryEntry);

  if (items.length === 0) {
    return null;
  }

  return {
    id: params.id,
    title: params.title,
    items,
  };
}

export function createInsightsArchiveSection(params: {
  id: string;
  title: string;
  groups: ReadonlyArray<StoryGroup>;
  limit: number;
}): InsightsArchiveSection | null {
  const items = params.groups.slice(0, params.limit).map(createInsightsDetailEntry);

  if (items.length === 0) {
    return null;
  }

  return {
    id: params.id,
    title: params.title,
    items,
  };
}

export function countSectionItems(
  sections: ReadonlyArray<{ items: ReadonlyArray<EventHistoryEntry | InsightsDetailEntry> }>,
): number {
  return sections.reduce((sum, section) => sum + section.items.length, 0);
}
