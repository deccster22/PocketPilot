import type { AlignmentState, EventType, MarketEvent } from '@/core/types/marketEvent';
import { createStoryGroups } from '@/services/insights/historyInterpretation';

export type ReviewTheme = 'MOMENTUM' | 'PULLBACK' | 'PRICE_SHIFT' | 'PROVISIONAL';

export type ReviewProfile = {
  dominantTheme: ReviewTheme | null;
  dominantAlignment: AlignmentState | null;
  topSymbol: string | null;
  hasProvisionalContext: boolean;
  eventCount: number;
  groupCount: number;
};

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

function mapEventTypeToTheme(eventType: EventType): ReviewTheme {
  switch (eventType) {
    case 'MOMENTUM_BUILDING':
      return 'MOMENTUM';
    case 'DIP_DETECTED':
      return 'PULLBACK';
    case 'ESTIMATED_PRICE':
    case 'DATA_QUALITY':
      return 'PROVISIONAL';
    default:
      return 'PRICE_SHIFT';
  }
}

function addWeightedValue<K extends string>(
  map: Map<K, { score: number; firstIndex: number }>,
  key: K,
  weight: number,
  index: number,
) {
  const existing = map.get(key);

  if (existing) {
    existing.score += weight;
    return;
  }

  map.set(key, {
    score: weight,
    firstIndex: index,
  });
}

function getDominantKey<K extends string>(
  map: Map<K, { score: number; firstIndex: number }>,
): K | null {
  const [topEntry] = [...map.entries()].sort((left, right) => {
    const scoreDiff = right[1].score - left[1].score;
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    const firstIndexDiff = left[1].firstIndex - right[1].firstIndex;
    if (firstIndexDiff !== 0) {
      return firstIndexDiff;
    }

    return left[0].localeCompare(right[0]);
  });

  return topEntry?.[0] ?? null;
}

function createReviewProfileFromEvents(events: ReadonlyArray<MarketEvent>): ReviewProfile {
  const groups = createStoryGroups(events);
  const themeScores = new Map<ReviewTheme, { score: number; firstIndex: number }>();
  const alignmentScores = new Map<AlignmentState, { score: number; firstIndex: number }>();
  const symbolScores = new Map<string, { score: number; firstIndex: number }>();
  let hasProvisionalContext = false;

  groups.forEach((group, index) => {
    addWeightedValue(themeScores, mapEventTypeToTheme(group.event.eventType), group.count, index);
    addWeightedValue(alignmentScores, group.event.alignmentState, group.count, index);

    if (group.event.symbol) {
      addWeightedValue(symbolScores, group.event.symbol, group.count, index);
    }

    if (group.event.certainty === 'estimated' || group.event.eventType === 'DATA_QUALITY') {
      hasProvisionalContext = true;
    }
  });

  return {
    dominantTheme: getDominantKey(themeScores),
    dominantAlignment: getDominantKey(alignmentScores),
    topSymbol: getDominantKey(symbolScores),
    hasProvisionalContext,
    eventCount: events.length,
    groupCount: groups.length,
  };
}

export function createReviewProfile(events: ReadonlyArray<MarketEvent>): ReviewProfile {
  return createReviewProfileFromEvents(events);
}

export function createReviewSliceProfiles(history: ReadonlyArray<MarketEvent>): {
  newerProfile: ReviewProfile;
  earlierProfile: ReviewProfile;
} | null {
  if (history.length < 2) {
    return null;
  }

  const sortedEvents = sortMarketEvents(history);
  const midpoint = Math.ceil(sortedEvents.length / 2);
  const newerEvents = sortedEvents.slice(0, midpoint);
  const earlierEvents = sortedEvents.slice(midpoint);

  if (newerEvents.length === 0 || earlierEvents.length === 0) {
    return null;
  }

  return {
    newerProfile: createReviewProfileFromEvents(newerEvents),
    earlierProfile: createReviewProfileFromEvents(earlierEvents),
  };
}

export function formatReviewThemePhrase(theme: ReviewTheme | null): string | null {
  switch (theme) {
    case 'MOMENTUM':
      return 'building momentum';
    case 'PULLBACK':
      return 'measured pullbacks';
    case 'PROVISIONAL':
      return 'provisional context';
    case 'PRICE_SHIFT':
      return 'price shifts';
    default:
      return null;
  }
}

export function formatReviewAlignmentPhrase(alignment: AlignmentState | null): string | null {
  switch (alignment) {
    case 'ALIGNED':
      return 'aligned rather than conflicted';
    case 'NEEDS_REVIEW':
      return 'in review rather than settled';
    case 'WATCHFUL':
      return 'watchful rather than settled';
    default:
      return null;
  }
}

export function capitalize(text: string): string {
  return text.length > 0 ? `${text[0].toUpperCase()}${text.slice(1)}` : text;
}
