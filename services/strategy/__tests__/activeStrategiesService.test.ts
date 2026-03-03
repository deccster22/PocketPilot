import { resolveActiveStrategies } from '@/services/strategy/activeStrategiesService';

describe('resolveActiveStrategies', () => {
  it('resolves beginner profile to at least noop strategy', () => {
    const result = resolveActiveStrategies({ profile: 'BEGINNER' });

    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.map((strategy) => strategy.id)).toContain('noop');
  });

  it('returns noop when defaults are only unimplemented strategies', () => {
    const result = resolveActiveStrategies({ profile: 'MIDDLE' });

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('noop');
  });
});
