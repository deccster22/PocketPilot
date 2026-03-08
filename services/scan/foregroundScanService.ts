import type { QuoteBroker } from '@/providers/quoteBroker';
import type { Account } from '@/services/account/accountSelector';
import { fetchQuotes } from '@/services/quotes/quotesService';
import type { ForegroundScanResult } from '@/services/types/scan';

export type ForegroundScanDeps = {
  broker: QuoteBroker;
};

function toQuoteRecord(quotes: Awaited<ReturnType<typeof fetchQuotes>>['quotes']) {
  return quotes.reduce<Record<string, (typeof quotes)[number]>>((acc, quote) => {
    acc[quote.symbol] = quote;
    return acc;
  }, {});
}

function computePctChange(
  symbols: string[],
  baselineQuotes: Record<string, Awaited<ReturnType<typeof fetchQuotes>>['quotes'][number]> | undefined,
  currentQuotes: Record<string, Awaited<ReturnType<typeof fetchQuotes>>['quotes'][number]>,
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
  params: { accounts: Account[]; symbols: string[]; baselineQuotes?: Record<string, Awaited<ReturnType<typeof fetchQuotes>>['quotes'][number]> },
): Promise<ForegroundScanResult> {
  const { accountId, quotes } = await fetchQuotes(
    { broker: deps.broker },
    { accounts: params.accounts, symbols: params.symbols },
  );

  const quoteRecord = toQuoteRecord(quotes);

  const estimatedFlags = Object.keys(quoteRecord).reduce<Record<string, boolean>>((acc, symbol) => {
    acc[symbol] = quoteRecord[symbol]?.estimated ?? false;
    return acc;
  }, {});

  return {
    accountId,
    symbols: params.symbols,
    quotes: quoteRecord,
    baselineQuotes: params.baselineQuotes,
    pctChangeBySymbol: computePctChange(params.symbols, params.baselineQuotes, quoteRecord),
    estimatedFlags,
    instrumentation: deps.broker.instrumentation,
  };
}
