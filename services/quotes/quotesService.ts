import type { Quote } from '@/core/types/quote';
import type { ProviderRouterResult } from '@/services/providers/providerRouter';
import type {
  ProviderRequestContext,
  QuoteRequest,
} from '@/services/providers/types';
import {
  selectExecutionAccount,
  type Account,
} from '@/services/account/accountSelector';

export type QuotesServiceDeps = {
  getQuotesForSymbols: (params: QuoteRequest) => Promise<ProviderRouterResult>;
  nowProvider?: () => number;
};

export type FetchQuotesResult = {
  accountId: string;
  quotes: Record<string, Quote>;
  routerMeta: ProviderRouterResult['meta'];
};

export async function fetchQuotes(
  deps: QuotesServiceDeps,
  params: {
    accounts: Account[];
    symbols: string[];
    cachedQuotes?: Record<string, Quote>;
    context: Omit<ProviderRequestContext, 'accountId' | 'symbols'> & {
      role: ProviderRequestContext['role'];
    };
  },
): Promise<FetchQuotesResult> {
  const accountId = selectExecutionAccount(params.accounts);
  const nowMs = deps.nowProvider ? deps.nowProvider() : Date.now();
  const routerResult = await deps.getQuotesForSymbols({
      accountId,
      symbols: params.symbols,
      nowMs,
      cachedQuotes: params.cachedQuotes,
      context: {
        ...params.context,
        accountId,
        symbols: params.symbols,
      },
    });

  return {
    accountId,
    quotes: routerResult.quotes,
    routerMeta: routerResult.meta,
  };
}
