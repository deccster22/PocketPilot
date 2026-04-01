import type { Quote } from '@/core/types/quote';
import { QuoteBroker } from '@/providers/quoteBroker';
import type { QuoteRequest } from '@/services/providers/types';

describe('QuoteBroker runtime contracts', () => {
  const baseNowMs = 1_700_000_000_000;
  const baseIso = new Date(baseNowMs).toISOString();

  function createRequest(
    overrides: Partial<QuoteRequest> = {},
  ): QuoteRequest {
    return {
      accountId: 'acct-1',
      symbols: ['BTC', 'ETH'],
      nowMs: baseNowMs,
      context: {
        role: 'reference',
        budgetClass: 'CALM',
      },
      ...overrides,
    };
  }

  function createQuote(symbol: string, overrides: Partial<Quote> = {}): Quote {
    return {
      symbol,
      price: 100,
      source: 'stub-feed',
      timestamp: baseNowMs,
      estimated: false,
      ...overrides,
    };
  }

  it('returns fresh confirmed metadata and preserves bulk request intent', async () => {
    const fetcher = jest.fn(async (request: QuoteRequest) =>
      request.symbols.map((symbol) => createQuote(symbol)),
    );

    const broker = new QuoteBroker({
      providerId: 'broker:test',
      fetcher,
    });

    const request = createRequest();
    const result = await broker.getQuotes(request);

    expect(fetcher).toHaveBeenCalledWith({
      ...request,
      context: {
        ...request.context,
        accountId: 'acct-1',
        symbols: ['BTC', 'ETH'],
        quoteCurrency: null,
      },
    });
    expect(result.meta).toEqual(
      expect.objectContaining({
        role: 'reference',
        providerId: 'broker:test',
        freshness: 'FRESH',
        certainty: 'CONFIRMED',
        lastUpdatedAt: baseIso,
        usedLastGood: false,
        requestedSymbols: ['BTC', 'ETH'],
        returnedSymbols: ['BTC', 'ETH'],
        missingSymbols: [],
        providersTried: ['broker:test'],
      }),
    );
    expect(result.meta.policy).toEqual({
      staleIfError: 'NOT_NEEDED',
      staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY',
      cooldown: 'INACTIVE',
    });
  });

  it('marks older confirmed quotes as stale instead of pretending they are fresh', async () => {
    const staleTimestamp = baseNowMs - 10 * 60 * 1000;
    const fetcher = jest.fn(async (request: QuoteRequest) =>
      request.symbols.map((symbol) =>
        createQuote(symbol, {
          timestamp: staleTimestamp,
        }),
      ),
    );

    const broker = new QuoteBroker({
      providerId: 'broker:test',
      fetcher,
    });

    const result = await broker.getQuotes(createRequest());

    expect(result.meta.freshness).toBe('STALE');
    expect(result.meta.certainty).toBe('CONFIRMED');
    expect(result.meta.lastUpdatedAt).toBe(new Date(staleTimestamp).toISOString());
  });

  it('uses last-good fallback on provider error and marks it explicitly', async () => {
    const fetcher = jest
      .fn<Promise<Quote[]>, [QuoteRequest]>()
      .mockResolvedValueOnce([createQuote('BTC')])
      .mockRejectedValueOnce(new Error('provider down'));

    const broker = new QuoteBroker({
      providerId: 'broker:test',
      fetcher,
    });

    await broker.getQuotes(createRequest({ symbols: ['BTC'], nowMs: baseNowMs }));
    const result = await broker.getQuotes(
      createRequest({ symbols: ['BTC'], nowMs: baseNowMs + 5_000 }),
    );

    expect(result.quotes.BTC).toEqual(expect.objectContaining({ symbol: 'BTC', price: 100 }));
    expect(result.meta).toEqual(
      expect.objectContaining({
        freshness: 'LAST_GOOD',
        certainty: 'CONFIRMED',
        usedLastGood: true,
        lastGoodAt: baseIso,
      }),
    );
    expect(result.meta.policy.staleIfError).toBe('USED_LAST_GOOD');
  });

  it('skips provider calls while cooldown is active and surfaces that state', async () => {
    const fetcher = jest
      .fn<Promise<Quote[]>, [QuoteRequest]>()
      .mockResolvedValueOnce([createQuote('BTC')])
      .mockRejectedValueOnce(new Error('provider down'));

    const broker = new QuoteBroker({
      providerId: 'broker:test',
      fetcher,
      cooldownMs: 60_000,
    });

    await broker.getQuotes(createRequest({ symbols: ['BTC'], nowMs: baseNowMs }));
    await broker.getQuotes(createRequest({ symbols: ['BTC'], nowMs: baseNowMs + 5_000 }));
    const result = await broker.getQuotes(
      createRequest({ symbols: ['BTC'], nowMs: baseNowMs + 10_000 }),
    );

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(result.meta.freshness).toBe('LAST_GOOD');
    expect(result.meta.usedLastGood).toBe(true);
    expect(result.meta.policy.cooldown).toBe('ACTIVE_SKIP');
  });

  it('caps quote fetches by budget class and records instrumentation', async () => {
    const fetcher = jest.fn(async (request: QuoteRequest) =>
      request.symbols.map((symbol) => createQuote(symbol)),
    );

    const broker = new QuoteBroker({
      providerId: 'broker:test',
      fetcher,
    });

    const first = await broker.getQuotes(
      createRequest({
        symbols: Array.from({ length: 18 }, (_, i) => `S${i}`),
      }),
    );
    const second = await broker.getQuotes(
      createRequest({
        symbols: Array.from({ length: 10 }, (_, i) => `T${i}`),
        nowMs: baseNowMs + 1_000,
      }),
    );

    expect(first.meta.returnedSymbols).toHaveLength(18);
    expect(second.meta.returnedSymbols).toHaveLength(2);
    expect(second.meta.missingSymbols).toHaveLength(8);
    expect(broker.instrumentation).toEqual({
      requests: 2,
      symbolsRequested: 28,
      symbolsFetched: 20,
      symbolsBlocked: 8,
    });
  });

  it('is deterministic for identical inputs', async () => {
    const fetcher = async (request: QuoteRequest) =>
      request.symbols.map((symbol) => createQuote(symbol));
    const request = createRequest({ symbols: ['SOL'] });

    const firstBroker = new QuoteBroker({
      providerId: 'broker:test',
      fetcher,
    });
    const secondBroker = new QuoteBroker({
      providerId: 'broker:test',
      fetcher,
    });

    const [first, second] = await Promise.all([
      firstBroker.getQuotes(request),
      secondBroker.getQuotes(request),
    ]);

    expect(first).toEqual(second);
  });
});
