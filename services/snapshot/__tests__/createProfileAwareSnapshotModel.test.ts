import { createProfileAwareSnapshotModel } from '@/services/snapshot/createProfileAwareSnapshotModel';
import type { SnapshotModel } from '@/services/snapshot/types';

const baseModel: SnapshotModel = {
  profile: 'BEGINNER',
  core: {
    currentState: {
      label: 'Current State',
      value: 'Up',
      trendDirection: 'UP',
    },
    change24h: {
      label: 'Last 24h Change',
      value: 0.015,
    },
    strategyStatus: {
      label: 'Strategy Status',
      value: 'Watchful',
    },
  },
  secondary: {
    bundleName: 'Calm Starter',
    portfolioValue: 10_400,
  },
  history: {
    hasNewSinceLastCheck: true,
  },
};

describe('createProfileAwareSnapshotModel', () => {
  it('suppresses secondary and history context for beginner snapshots', () => {
    expect(
      createProfileAwareSnapshotModel({
        model: baseModel,
        profile: 'BEGINNER',
      }),
    ).toEqual({
      profile: 'BEGINNER',
      core: baseModel.core,
      secondary: undefined,
      history: undefined,
    });
  });

  it('allows limited compact secondary context for middle snapshots', () => {
    expect(
      createProfileAwareSnapshotModel({
        model: baseModel,
        profile: 'MIDDLE',
      }),
    ).toEqual({
      profile: 'MIDDLE',
      core: baseModel.core,
      secondary: {
        portfolioValue: 10_400,
      },
      history: undefined,
    });
  });

  it('allows advanced snapshots to keep compact alignment and history cues', () => {
    expect(
      createProfileAwareSnapshotModel({
        model: baseModel,
        profile: 'ADVANCED',
      }),
    ).toEqual({
      profile: 'ADVANCED',
      core: baseModel.core,
      secondary: {
        bundleName: 'Calm Starter',
        portfolioValue: 10_400,
      },
      history: {
        hasNewSinceLastCheck: true,
      },
    });
  });

  it('does not suppress the canonical core for beginner snapshots', () => {
    const result = createProfileAwareSnapshotModel({
      model: baseModel,
      profile: 'BEGINNER',
    });

    expect(result.core.change24h.value).toBe(0.015);
    expect(result.core.strategyStatus.value).toBe('Watchful');
    expect(result.core.currentState.value).toBe('Up');
  });
});
