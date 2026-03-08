import type { Quote } from '@/core/types/quote';
import { QuoteBroker } from '@/providers/quoteBroker';
import {
  selectExecutionAccount,
  type Account,
} from '@/services/account/accountSelector';

export type QuotesServiceDeps = {
  broker: QuoteBroker;
};

export type FetchQuotesResult = {
  accountId: string;
  quotes: Quote[];
};

export async function fetchQuotes(
  deps: QuotesServiceDeps,
  params: { accounts: Account[]; symbols: string[] },
): Promise<FetchQuotesResult> {
  const accountId = selectExecutionAccount(params.accounts);
  const quotes = await deps.broker.getQuotes(accountId, params.symbols);

  return {
    accountId,
    quotes,
  };
}
