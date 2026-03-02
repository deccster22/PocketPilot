import { canFire, updateState } from '@/core/utils/hapticThrottle';

describe('hapticThrottle', () => {
  it('allows first event and blocks within cooldown', () => {
    const key = 'BTC:cross';
    const cooldownMs = 5_000;
    let state = {};

    expect(canFire(state, key, 1_000, cooldownMs)).toBe(true);

    state = updateState(state, key, 1_000);

    expect(canFire(state, key, 5_999, cooldownMs)).toBe(false);
    expect(canFire(state, key, 6_000, cooldownMs)).toBe(true);
  });

  it('tracks keys independently', () => {
    let state = updateState({}, 'BTC:cross', 10_000);

    expect(canFire(state, 'ETH:cross', 10_001, 5_000)).toBe(true);

    state = updateState(state, 'ETH:cross', 10_001);

    expect(canFire(state, 'BTC:cross', 12_000, 5_000)).toBe(false);
    expect(canFire(state, 'ETH:cross', 12_000, 5_000)).toBe(false);
  });
});
