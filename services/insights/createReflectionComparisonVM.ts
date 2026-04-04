import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type { AlignmentState, EventType } from '@/core/types/marketEvent';
import {
  createInsightsStorySections,
  type StoryGroup,
  type StorySection,
} from '@/services/insights/historyInterpretation';
import type { OrientationContext } from '@/services/orientation/createOrientationContext';

import type {
  InsightsHistoryVM,
  ReflectionComparisonAvailability,
  ReflectionComparisonVM,
  ReflectionComparisonWindow,
  ReflectionSummaryItem,
} from './types';

type ReflectionStoryWindow = ReflectionComparisonWindow & {
  groups: ReadonlyArray<StoryGroup>;
};

type WindowTheme = 'MOMENTUM' | 'PULLBACK' | 'PRICE_SHIFT' | 'PROVISIONAL';

type WindowProfile = {
  dominantAlignment: AlignmentState | null;
  dominantTheme: WindowTheme | null;
  topSymbol: string | null;
  hasProvisionalContext: boolean;
};

function mapHistoryUnavailabilityReason(
  reason: Extract<InsightsHistoryVM['availability'], { status: 'UNAVAILABLE' }>['reason'],
): Extract<ReflectionComparisonAvailability, { status: 'UNAVAILABLE' }>['reason'] {
  switch (reason) {
    case 'NOT_ENABLED_FOR_SURFACE':
      return 'NOT_ENABLED_FOR_SURFACE';
    case 'INSUFFICIENT_INTERPRETED_HISTORY':
      return 'INSUFFICIENT_INTERPRETED_HISTORY';
    default:
      return 'NO_COMPARABLE_HISTORY';
  }
}

function createUnavailableVM(
  generatedAt: string | null,
  reason: Extract<ReflectionComparisonAvailability, { status: 'UNAVAILABLE' }>['reason'],
): ReflectionComparisonVM {
  return {
    generatedAt,
    availability: {
      status: 'UNAVAILABLE',
      reason,
    },
  };
}

function createWindowFromGroups(params: {
  id: string;
  title: string;
  groups: ReadonlyArray<StoryGroup>;
}): ReflectionStoryWindow {
  let startAtMs: number | null = null;
  let endAtMs: number | null = null;

  params.groups.forEach((group) => {
    if (startAtMs === null || group.event.timestamp < startAtMs) {
      startAtMs = group.event.timestamp;
    }

    if (endAtMs === null || group.event.timestamp > endAtMs) {
      endAtMs = group.event.timestamp;
    }
  });

  return {
    id: params.id,
    title: params.title,
    startAt: startAtMs === null ? null : new Date(startAtMs).toISOString(),
    endAt: endAtMs === null ? null : new Date(endAtMs).toISOString(),
    groups: params.groups,
  };
}

function splitSingleSectionWindow(
  section: StorySection,
): {
  leftWindow: ReflectionStoryWindow;
  rightWindow: ReflectionStoryWindow;
  limitations: string[];
} | null {
  if (section.groups.length < 2) {
    return null;
  }

  const midpoint = Math.ceil(section.groups.length / 2);
  const leftGroups = section.groups.slice(0, midpoint);
  const rightGroups = section.groups.slice(midpoint);

  if (leftGroups.length === 0 || rightGroups.length === 0) {
    return null;
  }

  return {
    leftWindow: createWindowFromGroups({
      id: 'more-recent-context',
      title: 'More recent context',
      groups: leftGroups,
    }),
    rightWindow: createWindowFromGroups({
      id: 'earlier-recent-context',
      title: 'Earlier recent context',
      groups: rightGroups,
    }),
    limitations: ['This comparison uses two nearby interpreted slices from recent history.'],
  };
}

function selectComparisonWindows(params: {
  sections: ReadonlyArray<StorySection>;
}):
  | {
      leftWindow: ReflectionStoryWindow;
      rightWindow: ReflectionStoryWindow;
      limitations: string[];
    }
  | null {
  if (params.sections.length >= 2) {
    return {
      leftWindow: createWindowFromGroups({
        id: params.sections[0].id,
        title: params.sections[0].title,
        groups: params.sections[0].groups,
      }),
      rightWindow: createWindowFromGroups({
        id: params.sections[1].id,
        title: params.sections[1].title,
        groups: params.sections[1].groups,
      }),
      limitations: [],
    };
  }

  const [singleSection] = params.sections;

  return singleSection ? splitSingleSectionWindow(singleSection) : null;
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

    const indexDiff = left[1].firstIndex - right[1].firstIndex;
    if (indexDiff !== 0) {
      return indexDiff;
    }

    return left[0].localeCompare(right[0]);
  });

  return topEntry?.[0] ?? null;
}

