import {
  requireSelectedAccountContext,
} from '@/services/accounts/enforceAccountScopedTruth';
import { resolveSelectedAccountContext } from '@/services/accounts/resolveSelectedAccountContext';
import type { AccountContextCandidate } from '@/services/accounts/types';

export type Account = AccountContextCandidate;

export function selectExecutionAccount(
  accounts: Account[],
  selectedAccountId?: string | null,
): string {
  const selectedAccount = requireSelectedAccountContext(
    resolveSelectedAccountContext({
      accounts,
      selectedAccountId,
    }),
  );

  return selectedAccount.accountId;
}
