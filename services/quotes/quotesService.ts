import type { Quote } from '@/core/types/quote';
import type { ProviderRouterResult } from '@/services/providers/providerRouter';
import {
  selectExecutionAccount,
  type Account,
} from '@/services/account/accountSelector';

export type QuotesServiceDeps = {
  getQuotesForSymbols: (params: {
    accountId: string;
    symbols: string[];
    nowMs: number;
    cachedQuotes?: Record<string, Quote>;
  }) => Promise<ProviderRouterResult>;
  nowProvider?: () => number;
};

export type FetchQuotesResult = {
  accountId: string;
  quotes: Record<string, Quote>;
  routerMeta: ProviderRouterResult['meta'];
};

export async function fetchQuotes(
  deps: QuotesServiceDeps,
  params: { accounts: Account[]; symbols: string[]; cachedQuotes?: Record<string, Quote> },
): Promise<FetchQuotesResult> {
  const accountId = selectExecutionAccount(params.accounts);
  const nowMs = deps.nowProvider ? deps.nowProvider() : Date.now();
  const routerResult = await deps.getQuotesForSymbols({
    accountId,
    symbols: params.symbols,
    nowMs,
    cachedQuotes: params.cachedQuotes,
  });

  return {
    accountId,
    quotes: routerResult.quotes,
    routerMeta: routerResult.meta,
  };
}
