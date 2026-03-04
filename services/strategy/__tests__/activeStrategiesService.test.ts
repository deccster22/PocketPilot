import {
  resolveActiveStrategies,
  resolveStrategyIds,
} from '@/services/strategy/activeStrategiesService';

describe('resolveStrategyIds', () => {
  it('expands beginner bundle with stable ordering', () => {
    const result = resolveStrategyIds({ bundleIds: ['beginner_core'] });

    expect(result).toEqual(['data_quality', 'dip_buying', 'momentum_basics']);
  });

  it('deduplicates strategy ids when repeated bundles are provided', () => {
    const result = resolveStrategyIds({ bundleIds: ['beginner_core', 'beginner_core'] });

    expect(result).toEqual(['data_quality', 'dip_buying', 'momentum_basics']);
  });

  it('preserves order based on bundle sortOrder regardless of input ordering', () => {
    const result = resolveStrategyIds({ bundleIds: ['advanced_core', 'beginner_core'] });

    expect(result).toEqual([
      'data_quality',
      'dip_buying',
      'momentum_basics',
      'snapshot_change',
      'noop',
    ]);
  });

  it('returns explicit strategy ids as-is when provided', () => {
    const result = resolveStrategyIds({ strategyIds: ['snapshot_change', 'data_quality'] });

    expect(result).toEqual(['snapshot_change', 'data_quality']);
  });

  it('returns empty list when neither bundle ids nor strategy ids are provided', () => {
    expect(resolveStrategyIds({})).toEqual([]);
  });
});

describe('resolveActiveStrategies', () => {
  it('resolves beginner profile to implemented data_quality, dip_buying, and momentum_basics strategies', () => {
    const result = resolveActiveStrategies({ profile: 'BEGINNER' });

    expect(result.map((strategy) => strategy.id)).toEqual([
      'data_quality',
      'dip_buying',
      'momentum_basics',
    ]);
  });

  it('skips unimplemented strategy ids without throwing and still resolves implemented ones', () => {
    const result = resolveActiveStrategies({
      strategyIds: ['snapshot_change', 'not_implemented', 'data_quality'],
    });

    expect(result.map((strategy) => strategy.id)).toEqual(['snapshot_change', 'data_quality']);
  });

  it('falls back to noop strategy when nothing resolves', () => {
    const result = resolveActiveStrategies({ strategyIds: ['not_implemented'] });

    expect(result.map((strategy) => strategy.id)).toEqual(['noop']);
  });
});
