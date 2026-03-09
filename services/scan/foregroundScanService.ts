import type { Quote } from '@/core/types/quote';
import type { Account } from '@/services/account/accountSelector';
import { fetchQuotes } from '@/services/quotes/quotesService';
import type { ForegroundScanResult } from '@/services/types/scan';

export type ForegroundScanDeps = {
  getQuotesForSymbols: Parameters<typeof fetchQuotes>[0]['getQuotesForSymbols'];
  nowProvider?: () => number;
  getInstrumentation: () => ForegroundScanResult['instrumentation'];
};

function computePctChange(
  symbols: string[],
  baselineQuotes: Record<string, Quote> | undefined,
  currentQuotes: Record<string, Quote>,
): Record<string, number> | undefined {
  if (!baselineQuotes) {
    return undefined;
  }

  const pctChangeBySymbol = symbols.reduce<Record<string, number>>((acc, symbol) => {
    const baseline = baselineQuotes[symbol];
    const current = currentQuotes[symbol];

    if (!baseline || !current || baseline.price === 0) {
      return acc;
    }

    acc[symbol] = (current.price - baseline.price) / baseline.price;
    return acc;
  }, {});

  return Object.keys(pctChangeBySymbol).length > 0 ? pctChangeBySymbol : undefined;
}

export async function runForegroundScan(
  deps: ForegroundScanDeps,
  params: { accounts: Account[]; symbols: string[]; baselineQuotes?: Record<string, Quote> },
): Promise<ForegroundScanResult> {
  const { accountId, quotes, routerMeta } = await fetchQuotes(
    {
      getQuotesForSymbols: deps.getQuotesForSymbols,
      nowProvider: deps.nowProvider,
    },
    {
      accounts: params.accounts,
      symbols: params.symbols,

    },
  );

  const estimatedFlags = Object.keys(quotes).reduce<Record<string, boolean>>((acc, symbol) => {
    acc[symbol] = quotes[symbol]?.estimated ?? false;
    return acc;
  }, {});

  return {
    accountId,
    symbols: params.symbols,
    quotes,
    baselineQuotes: params.baselineQuotes,
    pctChangeBySymbol: computePctChange(params.symbols, params.baselineQuotes, quotes),
    estimatedFlags,
    instrumentation: deps.getInstrumentation(),
    quoteMeta: routerMeta,
  };
}
