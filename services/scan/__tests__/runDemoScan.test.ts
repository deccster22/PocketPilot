import { runDemoScan } from '@/services/scan/runDemoScan';

describe('runDemoScan', () => {
  const nowMs = 1_700_000_000_000;

  it('returns deterministic scan and signals for a fixed nowMs', () => {
    const first = runDemoScan({ profile: 'BEGINNER', nowMs });
    const second = runDemoScan({ profile: 'BEGINNER', nowMs });

    expect(first).toEqual(second);
    expect(first.scan.quotes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ symbol: 'BTC', timestampMs: nowMs, price: 106 }),
        expect.objectContaining({ symbol: 'DOGE', timestampMs: nowMs, estimated: true }),
      ]),
    );
  });

  it('returns beginner signals including dip and momentum when thresholds are crossed', () => {
    const result = runDemoScan({ profile: 'BEGINNER', nowMs });
    const strategyIds = new Set(result.signals.map((signal) => signal.strategyId));

    expect(strategyIds.has('dip_buying')).toBe(true);
    expect(strategyIds.has('momentum_basics')).toBe(true);
    expect(result.bundleName).toBe('Beginner Core');
    expect(result.pctChangeBySymbol.BTC).toBeCloseTo(0.06);
    expect(result.pctChangeBySymbol.ETH).toBeCloseTo(-0.06);
  });
});
