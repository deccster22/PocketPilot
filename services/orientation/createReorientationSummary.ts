import type { UserProfile } from '@/core/profile/types';
import type {
  ReorientationEligibility,
  ReorientationPreference,
  ReorientationSummaryItem,
  ReorientationSummarySource,
} from '@/services/orientation/types';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MAX_SUMMARY_ITEMS = 3;

type ProfileDefaults = {
  thresholdDays: number;
  enabledByDefault: boolean;
};

const PROFILE_DEFAULTS: Record<UserProfile, ProfileDefaults> = {
  BEGINNER: {
    thresholdDays: 30,
    enabledByDefault: true,
  },
  MIDDLE: {
    thresholdDays: 45,
    enabledByDefault: true,
  },
  ADVANCED: {
    thresholdDays: 45,
    enabledByDefault: false,
  },
};

function resolvePreference(params: {
  profileId: UserProfile;
  preference?: ReorientationPreference;
}): Required<ReorientationPreference> {
  const defaults = PROFILE_DEFAULTS[params.profileId];

  return {
    enabled: params.preference?.enabled ?? defaults.enabledByDefault,
    thresholdDaysOverride: params.preference?.thresholdDaysOverride ?? null,
  };
}

function resolveThresholdDays(params: {
  profileId: UserProfile;
  preference: Required<ReorientationPreference>;
}): number {
  return params.preference.thresholdDaysOverride ?? PROFILE_DEFAULTS[params.profileId].thresholdDays;
}

function calculateInactiveDays(params: { nowMs: number; lastActiveAtMs: number }): number {
  const elapsedMs = Math.max(0, params.nowMs - params.lastActiveAtMs);

  return Math.floor(elapsedMs / DAY_IN_MS);
}

function formatHeadline(profileId: UserProfile): string {
  switch (profileId) {
    case 'BEGINNER':
      return 'Welcome back. Here is a quick briefing to help you get your bearings.';
    case 'MIDDLE':
      return 'Welcome back. Here is a focused briefing on the most meaningful shifts since you last checked in.';
    case 'ADVANCED':
      return 'Welcome back. Here is a concise briefing on the clearest changes since you last checked in.';
    default:
      return 'Welcome back. Here is a brief summary of the most meaningful changes since you were last active.';
  }
}

function sanitiseSummaryItems(
  items: ReadonlyArray<ReorientationSummaryItem>,
): ReorientationSummaryItem[] {
  const seenKeys = new Set<string>();
  const result: ReorientationSummaryItem[] = [];

  for (const item of items) {
    const key = `${item.kind}:${item.label}:${item.detail}`;
    if (seenKeys.has(key)) {
      continue;
    }

    seenKeys.add(key);
    result.push({
      kind: item.kind,
      label: item.label,
      detail: item.detail,
    });

    if (result.length === MAX_SUMMARY_ITEMS) {
      break;
    }
  }

  return result;
}

export function createReorientationSummary(params: {
  now: string;
  lastActiveAt: string;
  profileId: UserProfile;
  preference?: ReorientationPreference;
  summarySource: ReorientationSummarySource;
  summaryItems: ReadonlyArray<ReorientationSummaryItem>;
}): ReorientationEligibility {
  const nowMs = Date.parse(params.now);
  const lastActiveAtMs = Date.parse(params.lastActiveAt);

  if (!Number.isFinite(nowMs) || !Number.isFinite(lastActiveAtMs)) {
    throw new Error('createReorientationSummary requires valid ISO timestamps.');
  }

  const preference = resolvePreference({
    profileId: params.profileId,
    preference: params.preference,
  });

  if (!preference.enabled) {
    return {
      status: 'NOT_NEEDED',
      reason: 'DISABLED_FOR_PROFILE',
    };
  }

  const thresholdDays = resolveThresholdDays({
    profileId: params.profileId,
    preference,
  });
  const inactiveDays = calculateInactiveDays({
    nowMs,
    lastActiveAtMs,
  });

  if (inactiveDays < thresholdDays) {
    return {
      status: 'NOT_NEEDED',
      reason: 'BELOW_THRESHOLD',
    };
  }

  const summaryItems = sanitiseSummaryItems(params.summaryItems);
  const hasMeaningfulContext =
    params.summarySource.orientationContext.historyContext.eventsSinceLastViewed.length > 0 ||
    params.summarySource.snapshotModel.history?.hasNewSinceLastCheck === true;

  if (!hasMeaningfulContext || summaryItems.length === 0) {
    return {
      status: 'NOT_NEEDED',
      reason: 'NO_MEANINGFUL_CHANGE',
    };
  }

  return {
    status: 'AVAILABLE',
    profileId: params.profileId,
    inactiveDays,
    headline: formatHeadline(params.profileId),
    summaryItems,
    generatedFrom: {
      lastActiveAt: params.lastActiveAt,
      now: params.now,
    },
    maxItems: MAX_SUMMARY_ITEMS,
  };
}
