import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type { AlignmentState, EventType, MarketEvent } from '@/core/types/marketEvent';

import {
  createStoryGroups,
  isMarketEvent,
  type StoryGroup,
} from '@/services/insights/historyInterpretation';
import {
  createReflectionPeriodWindow,
  formatReflectionPeriodTitle,
} from '@/services/insights/periodSummaryShared';
import type {
  PeriodSummaryItem,
  PeriodSummaryVM,
  ReflectionPeriod,
} from '@/services/insights/types';

type PeriodTheme = 'MOMENTUM' | 'PULLBACK' | 'PRICE_SHIFT' | 'PROVISIONAL';

type PeriodProfile = {
  dominantTheme: PeriodTheme | null;
  dominantAlignment: AlignmentState | null;
  topSymbol: string | null;
  hasProvisionalContext: boolean;
  eventCount: number;
  groupCount: number;
};

const MIN_PERIOD_EVENT_COUNT = 2;

function createUnavailableVM(
  generatedAt: string,
  reason: Extract<PeriodSummaryVM['availability'], { status: 'UNAVAILABLE' }>['reason'],
): PeriodSummaryVM {
  return {
    generatedAt,
    availability: {
      status: 'UNAVAILABLE',
      reason,
    },
  };
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

function mapEventTypeToTheme(eventType: EventType): PeriodTheme {
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

function createPeriodProfile(groups: ReadonlyArray<StoryGroup>, eventCount: number): PeriodProfile {
  const themeScores = new Map<PeriodTheme, { score: number; firstIndex: number }>();
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
    eventCount,
    groupCount: groups.length,
  };
}

function createPeriodSliceProfiles(history: ReadonlyArray<MarketEvent>): {
  newerProfile: PeriodProfile;
  earlierProfile: PeriodProfile;
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
    newerProfile: createPeriodProfile(createStoryGroups(newerEvents), newerEvents.length),
    earlierProfile: createPeriodProfile(createStoryGroups(earlierEvents), earlierEvents.length),
  };
}