function mapEventTypeToTheme(eventType: EventType): WindowTheme {
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

function createWindowProfile(window: ReflectionStoryWindow): WindowProfile {
  const themeScores = new Map<WindowTheme, { score: number; firstIndex: number }>();
  const alignmentScores = new Map<AlignmentState, { score: number; firstIndex: number }>();
  const symbolScores = new Map<string, { score: number; firstIndex: number }>();
  let hasProvisionalContext = false;

  window.groups.forEach((group, index) => {
    addWeightedValue(
      themeScores,
      mapEventTypeToTheme(group.event.eventType),
      group.count,
      index,
    );
    addWeightedValue(alignmentScores, group.event.alignmentState, group.count, index);

    if (group.event.symbol) {
      addWeightedValue(symbolScores, group.event.symbol, group.count, index);
    }

    if (group.event.certainty === 'estimated' || group.event.eventType === 'DATA_QUALITY') {
      hasProvisionalContext = true;
    }
  });

  return {
    dominantAlignment: getDominantKey(alignmentScores),
    dominantTheme: getDominantKey(themeScores),
    topSymbol: getDominantKey(symbolScores),
    hasProvisionalContext,
  };
}

function formatThemePhrase(theme: WindowTheme | null): string | null {
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

function createThemeItem(params: {
  leftProfile: WindowProfile;
  rightProfile: WindowProfile;
}): ReflectionSummaryItem | null {
  const leftTheme = formatThemePhrase(params.leftProfile.dominantTheme);
  const rightTheme = formatThemePhrase(params.rightProfile.dominantTheme);

  if (!leftTheme || !rightTheme) {
    return null;
  }

  if (params.leftProfile.dominantTheme === params.rightProfile.dominantTheme) {
    return {
      title: 'Interpreted focus stayed steady',
      summary: `Both windows stayed centered more on ${leftTheme} than on a new pattern.`,
      emphasis: 'STABLE',
    };
  }

  return {
    title: 'Interpreted focus shifted',
    summary: `The newer window leaned more toward ${leftTheme}, while the earlier window was led more by ${rightTheme}.`,
    emphasis: 'SHIFT',
  };
}

function createAlignmentItem(params: {
  leftProfile: WindowProfile;
  rightProfile: WindowProfile;
}): ReflectionSummaryItem | null {
  const leftAlignment = formatAlignmentPhrase(params.leftProfile.dominantAlignment);
  const rightAlignment = formatAlignmentPhrase(params.rightProfile.dominantAlignment);

  if (!leftAlignment || !rightAlignment) {
    return null;
  }

  if (params.leftProfile.dominantAlignment === params.rightProfile.dominantAlignment) {
    return {
      title: 'Posture stayed consistent',
      summary: `Across both windows, the interpreted posture stayed ${leftAlignment}.`,
      emphasis: 'STABLE',
    };
  }

  return {
    title: 'Posture shifted',
    summary: `The interpreted posture moved from ${rightAlignment} toward ${leftAlignment} across the two windows.`,
    emphasis: 'SHIFT',
  };
}

function createSymbolItem(params: {
  leftProfile: WindowProfile;
  rightProfile: WindowProfile;
}): ReflectionSummaryItem | null {
  const { leftProfile, rightProfile } = params;

  if (!leftProfile.topSymbol || !rightProfile.topSymbol) {
    return null;
  }

  if (leftProfile.topSymbol === rightProfile.topSymbol) {
    return {
      title: 'The same symbol stayed in view',
      summary: `Across both windows, ${leftProfile.topSymbol} remained the clearest recurring symbol in interpreted history.`,
      emphasis: 'STABLE',
    };
  }

  return {
    title: 'Symbol focus changed',
    summary: `The newer window centered more on ${leftProfile.topSymbol}, while the earlier window leaned more toward ${rightProfile.topSymbol}.`,
    emphasis: 'SHIFT',
  };
}

function createContextItem(params: {
  leftProfile: WindowProfile;
  rightProfile: WindowProfile;
}): ReflectionSummaryItem | null {
  const leftHasContext = params.leftProfile.hasProvisionalContext;
  const rightHasContext = params.rightProfile.hasProvisionalContext;

  if (!leftHasContext && !rightHasContext) {
    return null;
  }

  if (leftHasContext && rightHasContext) {
    return {
      title: 'Supporting context stayed provisional',
      summary:
        'Some supporting price context remained estimated or partial in both windows, so this comparison stays directional rather than exhaustive.',
      emphasis: 'CONTEXT',
    };
  }

  if (leftHasContext) {
    return {
      title: 'The newer window stayed more provisional',
      summary:
        'Some supporting price context remained more provisional in the newer window, so that side stayed a little less settled.',
      emphasis: 'CONTEXT',
    };
  }

  return {
    title: 'Earlier context was more provisional',
    summary:
      'Earlier context carried more estimated or partial supporting pricing, while the newer window stayed a little less provisional.',
    emphasis: 'CONTEXT',
  };
}

function createSummaryItems(params: {
  leftWindow: ReflectionStoryWindow;
  rightWindow: ReflectionStoryWindow;
}): ReflectionSummaryItem[] {
  const leftProfile = createWindowProfile(params.leftWindow);
  const rightProfile = createWindowProfile(params.rightWindow);
  const items: ReflectionSummaryItem[] = [];
  const themeItem = createThemeItem({
    leftProfile,
    rightProfile,
  });
  const alignmentItem = createAlignmentItem({
    leftProfile,
    rightProfile,
  });
  const symbolItem = createSymbolItem({
    leftProfile,
    rightProfile,
  });
  const contextItem = createContextItem({
    leftProfile,
    rightProfile,
  });

  if (themeItem) {
    items.push(themeItem);
  }

  if (
    alignmentItem &&
    leftProfile.dominantAlignment !== rightProfile.dominantAlignment
  ) {
    items.push(alignmentItem);
  } else if (symbolItem) {
    items.push(symbolItem);
  } else if (alignmentItem) {
    items.push(alignmentItem);
  }

  if (contextItem) {
    items.push(contextItem);
  }

  return items.slice(0, 3);
}

export function createReflectionComparisonVM(params: {
  generatedAt: string | null;
  history: ReadonlyArray<EventLedgerEntry>;
  historyVM?: InsightsHistoryVM | null;
  orientationContext?: Pick<OrientationContext, 'historyContext'> | null;
}): ReflectionComparisonVM {
  if (params.historyVM?.availability.status === 'UNAVAILABLE') {
    return createUnavailableVM(
      params.generatedAt,
      mapHistoryUnavailabilityReason(params.historyVM.availability.reason),
    );
  }

  const sections = createInsightsStorySections({
    history: params.history,
    orientationContext: params.orientationContext,
  });
  const selectedWindows = selectComparisonWindows({
    sections,
  });

  if (!selectedWindows) {
    return createUnavailableVM(params.generatedAt, 'INSUFFICIENT_INTERPRETED_HISTORY');
  }

  const items = createSummaryItems({
    leftWindow: selectedWindows.leftWindow,
    rightWindow: selectedWindows.rightWindow,
  });

  if (items.length === 0) {
    return createUnavailableVM(params.generatedAt, 'NO_COMPARABLE_HISTORY');
  }

  return {
    generatedAt: params.generatedAt,
    availability: {
      status: 'AVAILABLE',
      leftWindow: {
        id: selectedWindows.leftWindow.id,
        title: selectedWindows.leftWindow.title,
        startAt: selectedWindows.leftWindow.startAt,
        endAt: selectedWindows.leftWindow.endAt,
      },
      rightWindow: {
        id: selectedWindows.rightWindow.id,
        title: selectedWindows.rightWindow.title,
        startAt: selectedWindows.rightWindow.startAt,
        endAt: selectedWindows.rightWindow.endAt,
      },
      items,
      limitations: selectedWindows.limitations,
    },
  };
}
