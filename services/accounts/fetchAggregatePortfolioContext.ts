import { createAggregatePortfolioContext } from '@/services/accounts/createAggregatePortfolioContext';
import type {
  AccountContextCandidate,
  AggregatePortfolioAvailability,
} from '@/services/accounts/types';

export async function fetchAggregatePortfolioContext(params: {
  accounts: ReadonlyArray<AccountContextCandidate>;
  isEnabledForSurface?: boolean;
}): Promise<AggregatePortfolioAvailability> {
  if (params.isEnabledForSurface !== true) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    };
  }

  return createAggregatePortfolioContext({
    accounts: params.accounts,
  });
}
