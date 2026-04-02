import type { Quote } from '@/core/types/quote';
import { QuoteBroker } from '@/providers/quoteBroker';
import type { QuoteRequest } from '@/services/providers/types';

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
}

describe('QuoteBroker runtime contracts', () => {
  const baseNowMs = 1_700_000_000_000;
  const baseIso = new Date(baseNowMs).toISOString();

  function createRequest(overrides: Partial<QuoteRequest> = {}): QuoteRequest {
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
        lastGoodAt: null,
        usedLastGood: false,
        requestedSymbols: ['BTC', 'ETH'],
        returnedSymbols: ['BTC', 'ETH'],
        missingSymbols: [],
        providersTried: ['broker:test'],
        coalescedRequest: false,
        policyStateBySymbol: {
          BTC: 'FRESH',
          ETH: 'FRESH',
        },
      }),
    );
    expect(result.meta.providerHealthSummary).toEqual({
      'broker:test': {
        providerId: 'broker:test',
        requests: 1,
        symbolsRequested: 2,
        symbolsFetched: 2,
        symbolsBlocked: 0,
        cooldown: 'INACTIVE',
      },
    });
    expect(result.meta.policy).toEqual({
      staleIfError: 'NOT_NEEDED',
      staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY',
      cooldown: 'INACTIVE',
      cooldownSkippedProviders: [],
    });
  });

  it('coalesces identical in-flight requests onto one fetch and marks the result', async () => {
    const deferred = createDeferred<Quote[]>();
    const fetcher = jest.fn(async () => deferred.promise);
    const broker = new QuoteBroker({
      providerId: 'broker:test',
      fetcher,
    });
    const request = createRequest({ symbols: ['BTC'] });

    const first = broker.getQuotes(request);
    const second = broker.getQuotes(request);

    expect(fetcher).toHaveBeenCalledTimes(1);

    deferred.resolve([createQuote('BTC')]);

    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(firstResult).toEqual(secondResult);
    expect(firstResult.meta.coalescedRequest).toBe(true);
    expect(firstResult.meta.providerHealthSummary['broker:test']).toEqual(
      expect.objectContaining({
        requests: 2,
        symbolsRequested: 2,
        symbolsFetched: 1,
      }),
    );
  });

  it('does not coalesce role-distinct requests even for the same symbol', async () => {
    const firstDeferred = createDeferred<Quote[]>();
    const secondDeferred = createDeferred<Quote[]>();
    const fetcher = jest
      .fn<Promise<Quote[]>, [QuoteRequest]>()
      .mockImplementationOnce(async () => firstDeferred.promise)
      .mockImplementationOnce(async () => secondDeferred.promise);

    const broker = new QuoteBroker({
      providerId: 'broker:test',
      fetcher,
    });

    const referenceRequest = createRequest({
      symbols: ['BTC'],
      context: {
        role: 'reference',
        budgetClass: 'CALM',
      },
    });
    const executionRequest = createRequest({
      symbols: ['BTC'],
      context: {
        role: 'execution',
        budgetClass: 'WATCHING_NOW',
      },
    });

    const referenceResultPromise = broker.getQuotes(referenceRequest);
    const executionResultPromise = broker.getQuotes(executionRequest);

    expect(fetcher).toHaveBeenCalledTimes(2);

    firstDeferred.resolve([createQuote('BTC', { source: 'reference-feed' })]);
    secondDeferred.resolve([createQuote('BTC', { source: 'execution-feed' })]);

    const [referenceResult, executionResult] = await Promise.all([
      referenceResultPromise,
      executionResultPromise,
    ]);

    expect(referenceResult.meta.coalescedRequest).toBe(false);
    expect(executionResult.meta.coalescedRequest).toBe(false);
    expect(referenceResult.quotes.BTC?.source).toBe('reference-feed');
    expect(executionResult.quotes.BTC?.source).toBe('execution-feed');
  });

  it.each([
    {
      label: 'accountId',
      first: createRequest({ accountId: 'acct-1', symbols: ['BTC'] }),
      second: createRequest({ accountId: 'acct-2', symbols: ['BTC'] }),
    },
    {
      label: 'quoteCurrency',
      first: createRequest({
        symbols: ['BTC'],
        context: {
          role: 'reference',
          budgetClass: 'CALM',
          quoteCurrency: 'USD',
        },
      }),
      second: createRequest({
        symbols: ['BTC'],
        context: {
          role: 'reference',
          budgetClass: 'CALM',
          quoteCurrency: 'AUD',
        },
      }),
    },
    {
      label: 'budgetClass',
      first: createRequest({
        symbols: ['BTC'],
        context: {
          role: 'reference',
          budgetClass: 'CALM',
        },
      }),
      second: createRequest({
        symbols: ['BTC'],
        context: {
          role: 'reference',
          budgetClass: 'WATCHING_NOW',
        },
      }),
    },
  ])('does not coalesce requests when $label changes semantics', async ({ first, second }) => {
    const firstDeferred = createDeferred<Quote[]>();
    const secondDeferred = createDeferred<Quote[]>();
    const fetcher = jest
      .fn<Promise<Quote[]>, [QuoteRequest]>()
      .mockImplementationOnce(async () => firstDeferred.promise)
      .mockImplementationOnce(async () => secondDeferred.promise);

    const broker = new QuoteBroker({
      providerId: 'broker:test',
      fetcher,
    });

    const firstResultPromise = broker.getQuotes(first);
    const secondResultPromise = broker.getQuotes(second);

    expect(fetcher).toHaveBeenCalledTimes(2);

    firstDeferred.resolve([createQuote('BTC', { source: 'first-feed' })]);
    secondDeferred.resolve([createQuote('BTC', { source: 'second-feed' })]);

    const [firstResult, secondResult] = await Promise.all([
      firstResultPromise,
      secondResultPromise,
    ]);

    expect(firstResult.meta.coalescedRequest).toBe(false);
    expect(secondResult.meta.coalescedRequest).toBe(false);
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
    expect(result.meta.policyStateBySymbol).toEqual({
      BTC: 'STALE',
      ETH: 'STALE',
    });
  });

  it('shows mixed fresh, stale, last-good, and unavailable symbol states without polluting one another', async () => {
    const staleTimestamp = baseNowMs - 10 * 60 * 1000;
    const fetcher = jest
      .fn<Promise<Quote[]>, [QuoteRequest]>()
      .mockResolvedValueOnce([createQuote('SOL')])
      .mockResolvedValueOnce([
        createQuote('BTC'),
        createQuote('ETH', { timestamp: staleTimestamp }),
      ]);

    const broker = new QuoteBroker({
      providerId: 'broker:test',
      fetcher,
    });

    await broker.getQuotes(createRequest({ symbols: ['SOL'], nowMs: baseNowMs }));
    const result = await broker.getQuotes(
      createRequest({
        symbols: ['BTC', 'ETH', 'SOL', 'DOGE'],
        nowMs: baseNowMs + 1_000,
      }),
    );

    expect(result.meta.freshness).toBe('LAST_GOOD');
    expect(result.meta.usedLastGood).toBe(true);
    expect(result.meta.lastGoodAt).toBe(baseIso);
    expect(result.meta.returnedSymbols).toEqual(['BTC', 'ETH', 'SOL']);
    expect(result.meta.missingSymbols).toEqual(['DOGE']);
    expect(result.meta.policyStateBySymbol).toEqual({
      BTC: 'FRESH',
      ETH: 'STALE',
      SOL: 'LAST_GOOD',
      DOGE: 'UNAVAILABLE',
    });
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
    expect(result.meta.policyStateBySymbol).toEqual({ BTC: 'LAST_GOOD' });
    expect(result.meta.policy.staleIfError).toBe('USED_LAST_GOOD');
  });

  it('skips provider calls while cooldown is active and surfaces cooldown state explicitly', async () => {
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
    expect(result.meta.policy.cooldownSkippedProviders).toEqual(['broker:test']);
    expect(result.meta.providerHealthSummary['broker:test']).toEqual(
      expect.objectContaining({
        cooldown: 'ACTIVE_SKIP',
      }),
    );
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
        symbols: Array.from({ length: 18 }, (_, index) => `S${index}`),
      }),
    );
    const second = await broker.getQuotes(
      createRequest({
        symbols: Array.from({ length: 10 }, (_, index) => `T${index}`),
        nowMs: baseNowMs + 1_000,
      }),
    );

    expect(first.meta.returnedSymbols).toHaveLength(18);
    expect(second.meta.returnedSymbols).toHaveLength(2);
    expect(second.meta.missingSymbols).toHaveLength(8);
    expect(second.meta.policyStateBySymbol.T0).toBe('FRESH');
    expect(second.meta.policyStateBySymbol.T2).toBe('UNAVAILABLE');
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
