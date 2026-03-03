import type { QuoteBroker } from '@/providers/quoteBroker';
import type { Account } from '@/services/account/accountSelector';
import type { ForegroundScanResult } from '@/services/types/scan';

import { getExecutionQuotes } from '@/services/quotes/quotesService';

export type ForegroundScanDeps = {
  broker: QuoteBroker;
};

export async function runForegroundScan(
  deps: ForegroundScanDeps,
  params: { accounts: Account[]; symbols: string[] },
): Promise<ForegroundScanResult> {
  const { accountId, quotes } = await getExecutionQuotes(
    { broker: deps.broker },
    { accounts: params.accounts, symbols: params.symbols },
  );

  return {
    accountId,
    symbols: params.symbols,
    quotes,
    instrumentation: deps.broker.instrumentation,
  };
}
