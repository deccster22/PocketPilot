import type { Quote } from '@/core/types/quote';

import { QuoteBroker } from '@/providers/quoteBroker';

describe('QuoteBroker budgets', () => {
  it('caps quote fetches in CALM mode and records instrumentation', async () => {
    let nowMs = 1_000;

    const fetcher = jest.fn(async (_accountId: string, symbols: string[], timestampMs: number) => {
      return symbols.map(
        (symbol): Quote => ({
          symbol,
          price: 100,
          source: 'stub-feed',
          timestampMs,
          estimated: true,
        }),
      );
    });

    const broker = new QuoteBroker({
      mode: 'CALM',
      fetcher,
      nowProvider: () => nowMs,
    });

    const first = await broker.getQuotes('acct-1', Array.from({ length: 18 }, (_, i) => `S${i}`));
    const second = await broker.getQuotes('acct-1', Array.from({ length: 10 }, (_, i) => `T${i}`));

    expect(first).toHaveLength(18);
    expect(second).toHaveLength(2);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(broker.instrumentation).toEqual({
      requests: 2,
      symbolsRequested: 28,
      symbolsFetched: 20,
      symbolsBlocked: 8,
    });

    nowMs += 5 * 60 * 1000;
    const third = await broker.getQuotes('acct-1', ['RESET']);

    expect(third).toHaveLength(1);
  });
});
