import type {
  AccountContextCandidate,
  AccountPreferenceState,
  AccountPreferenceStore,
} from '@/services/accounts/types';

const EMPTY_ACCOUNT_PREFERENCE_STATE: AccountPreferenceState = {
  selectedAccountId: null,
  primaryAccountId: null,
};

function normaliseOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normaliseAccountPreferenceState(
  state?: Partial<AccountPreferenceState> | null,
): AccountPreferenceState {
  return {
    selectedAccountId: normaliseOptionalText(state?.selectedAccountId),
    primaryAccountId: normaliseOptionalText(state?.primaryAccountId),
  };
}

export function createInMemoryAccountPreferenceStore(
  initialState?: Partial<AccountPreferenceState> | null,
): AccountPreferenceStore & { reset(): void } {
  let currentState = normaliseAccountPreferenceState(initialState);

  return {
    async load() {
      return { ...currentState };
    },
    async save(state) {
      currentState = normaliseAccountPreferenceState(state);
    },
    reset() {
      currentState = EMPTY_ACCOUNT_PREFERENCE_STATE;
    },
  };
}

export function applyPrimaryAccountPreference(params: {
  accounts: ReadonlyArray<AccountContextCandidate>;
  primaryAccountId?: string | null;
}): AccountContextCandidate[] {
  const preferredPrimaryAccountId = normaliseOptionalText(params.primaryAccountId);

  if (preferredPrimaryAccountId === null) {
    return [...params.accounts];
  }

  const hasPreferredPrimary = params.accounts.some(
    (account) => normaliseOptionalText(account.id) === preferredPrimaryAccountId,
  );

  if (!hasPreferredPrimary) {
    return [...params.accounts];
  }

  return params.accounts.map((account) => ({
    ...account,
    isPrimary: normaliseOptionalText(account.id) === preferredPrimaryAccountId,
  }));
}

export const defaultAccountPreferenceStore = createInMemoryAccountPreferenceStore();
