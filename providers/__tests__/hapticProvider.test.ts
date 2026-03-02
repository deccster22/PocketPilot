import { HapticProvider } from '@/providers/hapticProvider';

describe('HapticProvider', () => {
  it('throttles by symbol and event key', async () => {
    const notificationAsync = jest.fn(async () => {});
    const provider = new HapticProvider({ notificationAsync });

    await expect(
      provider.fireEvent({ symbol: 'BTC', event: 'cross', nowMs: 1000, cooldownMs: 100 }),
    ).resolves.toBe(true);

    await expect(
      provider.fireEvent({ symbol: 'BTC', event: 'cross', nowMs: 1050, cooldownMs: 100 }),
    ).resolves.toBe(false);

    await expect(
      provider.fireEvent({ symbol: 'BTC', event: 'breakout', nowMs: 1050, cooldownMs: 100 }),
    ).resolves.toBe(true);

    expect(notificationAsync).toHaveBeenCalledTimes(2);
  });
});
