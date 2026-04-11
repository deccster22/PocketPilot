import type { EventLedgerEntry } from '@/core/types/eventLedger';

import { resolveComparisonWindow } from '@/services/insights/comparisonWindowShared';
import { isMarketEvent } from '@/services/insights/historyInterpretation';
import {
  createReviewProfile,
  formatReviewAlignmentPhrase,
  formatReviewThemePhrase,
  type ReviewProfile,
} from '@/services/insights/reviewProfileShared';
import type {
  ComparisonItem,
  ComparisonWindow,
  ComparisonWindowVM,
} from '@/services/insights/types';

const MIN_WINDOW_EVENT_COUNT = 2;

function createUnavailableVM(
  generatedAt: string | null,
  reason: Extract<ComparisonWindowVM['availability'], { status: 'UNAVAILABLE' }>['reason'],
): ComparisonWindowVM {
  return {
    generatedAt,
    availability: {
      status: 'UNAVAILABLE',
      reason,
    },
  };
}

function createSummary(params: {
  newerRangeNounPhrase: string;
  newerRangeLabel: string;
  earlierRangeNounPhrase: string;
  earlierRangeLabel: string;
  newerProfile: ReviewProfile;
  earlierProfile: ReviewProfile;
}): string {
  const newerTheme = formatReviewThemePhrase(params.newerProfile.dominantTheme);
  const earlierTheme = formatReviewThemePhrase(params.earlierProfile.dominantTheme);

  if (
    newerTheme &&
    earlierTheme &&
    params.newerProfile.dominantTheme !== params.earlierProfile.dominantTheme
  ) {
    return `Compared with ${params.earlierRangeNounPhrase}, ${params.newerRangeNounPhrase} leaned more on ${newerTheme} than on ${earlierTheme}.`;
  }

  const newerAlignment = formatReviewAlignmentPhrase(params.newerProfile.dominantAlignment);
  const earlierAlignment = formatReviewAlignmentPhrase(params.earlierProfile.dominantAlignment);

  if (
    newerAlignment &&
    earlierAlignment &&
    params.newerProfile.dominantAlignment !== params.earlierProfile.dominantAlignment
  ) {
    return `Compared with ${params.earlierRangeNounPhrase}, ${params.newerRangeNounPhrase} moved from ${earlierAlignment} toward ${newerAlignment}.`;
  }

  if (newerTheme) {
    return `Across ${params.newerRangeLabel} and ${params.earlierRangeLabel}, interpreted history stayed centered on ${newerTheme} rather than a different pattern.`;
  }

  return 'This bounded comparison stays brief because both windows carried limited interpreted variation.';
}

function createPatternItem(params: {
  newerRangeNounPhrase: string;
  earlierRangeNounPhrase: string;
  newerProfile: ReviewProfile;
  earlierProfile: ReviewProfile;
}): ComparisonItem | null {
  const newerTheme = formatReviewThemePhrase(params.newerProfile.dominantTheme);
  const earlierTheme = formatReviewThemePhrase(params.earlierProfile.dominantTheme);

  if (!newerTheme || !earlierTheme) {
    return null;
  }

  if (params.newerProfile.dominantTheme === params.earlierProfile.dominantTheme) {
    return {
      label: 'Most visible pattern',
      value: `Both windows stayed centered on ${newerTheme} rather than a different interpreted pattern.`,
      emphasis: 'NEUTRAL',
    };
  }

  return {
    label: 'Most visible pattern',
    value: `${params.newerRangeNounPhrase} leaned more on ${newerTheme}, while ${params.earlierRangeNounPhrase} leaned more on ${earlierTheme}.`,
    emphasis: 'SHIFT',
  };
}

function createPostureItem(params: {
  newerProfile: ReviewProfile;
  earlierProfile: ReviewProfile;
}): ComparisonItem | null {
  const newerAlignment = formatReviewAlignmentPhrase(params.newerProfile.dominantAlignment);
  const earlierAlignment = formatReviewAlignmentPhrase(params.earlierProfile.dominantAlignment);

  if (!newerAlignment || !earlierAlignment) {
    return null;
  }

  if (params.newerProfile.dominantAlignment === params.earlierProfile.dominantAlignment) {
    return {
      label: 'Interpreted posture',
      value: `Across both windows, the interpreted posture stayed ${newerAlignment}.`,
      emphasis: 'NEUTRAL',
    };
  }

  return {
    label: 'Interpreted posture',
    value: `The later window moved from ${earlierAlignment} toward ${newerAlignment}.`,
    emphasis: 'SHIFT',
  };
}

