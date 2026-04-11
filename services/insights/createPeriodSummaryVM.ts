import type { EventLedgerEntry } from '@/core/types/eventLedger';

import { isMarketEvent } from '@/services/insights/historyInterpretation';
import {
  createReflectionPeriodWindow,
  formatReflectionPeriodTitle,
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
  PeriodSummaryItem,
  PeriodSummaryVM,
  ReflectionPeriod,
} from '@/services/insights/types';

type PeriodProfile = ReviewProfile;

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

function createSummary(params: {
  period: ReflectionPeriod;
  overallProfile: PeriodProfile;
  newerProfile: PeriodProfile | null;
  earlierProfile: PeriodProfile | null;
}): string {
  const title = formatReflectionPeriodTitle(params.period);
  const newerTheme = formatReviewThemePhrase(params.newerProfile?.dominantTheme ?? null);
  const earlierTheme = formatReviewThemePhrase(params.earlierProfile?.dominantTheme ?? null);
  const overallTheme = formatReviewThemePhrase(params.overallProfile.dominantTheme);

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
  const themePhrase = formatReviewThemePhrase(profile.dominantTheme);

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
  const newerTheme = formatReviewThemePhrase(params.newerProfile?.dominantTheme ?? null);
  const earlierTheme = formatReviewThemePhrase(params.earlierProfile?.dominantTheme ?? null);

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
      label: 'How the period developed',
      value: `The later part moved from ${earlierAlignment} toward ${newerAlignment}.`,
      emphasis: 'SHIFT',
    };
  }

  const overallTheme = formatReviewThemePhrase(params.overallProfile.dominantTheme);

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

  const overallProfile = createReviewProfile(periodHistory);
  const sliceProfiles = createReviewSliceProfiles(periodHistory);
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
