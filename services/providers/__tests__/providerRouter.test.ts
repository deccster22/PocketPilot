import type { Quote } from '@/core/types/quote';
import {
  getQuotesForSymbols,
  type QuoteProvider,
} from '@/services/providers/providerRouter';
import type { QuoteResponseMetadata } from '@/services/providers/types';

describe('providerRouter', () => {
  const nowMs = 1_700_000_000_000;
  const nowIso = new Date(nowMs).toISOString();

  function createMeta(
    overrides: Partial<QuoteResponseMetadata> = {},
  ): QuoteResponseMetadata {
    return {
      role: 'reference',
      providerId: 'provider:test',
      freshness: 'FRESH',
      certainty: 'CONFIRMED',
      lastUpdatedAt: nowIso,
      lastGoodAt: null,
      usedLastGood: false,
      fallbackUsed: false,
      requestedSymbols: [],
      returnedSymbols: [],
      missingSymbols: [],
      timestampMs: nowMs,
      providersTried: ['provider:test'],
      sourceBySymbol: {},
      policy: {
        staleIfError: 'NOT_NEEDED',
        staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY',
        cooldown: 'INACTIVE',
      },
      ...overrides,
    };
  }

  function createQuote(symbol: string, overrides: Partial<Quote> = {}): Quote {
    return {
      symbol,
      price: 100,
      source: 'primary-feed',
      estimated: false,
      timestamp: nowMs,
      ...overrides,
    };
  }

  it('routes explicit role-tagged requests through the configured primary chain', async () => {
    const primary: QuoteProvider = {
      id: 'reference-primary',
      role: 'reference',
      getQuotes: jest.fn(async (request) => ({
        quotes: {
          AAPL: createQuote('AAPL'),
          MSFT: createQuote('MSFT', { estimated: true }),
        },
        meta: createMeta({
          role: request.context.role,
          providerId: 'reference-primary',
          certainty: 'ESTIMATED',
          requestedSymbols: request.symbols,
          returnedSymbols: request.symbols,
          providersTried: ['reference-primary'],
          sourceBySymbol: {
            AAPL: 'primary-feed',
            MSFT: 'primary-feed',
          },
        }),
      })),
    };

    const result = await getQuotesForSymbols(
      {
        reference: {
          primary,
        },
      },
      {
        accountId: 'acct-1',
        symbols: ['AAPL', 'MSFT'],
        nowMs,
        context: {
          role: 'reference',
          budgetClass: 'CALM',
        },
      },
    );

    expect(primary.getQuotes).toHaveBeenCalledWith({
      accountId: 'acct-1',
      symbols: ['AAPL', 'MSFT'],
      nowMs,
      context: {
        role: 'reference',
        accountId: 'acct-1',
        symbols: ['AAPL', 'MSFT'],
        budgetClass: 'CALM',
        quoteCurrency: null,
      },
    });
    expect(result.meta).toEqual(
      expect.objectContaining({
        role: 'reference',
        providerId: 'reference-primary',
        freshness: 'FRESH',
        certainty: 'ESTIMATED',
        fallbackUsed: false,
        requestedSymbols: ['AAPL', 'MSFT'],
        returnedSymbols: ['AAPL', 'MSFT'],
        missingSymbols: [],
      }),
    );
  });

  it('does not silently fall through from execution intent into reference routing', async () => {
    const executionPrimary: QuoteProvider = {
      id: 'execution-primary',
      role: 'execution',
      getQuotes: jest.fn(async (request) => ({
        quotes: {},
        meta: createMeta({
          role: request.context.role,
          providerId: 'execution-primary',
          freshness: 'UNAVAILABLE',
          certainty: 'UNAVAILABLE',
          lastUpdatedAt: null,
          requestedSymbols: request.symbols,
          returnedSymbols: [],
          missingSymbols: request.symbols,
          providersTried: ['execution-primary'],
        }),
      })),
    };

    const referencePrimary: QuoteProvider = {
      id: 'reference-primary',
      role: 'reference',
      getQuotes: jest.fn(async () => ({
        quotes: {
          BTC: createQuote('BTC', { source: 'reference-feed' }),
        },
        meta: createMeta({
          providerId: 'reference-primary',
          requestedSymbols: ['BTC'],
          returnedSymbols: ['BTC'],
          providersTried: ['reference-primary'],
          sourceBySymbol: { BTC: 'reference-feed' },
        }),
      })),
    };

    const result = await getQuotesForSymbols(
      {
        execution: {
          primary: executionPrimary,
        },
        reference: {
          primary: referencePrimary,
        },
      },
      {
        accountId: 'acct-1',
        symbols: ['BTC'],
        nowMs,
        context: {
          role: 'execution',
          budgetClass: 'WATCHING_NOW',
        },
      },
    );

    expect(referencePrimary.getQuotes).not.toHaveBeenCalled();
    expect(result.quotes.BTC).toBeUndefined();
    expect(result.meta).toEqual(
      expect.objectContaining({
        role: 'execution',
        providerId: 'execution-primary',
        freshness: 'UNAVAILABLE',
        certainty: 'UNAVAILABLE',
        returnedSymbols: [],
        missingSymbols: ['BTC'],
        providersTried: ['execution-primary'],
      }),
    );
  });

  it('uses same-role fallback when the primary chain misses symbols', async () => {
    const primary: QuoteProvider = {
      id: 'reference-primary',
      role: 'reference',
      getQuotes: jest.fn(async (request) => ({
        quotes: {
          BTC: createQuote('BTC'),
        },
        meta: createMeta({
          role: request.context.role,
          providerId: 'reference-primary',
          requestedSymbols: request.symbols,
          returnedSymbols: ['BTC'],
          missingSymbols: ['SOL'],
          providersTried: ['reference-primary'],
          sourceBySymbol: { BTC: 'primary-feed' },
        }),
      })),
    };

    const fallback: QuoteProvider = {
      id: 'reference-fallback',
      role: 'reference',
      getQuotes: jest.fn(async (request) => ({
        quotes: {
          SOL: createQuote('SOL', {
            source: 'fallback-feed',
            estimated: true,
          }),
        },
        meta: createMeta({
          role: request.context.role,
          providerId: 'reference-fallback',
          certainty: 'ESTIMATED',
          requestedSymbols: request.symbols,
          returnedSymbols: ['SOL'],
          providersTried: ['reference-fallback'],
          sourceBySymbol: { SOL: 'fallback-feed' },
        }),
      })),
    };

    const result = await getQuotesForSymbols(
      {
        reference: {
          primary,
          fallback,
        },
      },
      {
        accountId: 'acct-1',
        symbols: ['BTC', 'SOL'],
        nowMs,
        context: {
          role: 'reference',
          budgetClass: 'CALM',
        },
      },
    );

    expect(fallback.getQuotes).toHaveBeenCalledWith(
      expect.objectContaining({
        symbols: ['SOL'],
        context: expect.objectContaining({
          role: 'reference',
          symbols: ['SOL'],
        }),
      }),
    );
    expect(result.meta).toEqual(
      expect.objectContaining({
        role: 'reference',
        providerId: null,
        fallbackUsed: true,
        certainty: 'ESTIMATED',
        requestedSymbols: ['BTC', 'SOL'],
        returnedSymbols: ['BTC', 'SOL'],
        missingSymbols: [],
        providersTried: ['reference-primary', 'reference-fallback'],
        sourceBySymbol: {
          BTC: 'primary-feed',
          SOL: 'fallback-feed',
        },
      }),
    );
  });

  it('fails fast when a provider chain is tagged to the wrong role', async () => {
    const misconfiguredPrimary: QuoteProvider = {
      id: 'reference-primary',
      role: 'reference',
      getQuotes: jest.fn(),
    };

    await expect(
      getQuotesForSymbols(
        {
          execution: {
            primary: misconfiguredPrimary,
          },
        },
        {
          accountId: 'acct-1',
          symbols: ['BTC'],
          nowMs,
          context: {
            role: 'execution',
            budgetClass: 'WATCHING_NOW',
          },
        },
      ),
    ).rejects.toThrow('Provider reference-primary is tagged reference but request role is execution.');
  });
});
