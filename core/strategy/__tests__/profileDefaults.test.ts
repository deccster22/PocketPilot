import { defaultStrategyIdsForProfile } from '@/core/strategy/profileDefaults';

describe('defaultStrategyIdsForProfile', () => {
  it('returns exactly 3 default strategy ids per profile', () => {
    expect(defaultStrategyIdsForProfile('BEGINNER')).toHaveLength(3);
    expect(defaultStrategyIdsForProfile('MIDDLE')).toHaveLength(3);
    expect(defaultStrategyIdsForProfile('ADVANCED')).toHaveLength(3);
  });

  it('returns deterministic ordering for each profile', () => {
    expect(defaultStrategyIdsForProfile('BEGINNER')).toEqual([
      'momentum_basics',
      'dip_buying',
      'noop',
    ]);
    expect(defaultStrategyIdsForProfile('MIDDLE')).toEqual([
      'trend_following',
      'mean_reversion',
      'momentum_basics',
    ]);
    expect(defaultStrategyIdsForProfile('ADVANCED')).toEqual(['fib_levels', 'mean_reversion', 'noop']);
  });
});
