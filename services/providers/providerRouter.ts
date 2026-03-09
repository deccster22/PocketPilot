import type { Quote } from '@/core/types/quote';
import type { QuoteBroker } from '@/providers/quoteBroker';

export type QuoteProvider = {
  id: string;
  getQuotes: (accountId: string, symbols: string[]) => Promise<Quote[]>;
};

export type ProviderRouterResult = {
  quotes: Record<string, Quote>;
  meta: {
    provider: string;
    fallbackUsed: boolean;
    requestedSymbols: string[];
    returnedSymbols: string[];
    missingSymbols: string[];
    timestampMs: number;
    providersTried: string[];
    sourceBySymbol: Record<string, string | undefined>;
  };
};

export type GetQuotesForSymbolsParams = {
  accountId: string;
  symbols: string[];
  nowMs: number;
  cachedQuotes?: Record<string, Quote>;
};

function toQuoteRecord(quotes: Quote[]): Record<string, Quote> {
  return quotes.reduce<Record<string, Quote>>((acc, quote) => {
    if (!acc[quote.symbol]) {
      acc[quote.symbol] = quote;
    }
    return acc;
  }, {});
}

function toOrderedSymbols(symbols: string[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const symbol of symbols) {
    if (seen.has(symbol)) {
      continue;
    }

    seen.add(symbol);
    ordered.push(symbol);
  }

  return ordered;
}

export function createQuoteBrokerProvider(broker: QuoteBroker, id = 'quote-broker'): QuoteProvider {
  return {
    id,
    getQuotes: (accountId: string, symbols: string[]) => broker.getQuotes(accountId, symbols),
  };
}

export async function getQuotesForSymbols(
  providers: {
    primary: QuoteProvider;
    fallback?: QuoteProvider;
  },
  params: GetQuotesForSymbolsParams,
): Promise<ProviderRouterResult> {
  const requestedSymbols = toOrderedSymbols(params.symbols);
  const cachedQuotes = params.cachedQuotes ?? {};
  const quotes: Record<string, Quote> = {};

  for (const symbol of requestedSymbols) {
    const cachedQuote = cachedQuotes[symbol];
    if (cachedQuote) {
      quotes[symbol] = cachedQuote;
    }
  }

  const missingAfterCache = requestedSymbols.filter((symbol) => !quotes[symbol]);
  const primaryQuotes = await providers.primary.getQuotes(params.accountId, missingAfterCache);
  const primaryRecord = toQuoteRecord(primaryQuotes);

  for (const symbol of missingAfterCache) {
    const quote = primaryRecord[symbol];
    if (quote) {
      quotes[symbol] = quote;
    }
  }

  let fallbackUsed = false;
  if (providers.fallback) {
    const missingAfterPrimary = requestedSymbols.filter((symbol) => !quotes[symbol]);
    if (missingAfterPrimary.length > 0) {
      fallbackUsed = true;
      const fallbackQuotes = await providers.fallback.getQuotes(params.accountId, missingAfterPrimary);
      const fallbackRecord = toQuoteRecord(fallbackQuotes);

      for (const symbol of missingAfterPrimary) {
        const quote = fallbackRecord[symbol];
        if (quote) {
          quotes[symbol] = quote;
        }
      }
    }
  }

  const returnedSymbols = requestedSymbols.filter((symbol) => Boolean(quotes[symbol]));
  const missingSymbols = requestedSymbols.filter((symbol) => !quotes[symbol]);
  const sourceBySymbol = returnedSymbols.reduce<Record<string, string | undefined>>((acc, symbol) => {
    acc[symbol] = quotes[symbol]?.source;
    return acc;
  }, {});

  return {
    quotes,
    meta: {
      provider: providers.primary.id,
      fallbackUsed,
      requestedSymbols,
      returnedSymbols,
      missingSymbols,
      timestampMs: params.nowMs,
      providersTried: providers.fallback ? [providers.primary.id, providers.fallback.id] : [providers.primary.id],
      sourceBySymbol,
    },
  };
}