function createContextOrSymbolItem(params: {
  newerRangeNounPhrase: string;
  earlierRangeNounPhrase: string;
  newerProfile: ReviewProfile;
  earlierProfile: ReviewProfile;
}): ComparisonItem | null {
  if (params.newerProfile.hasProvisionalContext && params.earlierProfile.hasProvisionalContext) {
    return {
      label: 'Context note',
      value:
        'Some supporting price context stayed estimated or partial in both windows, so this comparison remains directional rather than exhaustive.',
      emphasis: 'CONTEXT',
    };
  }

  if (params.newerProfile.hasProvisionalContext) {
    return {
      label: 'Context note',
      value: `Some supporting price context stayed more provisional in ${params.newerRangeNounPhrase}, so that side remains a little less settled.`,
      emphasis: 'CONTEXT',
    };
  }

  if (params.earlierProfile.hasProvisionalContext) {
    return {
      label: 'Context note',
      value: `Some supporting price context stayed more provisional in ${params.earlierRangeNounPhrase}, so that side remains a little less settled.`,
      emphasis: 'CONTEXT',
    };
  }

  if (!params.newerProfile.topSymbol || !params.earlierProfile.topSymbol) {
    return null;
  }

  if (params.newerProfile.topSymbol === params.earlierProfile.topSymbol) {
    return {
      label: 'Recurring symbol',
      value: `${params.newerProfile.topSymbol} stayed the clearest recurring symbol across both windows.`,
      emphasis: 'NEUTRAL',
    };
  }

  return {
    label: 'Recurring symbol',
    value: `${params.newerProfile.topSymbol} appeared more often in ${params.newerRangeNounPhrase}, while ${params.earlierProfile.topSymbol} appeared more often in ${params.earlierRangeNounPhrase}.`,
    emphasis: 'SHIFT',
  };
}

function createLimitations(params: {
  newerProfile: ReviewProfile;
  earlierProfile: ReviewProfile;
}): string[] {
  if (params.newerProfile.eventCount < 4 || params.earlierProfile.eventCount < 4) {
    return [
      'At least one side of this comparison comes from a lighter stretch of interpreted history, so the read stays brief.',
    ];
  }

  return [];
}

export function createComparisonWindowVM(params: {
  generatedAt: string | null;
  history: ReadonlyArray<EventLedgerEntry>;
  window?: ComparisonWindow | null;
}): ComparisonWindowVM {
  if (!params.window) {
    return createUnavailableVM(params.generatedAt, 'NO_WINDOW_SELECTED');
  }

  if (params.window === 'BEFORE_STRATEGY_CHANGE_VS_AFTER_STRATEGY_CHANGE') {
    return createUnavailableVM(params.generatedAt, 'UNSUPPORTED_WINDOW');
  }

  if (!params.generatedAt) {
    return createUnavailableVM(params.generatedAt, 'INSUFFICIENT_HISTORY');
  }

  const resolvedWindow = resolveComparisonWindow(params.window, params.generatedAt);

  if (!resolvedWindow) {
    return createUnavailableVM(params.generatedAt, 'INSUFFICIENT_HISTORY');
  }

  const marketHistory = params.history.filter(isMarketEvent);
  const newerHistory = marketHistory.filter(
    (event) =>
      event.timestamp >= resolvedWindow.newerRange.startAtMs &&
      event.timestamp < resolvedWindow.newerRange.endAtMs,
  );
  const earlierHistory = marketHistory.filter(
    (event) =>
      event.timestamp >= resolvedWindow.earlierRange.startAtMs &&
      event.timestamp < resolvedWindow.earlierRange.endAtMs,
  );

  if (
    newerHistory.length < MIN_WINDOW_EVENT_COUNT ||
    earlierHistory.length < MIN_WINDOW_EVENT_COUNT
  ) {
    return createUnavailableVM(params.generatedAt, 'INSUFFICIENT_HISTORY');
  }

  const newerProfile = createReviewProfile(newerHistory);
  const earlierProfile = createReviewProfile(earlierHistory);
  const items = [
    createPatternItem({
      newerRangeNounPhrase: resolvedWindow.newerRange.nounPhrase,
      earlierRangeNounPhrase: resolvedWindow.earlierRange.nounPhrase,
      newerProfile,
      earlierProfile,
    }),
    createPostureItem({
      newerProfile,
      earlierProfile,
    }),
    createContextOrSymbolItem({
      newerRangeNounPhrase: resolvedWindow.newerRange.nounPhrase,
      earlierRangeNounPhrase: resolvedWindow.earlierRange.nounPhrase,
      newerProfile,
      earlierProfile,
    }),
  ].filter((item): item is ComparisonItem => Boolean(item));

  return {
    generatedAt: params.generatedAt,
    availability: {
      status: 'AVAILABLE',
      window: resolvedWindow.window,
      title: resolvedWindow.title,
      summary: createSummary({
        newerRangeNounPhrase: resolvedWindow.newerRange.nounPhrase,
        newerRangeLabel: resolvedWindow.newerRange.label,
        earlierRangeNounPhrase: resolvedWindow.earlierRange.nounPhrase,
        earlierRangeLabel: resolvedWindow.earlierRange.label,
        newerProfile,
        earlierProfile,
      }),
      items,
      limitations: createLimitations({
        newerProfile,
        earlierProfile,
      }),
    },
  };
}
