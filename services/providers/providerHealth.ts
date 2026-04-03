import type {
  ProviderHealthScore,
  ProviderHealthWindow,
  ProviderRequestRole,
} from '@/services/providers/types';

export const DEFAULT_PROVIDER_HEALTH_WINDOW_SIZE = 6;
export const MIN_PROVIDER_HEALTH_SAMPLE_SIZE = 2;

type ProviderHealthEventKind = 'SUCCESS' | 'FAILURE' | 'COOLDOWN_SKIP';

export type ProviderHealthEvent = {
  kind: ProviderHealthEventKind;
  timestampMs: number;
};

export type ProviderHealthSnapshot = {
  windowSize: number;
  window: ProviderHealthWindow;
  score: ProviderHealthScore;
};

function normalizeWindowSize(windowSize?: number): number {
  if (!Number.isFinite(windowSize) || windowSize === undefined) {
    return DEFAULT_PROVIDER_HEALTH_WINDOW_SIZE;
  }

  return Math.max(1, Math.floor(windowSize));
}

function toIsoString(timestampMs: number | null): string | null {
  return timestampMs === null ? null : new Date(timestampMs).toISOString();
}

function getLatestTimestampMs(
  events: ReadonlyArray<ProviderHealthEvent>,
  kinds: ReadonlyArray<ProviderHealthEventKind>,
): number | null {
  const matchingTimestamps = events
    .filter((event) => kinds.includes(event.kind))
    .map((event) => event.timestampMs);

  return matchingTimestamps.length > 0 ? Math.max(...matchingTimestamps) : null;
}

function describeCount(label: string, value: number): string {
  if (value === 1) {
    return `${value} ${label}`;
  }

  if (label.endsWith('s')) {
    return `${value} ${label}es`;
  }

  return `${value} ${label}s`;
}

function buildRecentCountsReason(window: ProviderHealthWindow): string {
  return [
    describeCount('success', window.recentSuccesses),
    describeCount('failure', window.recentFailures),
    describeCount('cooldown skip', window.recentCooldownSkips),
  ].join(', ');
}

function getNumericHealthScore(
  window: ProviderHealthWindow,
  minimumSampleSize: number,
): number | null {
  if (window.recentAttempts < minimumSampleSize || window.recentAttempts === 0) {
    return null;
  }

  return Math.round((window.recentSuccesses / window.recentAttempts) * 100);
}

export function appendProviderHealthEvent(params: {
  events: ReadonlyArray<ProviderHealthEvent>;
  event: ProviderHealthEvent;
  windowSize?: number;
}): ProviderHealthEvent[] {
  const windowSize = normalizeWindowSize(params.windowSize);

  return [...params.events, params.event].slice(-windowSize);
}

export function buildProviderHealthWindow(params: {
  providerId: string;
  role: ProviderRequestRole | 'mixed';
  events: ReadonlyArray<ProviderHealthEvent>;
}): ProviderHealthWindow {
  const recentSuccesses = params.events.filter((event) => event.kind === 'SUCCESS').length;
  const recentFailures = params.events.filter((event) => event.kind === 'FAILURE').length;
  const recentCooldownSkips = params.events.filter(
    (event) => event.kind === 'COOLDOWN_SKIP',
  ).length;
  const recentAttempts = recentSuccesses + recentFailures;

  return {
    providerId: params.providerId,
    role: params.role,
    recentAttempts,
    recentSuccesses,
    recentFailures,
    recentCooldownSkips,
    lastAttemptAt: toIsoString(getLatestTimestampMs(params.events, ['SUCCESS', 'FAILURE'])),
    lastSuccessAt: toIsoString(getLatestTimestampMs(params.events, ['SUCCESS'])),
    lastFailureAt: toIsoString(getLatestTimestampMs(params.events, ['FAILURE'])),
  };
}

export function deriveProviderHealthScore(params: {
  window: ProviderHealthWindow;
  cooldownActive: boolean;
  minimumSampleSize?: number;
}): ProviderHealthScore {
  const minimumSampleSize = Math.max(
    1,
    Math.floor(params.minimumSampleSize ?? MIN_PROVIDER_HEALTH_SAMPLE_SIZE),
  );
  const numericScore = getNumericHealthScore(params.window, minimumSampleSize);
  const problemCount =
    params.window.recentFailures + params.window.recentCooldownSkips;
  const countsReason = buildRecentCountsReason(params.window);

  if (params.cooldownActive) {
    return {
      providerId: params.window.providerId,
      role: params.window.role,
      state: 'COOLDOWN_ACTIVE',
      score: numericScore,
      reason: `Cooldown is active in the current recent window: ${countsReason}.`,
    };
  }

  if (params.window.recentAttempts < minimumSampleSize && problemCount === 0) {
    return {
      providerId: params.window.providerId,
      role: params.window.role,
      state: 'UNKNOWN',
      score: null,
      reason: `Recent data is too thin for a health read: ${describeCount(
        'attempt',
        params.window.recentAttempts,
      )}.`,
    };
  }

  if (params.window.recentSuccesses > problemCount) {
    return {
      providerId: params.window.providerId,
      role: params.window.role,
      state: 'HEALTHY',
      score: numericScore,
      reason: `Recent successes dominate the current window: ${countsReason}.`,
    };
  }

  return {
    providerId: params.window.providerId,
    role: params.window.role,
    state: 'DEGRADED',
    score: numericScore,
    reason: `Recent failures or cooldown skips are not outweighed by successes: ${countsReason}.`,
  };
}

export function buildProviderHealthSnapshot(params: {
  providerId: string;
  role: ProviderRequestRole | 'mixed';
  events: ReadonlyArray<ProviderHealthEvent>;
  cooldownActive: boolean;
  windowSize?: number;
  minimumSampleSize?: number;
}): ProviderHealthSnapshot {
  const windowSize = normalizeWindowSize(params.windowSize);
  const trimmedEvents = params.events.slice(-windowSize);
  const window = buildProviderHealthWindow({
    providerId: params.providerId,
    role: params.role,
    events: trimmedEvents,
  });

  return {
    windowSize,
    window,
    score: deriveProviderHealthScore({
      window,
      cooldownActive: params.cooldownActive,
      minimumSampleSize: params.minimumSampleSize,
    }),
  };
}
