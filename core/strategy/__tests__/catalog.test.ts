import { listCatalog } from '@/core/strategy/catalog';

describe('strategy catalog', () => {
  it('returns entries sorted by sortOrder', () => {
    const result = listCatalog();

    expect(result.map((entry) => entry.id)).toEqual([
      'noop',
      'data_quality',
      'momentum_basics',
      'dip_buying',
      'trend_following',
      'snapshot_change',
      'mean_reversion',
      'fib_levels',
    ]);
  });

  it('filters entries by archetype', () => {
    const result = listCatalog({ archetype: 'BEGINNER' });

    expect(result.every((entry) => entry.archetype === 'BEGINNER')).toBe(true);
    expect(result.map((entry) => entry.id)).toEqual(['data_quality', 'momentum_basics', 'dip_buying']);
  });
});
