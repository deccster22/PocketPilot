import { resolveSelectedAccountContext } from '@/services/accounts/resolveSelectedAccountContext';
import type {
  AccountContextCandidate,
  SelectedAccountAvailability,
} from '@/services/accounts/types';

export async function fetchSelectedAccountContext(params: {
  accounts: ReadonlyArray<AccountContextCandidate>;
  selectedAccountId?: string | null;
}): Promise<SelectedAccountAvailability> {
  return resolveSelectedAccountContext(params);
}

