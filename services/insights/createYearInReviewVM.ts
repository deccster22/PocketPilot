import type { EventLedgerEntry } from '@/core/types/eventLedger';

import { isMarketEvent } from '@/services/insights/historyInterpretation';
import {
  createAnnualReviewWindow,
  formatAnnualReviewTitle,
} from '@/services/insights/periodSummaryShared';
import {
  capitalize,
  createReviewProfile,
  createReviewSliceProfiles,
  formatReviewAlignmentPhrase,
  formatReviewThemePhrase,
  type ReviewProfile,
} from '@/services/insights/reviewProfileShared';
import type {
  AnnualReviewPeriod,
  YearInReviewItem,
  YearInReviewVM,
} from '@/services/insights/types';

const MIN_YEAR_IN_REVIEW_EVENT_COUNT = 3;

function createUnavailableVM(
  generatedAt: string,
  reason: Extract<YearInReviewVM['availability'], { status: 'UNAVAILABLE' }>['reason'],
): YearInReviewVM {
  return {
    generatedAt,
    availability: {
      status: 'UNAVAILABLE',
      reason,
    },
  };
}

function createSummary(params: {
  year: number;
  overallProfile: ReviewProfile;
  newerProfile: ReviewProfile | null;
  earlierProfile: ReviewProfile | null;
}): string {
  const newerTheme = formatReviewThemePhrase(params.newerProfile?.dominantTheme ?? null);
  const earlierTheme = formatReviewThemePhrase(params.earlierProfile?.dominantTheme ?? null);
  const overallTheme = formatReviewThemePhrase(params.overallProfile.dominantTheme);

  if (
    newerTheme &&
    earlierTheme &&
    params.newerProfile?.dominantTheme !== params.earlierProfile?.dominantTheme
  ) {
    return `Across ${params.year}, interpreted history moved from ${earlierTheme} toward ${newerTheme}.`;
  }

  if (overallTheme) {
    return `Across ${params.year}, interpreted history stayed centered more on ${overallTheme} than on a new interpreted pattern.`;
  }

  return `Across ${params.year}, interpreted history stayed brief because the year returned limited context.`;
}

function createFocusItem(profile: ReviewProfile): YearInReviewItem | null {
  const themePhrase = formatReviewThemePhrase(profile.dominantTheme);

  if (!themePhrase) {
    return null;
  }

  return {
    label: 'What stood out most',
    value: `${capitalize(themePhrase)} appeared most often in interpreted history across the year.`,
    emphasis: 'NEUTRAL',
  };
}

function createDevelopmentItem(params: {
  overallProfile: ReviewProfile;
  newerProfile: ReviewProfile | null;
  earlierProfile: ReviewProfile | null;
}): YearInReviewItem | null {
  const newerTheme = formatReviewThemePhrase(params.newerProfile?.dominantTheme ?? null);
  const earlierTheme = formatReviewThemePhrase(params.earlierProfile?.dominantTheme ?? null);

  if (
    newerTheme &&
    earlierTheme &&
    params.newerProfile?.dominantTheme !== params.earlierProfile?.dominantTheme
  ) {
    return {
      label: 'How the year developed',
      value: `The later part of the year leaned more on ${newerTheme}, while the earlier part leaned more on ${earlierTheme}.`,
      emphasis: 'SHIFT',
    };
  }

  const newerAlignment = formatReviewAlignmentPhrase(
    params.newerProfile?.dominantAlignment ?? null,
  );
  const earlierAlignment = formatReviewAlignmentPhrase(
    params.earlierProfile?.dominantAlignment ?? null,
  );

  if (
    newerAlignment &&
    earlierAlignment &&
    params.newerProfile?.dominantAlignment !== params.earlierProfile?.dominantAlignment
  ) {
    return {
      label: 'How the year developed',
      value: `The later part of the year moved from ${earlierAlignment} toward ${newerAlignment}.`,
      emphasis: 'SHIFT',
    };
  }

  const overallTheme = formatReviewThemePhrase(params.overallProfile.dominantTheme);

  if (!overallTheme) {
    return null;
  }

  return {
    label: 'How the year developed',
    value: `The year stayed centered on ${overallTheme} rather than taking on a different interpreted pattern.`,
    emphasis: 'NEUTRAL',
  };
}

function createContextOrRecurringItem(profile: ReviewProfile): YearInReviewItem | null {
  if (profile.hasProvisionalContext) {
    return {
      label: 'Context note',
      value:
        'Some supporting price context stayed estimated or partial during the year, so this debrief remains directional rather than exhaustive.',
      emphasis: 'CONTEXT',
    };
  }

  if (profile.topSymbol) {
    return {
      label: 'Recurring symbol',
      value: `${profile.topSymbol} appeared most often in interpreted notes across the year.`,
      emphasis: 'NEUTRAL',
    };
  }

  const alignmentPhrase = formatReviewAlignmentPhrase(profile.dominantAlignment);

  if (!alignmentPhrase) {
    return null;
  }

  return {
    label: 'Interpreted posture',
    value: `Notes more often stayed ${alignmentPhrase}.`,
    emphasis: 'NEUTRAL',
  };
}

function createLimitations(profile: ReviewProfile): string[] {
  const limitations: string[] = [];

  if (profile.eventCount < 6) {
    limitations.push(
      'This review is drawn from a lighter stretch of interpreted history, so it stays brief.',
    );
  }

  if (profile.groupCount === 1) {
    limitations.push(
      'Most of the year returned to one recurring interpreted pattern, so the debrief emphasizes continuity over change.',
    );
  }

  return limitations;
}

export function createYearInReviewVM(params: {
  generatedAt: string;
  history: ReadonlyArray<EventLedgerEntry>;
  period: AnnualReviewPeriod | null;
}): YearInReviewVM {
  if (!params.period) {
    return createUnavailableVM(params.generatedAt, 'NO_PERIOD_SELECTED');
  }

  const window = createAnnualReviewWindow(params.period, params.generatedAt);
  const yearHistory = params.history
    .filter(isMarketEvent)
    .filter((event) => event.timestamp >= window.startAtMs && event.timestamp < window.endAtMs);

  if (yearHistory.length < MIN_YEAR_IN_REVIEW_EVENT_COUNT) {
    return createUnavailableVM(params.generatedAt, 'INSUFFICIENT_HISTORY');
  }

  const overallProfile = createReviewProfile(yearHistory);
  const sliceProfiles = createReviewSliceProfiles(yearHistory);
  const items = [
    createFocusItem(overallProfile),
    createDevelopmentItem({
      overallProfile,
      newerProfile: sliceProfiles?.newerProfile ?? null,
      earlierProfile: sliceProfiles?.earlierProfile ?? null,
    }),
    createContextOrRecurringItem(overallProfile),
  ].filter((item): item is YearInReviewItem => Boolean(item));

  return {
    generatedAt: params.generatedAt,
    availability: {
      status: 'AVAILABLE',
      period: params.period,
      title: formatAnnualReviewTitle(params.period, params.generatedAt),
      summary: createSummary({
        year: window.year,
        overallProfile,
        newerProfile: sliceProfiles?.newerProfile ?? null,
        earlierProfile: sliceProfiles?.earlierProfile ?? null,
      }),
      items,
      limitations: createLimitations(overallProfile),
    },
  };
}
