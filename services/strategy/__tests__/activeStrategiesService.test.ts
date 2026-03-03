import { resolveActiveStrategies } from '@/services/strategy/activeStrategiesService';

describe('resolveActiveStrategies', () => {
  it('resolves beginner profile to implemented data_quality and noop strategies', () => {
    const result = resolveActiveStrategies({ profile: 'BEGINNER' });

    expect(result.map((strategy) => strategy.id)).toEqual(['data_quality', 'noop']);
  });

  it('returns noop when defaults are only unimplemented strategies', () => {
    const result = resolveActiveStrategies({ profile: 'MIDDLE' });

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('noop');
  });
});
