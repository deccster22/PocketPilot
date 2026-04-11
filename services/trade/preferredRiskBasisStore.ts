import type { RiskBasis, PreferredRiskBasis } from '@/services/trade/types';

export type PreferredRiskBasisStore = {
  load(): Promise<ReadonlyArray<PreferredRiskBasis>>;
  save(state: ReadonlyArray<PreferredRiskBasis>): Promise<void>;
};

const EMPTY_PREFERRED_RISK_BASIS_STATE: ReadonlyArray<PreferredRiskBasis> = [];

function normaliseOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isRiskBasis(value: unknown): value is RiskBasis {
  return value === 'ACCOUNT_PERCENT' || value === 'FIXED_CURRENCY' || value === 'POSITION_PERCENT';
}

export function normalisePreferredRiskBasisState(
  state?: ReadonlyArray<Partial<PreferredRiskBasis>> | null,
): PreferredRiskBasis[] {
  const preferredRiskBasisByAccountId = new Map<string, RiskBasis>();

  state?.forEach((entry) => {
    const accountId = normaliseOptionalText(entry.accountId);

    if (!accountId || !isRiskBasis(entry.riskBasis)) {
      return;
    }

    preferredRiskBasisByAccountId.set(accountId, entry.riskBasis);
  });

  return [...preferredRiskBasisByAccountId.entries()]
    .sort(([leftAccountId], [rightAccountId]) => leftAccountId.localeCompare(rightAccountId))
    .map(([accountId, riskBasis]) => ({
      accountId,
      riskBasis,
    }));
}

export function createInMemoryPreferredRiskBasisStore(
  initialState?: ReadonlyArray<Partial<PreferredRiskBasis>> | null,
): PreferredRiskBasisStore & { reset(): void } {
  let currentState = normalisePreferredRiskBasisState(initialState);

  return {
    async load() {
      return [...currentState];
    },
    async save(state) {
      currentState = normalisePreferredRiskBasisState(state);
    },
    reset() {
      currentState = [...EMPTY_PREFERRED_RISK_BASIS_STATE];
    },
  };
}

export const defaultPreferredRiskBasisStore = createInMemoryPreferredRiskBasisStore();
