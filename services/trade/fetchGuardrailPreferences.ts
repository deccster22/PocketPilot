import {
  createDefaultGuardrailPreferences,
  defaultGuardrailPreferencesStore,
  type GuardrailPreferencesStore,
} from '@/services/trade/guardrailPreferencesStore';
import type { GuardrailPreferencesAvailability } from '@/services/trade/types';

function normaliseOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function fetchGuardrailPreferences(params: {
  accountId?: string | null;
  isEnabledForSurface: boolean;
  guardrailPreferencesStore?: Pick<GuardrailPreferencesStore, 'load'>;
}): Promise<GuardrailPreferencesAvailability> {
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

  const guardrailPreferencesStore =
    params.guardrailPreferencesStore ?? defaultGuardrailPreferencesStore;
  const guardrailPreferences = (await guardrailPreferencesStore.load()).find(
    (entry) => entry.accountId === accountId,
  );

  return {
    status: 'AVAILABLE',
    accountId,
    preferences: guardrailPreferences?.preferences ?? createDefaultGuardrailPreferences(),
  };
}
