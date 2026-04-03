import {
  appendProviderHealthEvent,
  buildProviderHealthSnapshot,
} from '@/services/providers/providerHealth';
import type { ProviderHealthEvent } from '@/services/providers/providerHealth';

describe('providerHealth', () => {
  const baseNowMs = 1_700_000_000_000;

  function appendEvent(
    events: ReadonlyArray<ProviderHealthEvent>,
    kind: ProviderHealthEvent['kind'],
    timestampOffsetMs: number,
    windowSize = 3,
  ): ReadonlyArray<ProviderHealthEvent> {
    return appendProviderHealthEvent({
      events,
      event: {
        kind,
        timestampMs: baseNowMs + timestampOffsetMs,
      },
      windowSize,
    });
  }

  it('ages old failures out of the bounded recent window', () => {
    let events: ReadonlyArray<ProviderHealthEvent> = [];

    events = appendEvent(events, 'FAILURE', 0);
    events = appendEvent(events, 'SUCCESS', 1_000);
    events = appendEvent(events, 'SUCCESS', 2_000);
    events = appendEvent(events, 'SUCCESS', 3_000);

    const summary = buildProviderHealthSnapshot({
      providerId: 'broker:test',
      role: 'reference',
      events,
      cooldownActive: false,
      windowSize: 3,
    });

    expect(summary.windowSize).toBe(3);
    expect(summary.window).toEqual({
      providerId: 'broker:test',
      role: 'reference',
      recentAttempts: 3,
      recentSuccesses: 3,
      recentFailures: 0,
      recentCooldownSkips: 0,
      lastAttemptAt: new Date(baseNowMs + 3_000).toISOString(),
      lastSuccessAt: new Date(baseNowMs + 3_000).toISOString(),
      lastFailureAt: null,
    });
    expect(summary.score).toEqual({
      providerId: 'broker:test',
      role: 'reference',
      state: 'HEALTHY',
      score: 100,
      reason: 'Recent successes dominate the current window: 3 successes, 0 failures, 0 cooldown skips.',
    });
  });

  it('uses UNKNOWN when recent attempt data is too thin', () => {
    const events = appendEvent([], 'SUCCESS', 0, 4);

    const summary = buildProviderHealthSnapshot({
      providerId: 'broker:test',
      role: 'execution',
      events,
      cooldownActive: false,
      windowSize: 4,
    });

    expect(summary.window.recentAttempts).toBe(1);
    expect(summary.score).toEqual({
      providerId: 'broker:test',
      role: 'execution',
      state: 'UNKNOWN',
      score: null,
      reason: 'Recent data is too thin for a health read: 1 attempt.',
    });
  });

  it('marks recent failures and cooldown skips as DEGRADED without counting skips as failures', () => {
    let events: ReadonlyArray<ProviderHealthEvent> = [];

    events = appendEvent(events, 'SUCCESS', 0, 4);
    events = appendEvent(events, 'FAILURE', 1_000, 4);
    events = appendEvent(events, 'COOLDOWN_SKIP', 2_000, 4);

    const summary = buildProviderHealthSnapshot({
      providerId: 'broker:test',
      role: 'reference',
      events,
      cooldownActive: false,
      windowSize: 4,
    });

    expect(summary.window.recentAttempts).toBe(2);
    expect(summary.window.recentFailures).toBe(1);
    expect(summary.window.recentCooldownSkips).toBe(1);
    expect(summary.score).toEqual({
      providerId: 'broker:test',
      role: 'reference',
      state: 'DEGRADED',
      score: 50,
      reason:
        'Recent failures or cooldown skips are not outweighed by successes: 1 success, 1 failure, 1 cooldown skip.',
    });
  });

  it('reports COOLDOWN_ACTIVE when the provider is currently cooling down', () => {
    let events: ReadonlyArray<ProviderHealthEvent> = [];

    events = appendEvent(events, 'FAILURE', 0, 4);
    events = appendEvent(events, 'COOLDOWN_SKIP', 1_000, 4);

    const summary = buildProviderHealthSnapshot({
      providerId: 'broker:test',
      role: 'execution',
      events,
      cooldownActive: true,
      windowSize: 4,
    });

    expect(summary.window).toEqual({
      providerId: 'broker:test',
      role: 'execution',
      recentAttempts: 1,
      recentSuccesses: 0,
      recentFailures: 1,
      recentCooldownSkips: 1,
      lastAttemptAt: new Date(baseNowMs).toISOString(),
      lastSuccessAt: null,
      lastFailureAt: new Date(baseNowMs).toISOString(),
    });
    expect(summary.score).toEqual({
      providerId: 'broker:test',
      role: 'execution',
      state: 'COOLDOWN_ACTIVE',
      score: null,
      reason: 'Cooldown is active in the current recent window: 0 successes, 1 failure, 1 cooldown skip.',
    });
  });
});