function formatThemePhrase(theme: PeriodTheme | null): string | null {
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

function formatAlignmentPhrase(alignment: AlignmentState | null): string | null {
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

function capitalize(text: string): string {
  return text.length > 0 ? `${text[0].toUpperCase()}${text.slice(1)}` : text;
}

function createSummary(params: {
  period: ReflectionPeriod;
  overallProfile: PeriodProfile;
  newerProfile: PeriodProfile | null;
  earlierProfile: PeriodProfile | null;
}): string {
  const title = formatReflectionPeriodTitle(params.period);
  const newerTheme = formatThemePhrase(params.newerProfile?.dominantTheme ?? null);
  const earlierTheme = formatThemePhrase(params.earlierProfile?.dominantTheme ?? null);
  const overallTheme = formatThemePhrase(params.overallProfile.dominantTheme);

  if (
    newerTheme &&
    earlierTheme &&
    params.newerProfile?.dominantTheme !== params.earlierProfile?.dominantTheme
  ) {
    return `${title} moved from ${earlierTheme} toward ${newerTheme} in interpreted history.`;
  }

  if (overallTheme) {
    return `${title} stayed centered more on ${overallTheme} than on a new interpreted pattern.`;
  }

  return `${title} stayed brief and descriptive because interpreted history in this period was limited.`;
}

function createFocusItem(profile: PeriodProfile): PeriodSummaryItem | null {
  const themePhrase = formatThemePhrase(profile.dominantTheme);

  if (!themePhrase) {
    return null;
  }

  return {
    label: 'What stayed most visible',
    value: `${capitalize(themePhrase)} appeared most often in this period's interpreted history.`,
    emphasis: 'NEUTRAL',
  };
}

function createDevelopmentItem(params: {
  overallProfile: PeriodProfile;
  newerProfile: PeriodProfile | null;
  earlierProfile: PeriodProfile | null;
}): PeriodSummaryItem | null {
  const newerTheme = formatThemePhrase(params.newerProfile?.dominantTheme ?? null);
  const earlierTheme = formatThemePhrase(params.earlierProfile?.dominantTheme ?? null);

  if (
    newerTheme &&
    earlierTheme &&
    params.newerProfile?.dominantTheme !== params.earlierProfile?.dominantTheme
  ) {
    return {
      label: 'How the period developed',
      value: `The later part leaned more on ${newerTheme}, while the earlier part leaned more on ${earlierTheme}.`,
      emphasis: 'SHIFT',
    };
  }

  const newerAlignment = formatAlignmentPhrase(params.newerProfile?.dominantAlignment ?? null);
  const earlierAlignment = formatAlignmentPhrase(params.earlierProfile?.dominantAlignment ?? null);

  if (
    newerAlignment &&
    earlierAlignment &&
    params.newerProfile?.dominantAlignment !== params.earlierProfile?.dominantAlignment
  ) {
    return {
      label: 'How the period developed',
      value: `The later part moved from ${earlierAlignment} toward ${newerAlignment}.`,
      emphasis: 'SHIFT',
    };
  }

  const overallTheme = formatThemePhrase(params.overallProfile.dominantTheme);

  if (!overallTheme) {
    return null;
  }

  return {
    label: 'How the period developed',
    value: `The period stayed centered on ${overallTheme} rather than taking on a different interpreted pattern.`,
    emphasis: 'NEUTRAL',
  };
}

function createContextOrRecurringItem(profile: PeriodProfile): PeriodSummaryItem | null {
  if (profile.hasProvisionalContext) {
    return {
      label: 'Context note',
      value:
        'Some supporting price context stayed estimated or partial, so this summary remains directional rather than exhaustive.',
      emphasis: 'CONTEXT',
    };
  }

  if (profile.topSymbol) {
    return {
      label: 'Recurring symbol',
      value: `${profile.topSymbol} appeared most often in interpreted notes across this period.`,
      emphasis: 'NEUTRAL',
    };
  }

  const alignmentPhrase = formatAlignmentPhrase(profile.dominantAlignment);

  if (!alignmentPhrase) {
    return null;
  }

  return {
    label: 'Interpreted posture',
    value: `Notes more often stayed ${alignmentPhrase}.`,
    emphasis: 'NEUTRAL',
  };
}

function createLimitations(profile: PeriodProfile): string[] {
  const limitations: string[] = [];

  if (profile.eventCount < 4) {
    limitations.push(
      'This summary is drawn from a lighter stretch of interpreted history, so it stays brief.',
    );
  }

  if (profile.groupCount === 1) {
    limitations.push(
      'Most of this period returned to one recurring interpreted pattern, so the summary emphasizes continuity over change.',
    );
  }

  return limitations;
}

export function createPeriodSummaryVM(params: {
  generatedAt: string;
  history: ReadonlyArray<EventLedgerEntry>;
  period: ReflectionPeriod | null;
}): PeriodSummaryVM {
  if (!params.period) {
    return createUnavailableVM(params.generatedAt, 'NO_PERIOD_SELECTED');
  }

  const window = createReflectionPeriodWindow(params.period, params.generatedAt);
  const periodHistory = params.history
    .filter(isMarketEvent)
    .filter((event) => event.timestamp >= window.startAtMs && event.timestamp < window.endAtMs);

  if (periodHistory.length < MIN_PERIOD_EVENT_COUNT) {
    return createUnavailableVM(params.generatedAt, 'INSUFFICIENT_HISTORY');
  }

  const groups = createStoryGroups(periodHistory);
  const overallProfile = createPeriodProfile(groups, periodHistory.length);
  const sliceProfiles = createPeriodSliceProfiles(periodHistory);
  const items = [
    createFocusItem(overallProfile),
    createDevelopmentItem({
      overallProfile,
      newerProfile: sliceProfiles?.newerProfile ?? null,
      earlierProfile: sliceProfiles?.earlierProfile ?? null,
    }),
    createContextOrRecurringItem(overallProfile),
  ].filter((item): item is PeriodSummaryItem => Boolean(item));

  return {
    generatedAt: params.generatedAt,
    availability: {
      status: 'AVAILABLE',
      period: params.period,
      title: formatReflectionPeriodTitle(params.period),
      summary: createSummary({
        period: params.period,
        overallProfile,
        newerProfile: sliceProfiles?.newerProfile ?? null,
        earlierProfile: sliceProfiles?.earlierProfile ?? null,
      }),
      items,
      limitations: createLimitations(overallProfile),
    },
  };
}
