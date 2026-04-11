import {
  createDefaultGuardrailPreferences,
  createInMemoryGuardrailPreferencesStore,
} from '@/services/trade/guardrailPreferencesStore';
import { fetchGuardrailPreferences } from '@/services/trade/fetchGuardrailPreferences';

describe('fetchGuardrailPreferences', () => {
  it('returns explicit off-by-default preferences when an account has no saved state', async () => {
    const guardrailPreferencesStore = createInMemoryGuardrailPreferencesStore();

    await expect(
      fetchGuardrailPreferences({
        accountId: 'acct-a',
        isEnabledForSurface: true,
        guardrailPreferencesStore,
      }),
    ).resolves.toEqual({
      status: 'AVAILABLE',
      accountId: 'acct-a',
      preferences: createDefaultGuardrailPreferences(),
    });
  });

  it('keeps account-scoped preference states isolated from one another', async () => {
    const guardrailPreferencesStore = createInMemoryGuardrailPreferencesStore([
      {
        accountId: 'acct-a',
        preferences: {
          riskLimitPerTrade: {
            isEnabled: true,
            thresholdLabel: '2%',
          },
          dailyLossThreshold: {
            isEnabled: false,
            thresholdLabel: null,
          },
          cooldownAfterLoss: {
            isEnabled: true,
            windowLabel: '1 day',
          },
        },
      },
      {
        accountId: 'acct-b',
        preferences: {
          riskLimitPerTrade: {
            isEnabled: false,
            thresholdLabel: null,
          },
          dailyLossThreshold: {
            isEnabled: true,
            thresholdLabel: '4%',
          },
          cooldownAfterLoss: {
            isEnabled: false,
            windowLabel: null,
          },
        },
      },
    ]);

    await expect(
      fetchGuardrailPreferences({
        accountId: 'acct-a',
        isEnabledForSurface: true,
        guardrailPreferencesStore,
      }),
    ).resolves.toEqual({
      status: 'AVAILABLE',
      accountId: 'acct-a',
      preferences: {
        riskLimitPerTrade: {
          isEnabled: true,
          thresholdLabel: '2%',
        },
        dailyLossThreshold: {
          isEnabled: false,
          thresholdLabel: null,
        },
        cooldownAfterLoss: {
          isEnabled: true,
          windowLabel: '1 day',
        },
      },
    });

    await expect(
      fetchGuardrailPreferences({
        accountId: 'acct-b',
        isEnabledForSurface: true,
        guardrailPreferencesStore,
      }),
    ).resolves.toEqual({
      status: 'AVAILABLE',
      accountId: 'acct-b',
      preferences: {
        riskLimitPerTrade: {
          isEnabled: false,
          thresholdLabel: null,
        },
        dailyLossThreshold: {
          isEnabled: true,
          thresholdLabel: '4%',
        },
        cooldownAfterLoss: {
          isEnabled: false,
          windowLabel: null,
        },
      },
    });
  });

  it('keeps unavailable states honest when the surface is disabled or account context is missing', async () => {
    await expect(
      fetchGuardrailPreferences({
        accountId: 'acct-a',
        isEnabledForSurface: false,
      }),
    ).resolves.toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });

    await expect(
      fetchGuardrailPreferences({
        accountId: null,
        isEnabledForSurface: true,
      }),
    ).resolves.toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_ACCOUNT_CONTEXT',
    });
  });
});
