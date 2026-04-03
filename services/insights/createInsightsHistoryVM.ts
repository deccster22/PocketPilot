import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type { EventType, MarketEvent } from '@/core/types/marketEvent';
import type { OrientationContext } from '@/services/orientation/createOrientationContext';

import type { EventHistoryEntry, EventHistorySection, InsightsHistoryVM } from './types';

const MAX_ITEMS_PER_SECTION = 3;
const MIN_INTERPRETED_ENTRY_COUNT = 2;

type StoryGroup = {
  storyKey: string;
  event: MarketEvent;
  count: number;
};

function isMarketEvent(entry: EventLedgerEntry): entry is MarketEvent {
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

function createStoryGroups(
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

function createEstimatedContextSentence(event: MarketEvent): string | null {
  if (event.certainty !== 'estimated') {
    return null;
  }

  return 'Some supporting price context remained estimated.';
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

function createEntry(group: StoryGroup): EventHistoryEntry {
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
        eventKind: 'CONTEXT',
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
        eventKind: 'CONTEXT',
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
        eventKind: 'ALIGNMENT',
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
        eventKind: 'VOLATILITY',
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
        eventKind: 'STATE_CHANGE',
      };
    }
  }
}

function createSection(params: {
  id: string;
  title: string;
  groups: ReadonlyArray<StoryGroup>;
}): EventHistorySection | null {
  const items = params.groups.slice(0, MAX_ITEMS_PER_SECTION).map(createEntry);

  if (items.length === 0) {
    return null;
  }

  return {
    id: params.id,
    title: params.title,
    items,
  };
}

function countSectionItems(sections: ReadonlyArray<EventHistorySection>): number {
  return sections.reduce((sum, section) => sum + section.items.length, 0);
}

export function createInsightsHistoryVM(params: {
  generatedAt: string | null;
  history: ReadonlyArray<EventLedgerEntry>;
  orientationContext?: Pick<OrientationContext, 'historyContext'> | null;
}): InsightsHistoryVM {
  const history = params.history.filter(isMarketEvent);

  if (history.length === 0) {
    return {
      generatedAt: params.generatedAt,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_EVENT_HISTORY',
      },
    };
  }

  const sinceLastViewedEvents =
    params.orientationContext?.historyContext.eventsSinceLastViewed.filter(isMarketEvent) ?? [];
  const sinceLastCheckedGroups = createStoryGroups(sinceLastViewedEvents);
  const seenSinceLastCheckedStoryKeys = new Set(
    sinceLastCheckedGroups.map((group) => group.storyKey),
  );
  const recentHistoryGroups = createStoryGroups(history, seenSinceLastCheckedStoryKeys);
  const sections = [
    createSection({
      id: 'since-last-checked',
      title: 'Since last checked',
      groups: sinceLastCheckedGroups,
    }),
    createSection({
      id: sinceLastCheckedGroups.length > 0 ? 'earlier-context' : 'recent-history',
      title: sinceLastCheckedGroups.length > 0 ? 'Earlier context' : 'Recent history',
      groups: recentHistoryGroups,
    }),
  ].filter((section): section is EventHistorySection => Boolean(section));

  if (countSectionItems(sections) < MIN_INTERPRETED_ENTRY_COUNT) {
    return {
      generatedAt: params.generatedAt,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'INSUFFICIENT_INTERPRETED_HISTORY',
      },
    };
  }

  return {
    generatedAt: params.generatedAt,
    availability: {
      status: 'AVAILABLE',
      sections,
    },
  };
}
