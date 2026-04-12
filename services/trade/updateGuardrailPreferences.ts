import {
  areGuardrailPreferencesEqual,
  createDefaultGuardrailPreferences,
  defaultGuardrailPreferencesStore,
  normaliseGuardrailPreferencesState,
  type GuardrailPreferencesStore,
} from '@/services/trade/guardrailPreferencesStore';
import type {
  GuardrailCooldownSetting,
  GuardrailPreferenceSetting,
  GuardrailPreferences,
  GuardrailPreferencesInput,
  GuardrailPreferencesUpdateResult,
} from '@/services/trade/types';

function normaliseOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOwnProperty(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function normaliseGuardrailPreferenceSetting(
  value: unknown,
): GuardrailPreferenceSetting | null {
  if (!isPlainObject(value) || typeof value.isEnabled !== 'boolean') {
    return null;
  }

  if (!value.isEnabled) {
    return {
      isEnabled: false,
      thresholdLabel: null,
    };
  }

  const thresholdLabel = normaliseOptionalText(value.thresholdLabel as string | null | undefined);

  if (thresholdLabel === null) {
    return null;
  }

  return {
    isEnabled: true,
    thresholdLabel,
  };
}

function normaliseGuardrailCooldownSetting(value: unknown): GuardrailCooldownSetting | null {
  if (!isPlainObject(value) || typeof value.isEnabled !== 'boolean') {
    return null;
  }

  if (!value.isEnabled) {
    return {
      isEnabled: false,
      windowLabel: null,
    };
  }

  const windowLabel = normaliseOptionalText(value.windowLabel as string | null | undefined);

  if (windowLabel === null) {
    return null;
  }

  return {
    isEnabled: true,
    windowLabel,
  };
}

function normaliseGuardrailPreferencesInput(
  preferences: GuardrailPreferencesInput | null | undefined,
): GuardrailPreferences | null {
  if (!isPlainObject(preferences)) {
    return null;
  }

  if (
    !hasOwnProperty(preferences, 'riskLimitPerTrade') ||
    !hasOwnProperty(preferences, 'dailyLossThreshold') ||
    !hasOwnProperty(preferences, 'cooldownAfterLoss')
  ) {
    return null;
  }

  const riskLimitPerTrade = normaliseGuardrailPreferenceSetting(preferences.riskLimitPerTrade);
  const dailyLossThreshold = normaliseGuardrailPreferenceSetting(preferences.dailyLossThreshold);
  const cooldownAfterLoss = normaliseGuardrailCooldownSetting(preferences.cooldownAfterLoss);

  if (!riskLimitPerTrade || !dailyLossThreshold || !cooldownAfterLoss) {
    return null;
  }

  return {
    riskLimitPerTrade,
    dailyLossThreshold,
    cooldownAfterLoss,
  };
}

function sortGuardrailPreferencesState(
  state: ReturnType<typeof normaliseGuardrailPreferencesState>,
): ReturnType<typeof normaliseGuardrailPreferencesState> {
  return [...state].sort((left, right) => left.accountId.localeCompare(right.accountId));
}

export async function updateGuardrailPreferences(params: {
  accountId?: string | null;
  preferences: GuardrailPreferencesInput | null | undefined;
  guardrailPreferencesStore?: Pick<GuardrailPreferencesStore, 'load' | 'save'>;
}): Promise<GuardrailPreferencesUpdateResult> {
  const accountId = normaliseOptionalText(params.accountId);

  if (accountId === null) {
    return {
      status: 'REJECTED',
      reason: 'NO_ACCOUNT_CONTEXT',
    };
  }

  const preferences = normaliseGuardrailPreferencesInput(params.preferences);

  if (preferences === null) {
    return {
      status: 'REJECTED',
      reason: 'INVALID_CONFIGURATION',
    };
  }

  const guardrailPreferencesStore =
    params.guardrailPreferencesStore ?? defaultGuardrailPreferencesStore;
  const currentState = normaliseGuardrailPreferencesState(await guardrailPreferencesStore.load());
  const currentRecord = currentState.find((entry) => entry.accountId === accountId);
  const existingPreferences = currentRecord?.preferences ?? createDefaultGuardrailPreferences();

  if (currentRecord && areGuardrailPreferencesEqual(existingPreferences, preferences)) {
    return {
      status: 'UNCHANGED',
      accountId,
      preferences,
    };
  }

  const updatedState = sortGuardrailPreferencesState([
    ...currentState.filter((entry) => entry.accountId !== accountId),
    {
      accountId,
      preferences,
    },
  ]);

  await guardrailPreferencesStore.save(updatedState);

  return {
    status: 'UPDATED',
    accountId,
    preferences,
  };
}
