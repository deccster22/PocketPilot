import {
  defaultPreferredRiskBasisStore,
  type PreferredRiskBasisStore,
} from '@/services/trade/preferredRiskBasisStore';
import type { PreferredRiskBasisAvailability } from '@/services/trade/types';

function normaliseOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function fetchPreferredRiskBasis(params: {
  accountId?: string | null;
  isEnabledForSurface: boolean;
  preferredRiskBasisStore?: Pick<PreferredRiskBasisStore, 'load'>;
}): Promise<PreferredRiskBasisAvailability> {
  if (!params.isEnabledForSurface) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    };
  }

  const accountId = normaliseOptionalText(params.accountId);

  if (accountId === null) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_ACCOUNT_CONTEXT',
    };
  }

  const preferredRiskBasisStore =
    params.preferredRiskBasisStore ?? defaultPreferredRiskBasisStore;
  const preferredRiskBasis = (await preferredRiskBasisStore.load()).find(
    (entry) => entry.accountId === accountId,
  );

  return {
    status: 'AVAILABLE',
    accountId,
    preferredBasis: preferredRiskBasis?.riskBasis ?? null,
  };
}
