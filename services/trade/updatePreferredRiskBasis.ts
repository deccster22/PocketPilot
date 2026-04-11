import {
  defaultPreferredRiskBasisStore,
  normalisePreferredRiskBasisState,
  type PreferredRiskBasisStore,
} from '@/services/trade/preferredRiskBasisStore';
import { isRiskBasis } from '@/services/trade/selectRiskBasis';
import type {
  PreferredRiskBasisUpdateResult,
  RiskBasis,
} from '@/services/trade/types';

function normaliseOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function sortPreferredRiskBasisState(
  state: ReturnType<typeof normalisePreferredRiskBasisState>,
): ReturnType<typeof normalisePreferredRiskBasisState> {
  return [...state].sort((left, right) => left.accountId.localeCompare(right.accountId));
}

export async function updatePreferredRiskBasis(params: {
  accountId?: string | null;
  riskBasis: RiskBasis | string | null | undefined;
  preferredRiskBasisStore?: Pick<PreferredRiskBasisStore, 'load' | 'save'>;
}): Promise<PreferredRiskBasisUpdateResult> {
  const accountId = normaliseOptionalText(params.accountId);

  if (accountId === null) {
    return {
      status: 'REJECTED',
      reason: 'NO_ACCOUNT_CONTEXT',
    };
  }

  if (!isRiskBasis(params.riskBasis)) {
    return {
      status: 'REJECTED',
      reason: 'UNSUPPORTED_RISK_BASIS',
    };
  }

  const preferredRiskBasisStore =
    params.preferredRiskBasisStore ?? defaultPreferredRiskBasisStore;
  const currentState = normalisePreferredRiskBasisState(await preferredRiskBasisStore.load());
  const existingBasis = currentState.find((entry) => entry.accountId === accountId)?.riskBasis ?? null;

  if (existingBasis === params.riskBasis) {
    return {
      status: 'UNCHANGED',
      accountId,
      riskBasis: params.riskBasis,
    };
  }

  const updatedState = sortPreferredRiskBasisState([
    ...currentState.filter((entry) => entry.accountId !== accountId),
    {
      accountId,
      riskBasis: params.riskBasis,
    },
  ]);

  await preferredRiskBasisStore.save(updatedState);

  return {
    status: 'UPDATED',
    accountId,
    riskBasis: params.riskBasis,
  };
}
