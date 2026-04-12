import type {
  GuardrailCooldownSetting,
  GuardrailPreferenceSetting,
  GuardrailPreferences,
} from '@/services/trade/types';

export type GuardrailPreferencesRecord = {
  accountId: string;
  preferences: GuardrailPreferences;
};

export type GuardrailPreferencesStore = {
  load(): Promise<ReadonlyArray<GuardrailPreferencesRecord>>;
  save(state: ReadonlyArray<GuardrailPreferencesRecord>): Promise<void>;
};

const EMPTY_GUARDRAIL_PREFERENCES_STATE: ReadonlyArray<GuardrailPreferencesRecord> = [];

export function createDefaultGuardrailPreferences(): GuardrailPreferences {
  return {
    riskLimitPerTrade: {
      isEnabled: false,
      thresholdLabel: null,
    },
    dailyLossThreshold: {
      isEnabled: false,
      thresholdLabel: null,
    },
    cooldownAfterLoss: {
      isEnabled: false,
      windowLabel: null,
    },
  };
}

function normaliseOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normaliseGuardrailPreferenceSetting(
  value?: Partial<GuardrailPreferenceSetting> | null,
): GuardrailPreferenceSetting {
  const isEnabled = value?.isEnabled === true;

  return {
    isEnabled,
    thresholdLabel: isEnabled ? normaliseOptionalText(value?.thresholdLabel) : null,
  };
}

function normaliseGuardrailCooldownSetting(
  value?: Partial<GuardrailCooldownSetting> | null,
): GuardrailCooldownSetting {
  const isEnabled = value?.isEnabled === true;

  return {
    isEnabled,
    windowLabel: isEnabled ? normaliseOptionalText(value?.windowLabel) : null,
  };
}

export function normaliseGuardrailPreferences(
  preferences?: Partial<GuardrailPreferences> | null,
): GuardrailPreferences {
  return {
    riskLimitPerTrade: normaliseGuardrailPreferenceSetting(preferences?.riskLimitPerTrade),
    dailyLossThreshold: normaliseGuardrailPreferenceSetting(preferences?.dailyLossThreshold),
    cooldownAfterLoss: normaliseGuardrailCooldownSetting(preferences?.cooldownAfterLoss),
  };
}

export function areGuardrailPreferencesEqual(
  left: GuardrailPreferences,
  right: GuardrailPreferences,
): boolean {
  return (
    left.riskLimitPerTrade.isEnabled === right.riskLimitPerTrade.isEnabled &&
    left.riskLimitPerTrade.thresholdLabel === right.riskLimitPerTrade.thresholdLabel &&
    left.dailyLossThreshold.isEnabled === right.dailyLossThreshold.isEnabled &&
    left.dailyLossThreshold.thresholdLabel === right.dailyLossThreshold.thresholdLabel &&
    left.cooldownAfterLoss.isEnabled === right.cooldownAfterLoss.isEnabled &&
    left.cooldownAfterLoss.windowLabel === right.cooldownAfterLoss.windowLabel
  );
}

export function normaliseGuardrailPreferencesState(
  state?: ReadonlyArray<Partial<GuardrailPreferencesRecord>> | null,
): GuardrailPreferencesRecord[] {
  const preferencesByAccountId = new Map<string, GuardrailPreferences>();

  state?.forEach((entry) => {
    const accountId = normaliseOptionalText(entry.accountId);

    if (!accountId) {
      return;
    }

    preferencesByAccountId.set(accountId, normaliseGuardrailPreferences(entry.preferences));
  });

  return [...preferencesByAccountId.entries()]
    .sort(([leftAccountId], [rightAccountId]) => leftAccountId.localeCompare(rightAccountId))
    .map(([accountId, preferences]) => ({
      accountId,
      preferences,
    }));
}

export function createInMemoryGuardrailPreferencesStore(
  initialState?: ReadonlyArray<Partial<GuardrailPreferencesRecord>> | null,
): GuardrailPreferencesStore & { reset(): void } {
  let currentState = normaliseGuardrailPreferencesState(initialState);

  return {
    async load() {
      return [...currentState];
    },
    async save(state) {
      currentState = normaliseGuardrailPreferencesState(state);
    },
    reset() {
      currentState = [...EMPTY_GUARDRAIL_PREFERENCES_STATE];
    },
  };
}

export const defaultGuardrailPreferencesStore = createInMemoryGuardrailPreferencesStore();
