import { defaultStrategyIdsForProfile } from '@/core/strategy/profileDefaults';

describe('defaultStrategyIdsForProfile', () => {
  it('returns exactly 3 default strategy ids per profile', () => {
    expect(defaultStrategyIdsForProfile('BEGINNER')).toHaveLength(3);
    expect(defaultStrategyIdsForProfile('MIDDLE')).toHaveLength(3);
    expect(defaultStrategyIdsForProfile('ADVANCED')).toHaveLength(3);
  });

  it('returns deterministic ordering for each profile', () => {
    expect(defaultStrategyIdsForProfile('BEGINNER')).toEqual([
      'data_quality',
      'dip_buying',
      'momentum_basics',
    ]);
    expect(defaultStrategyIdsForProfile('MIDDLE')).toEqual([
      'trend_following',
      'snapshot_change',
      'mean_reversion',
    ]);
    expect(defaultStrategyIdsForProfile('ADVANCED')).toEqual(['fib_levels', 'mean_reversion', 'noop']);
  });
});
