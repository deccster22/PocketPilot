import { resolveActiveStrategies } from '@/services/strategy/activeStrategiesService';

describe('resolveActiveStrategies', () => {
  it('resolves beginner profile to implemented data_quality and noop strategies', () => {
    const result = resolveActiveStrategies({ profile: 'BEGINNER' });

    expect(result.map((strategy) => strategy.id)).toEqual(['data_quality', 'noop']);
  });

  it('resolves middle profile to implemented snapshot_change strategy', () => {
    const result = resolveActiveStrategies({ profile: 'MIDDLE' });

    expect(result.map((strategy) => strategy.id)).toEqual(['snapshot_change']);
  });
});
