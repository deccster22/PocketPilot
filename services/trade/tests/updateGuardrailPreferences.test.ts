import {
  createDefaultGuardrailPreferences,
  createInMemoryGuardrailPreferencesStore,
} from '@/services/trade/guardrailPreferencesStore';
import { fetchGuardrailPreferences } from '@/services/trade/fetchGuardrailPreferences';
import { updateGuardrailPreferences } from '@/services/trade/updateGuardrailPreferences';

describe('updateGuardrailPreferences', () => {
  it('stores account-scoped guardrail preferences without crossing state between accounts', async () => {
    const guardrailPreferencesStore = createInMemoryGuardrailPreferencesStore();

    await expect(
      updateGuardrailPreferences({
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
        guardrailPreferencesStore,
      }),
    ).resolves.toEqual({
      status: 'UPDATED',
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
      updateGuardrailPreferences({
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
        guardrailPreferencesStore,
      }),
    ).resolves.toEqual({
      status: 'UPDATED',
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

  it('returns unchanged when the same preference state is written again', async () => {
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
    ]);

    await expect(
      updateGuardrailPreferences({
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
        guardrailPreferencesStore,
      }),
    ).resolves.toEqual({
      status: 'UNCHANGED',
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
  });

  it('rejects missing account context and partial or incomplete configurations honestly', async () => {
    await expect(
      updateGuardrailPreferences({
        accountId: null,
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
            isEnabled: false,
            windowLabel: null,
          },
        },
      }),
    ).resolves.toEqual({
      status: 'REJECTED',
      reason: 'NO_ACCOUNT_CONTEXT',
    });

    await expect(
      updateGuardrailPreferences({
        accountId: 'acct-a',
        preferences: {
          riskLimitPerTrade: {
            isEnabled: true,
            thresholdLabel: '2%',
          },
        },
      }),
    ).resolves.toEqual({
      status: 'REJECTED',
      reason: 'INVALID_CONFIGURATION',
    });

    await expect(
      updateGuardrailPreferences({
        accountId: 'acct-a',
        preferences: {
          riskLimitPerTrade: {
            isEnabled: true,
            thresholdLabel: '2%',
          },
          dailyLossThreshold: {
            isEnabled: true,
            thresholdLabel: '   ',
          },
          cooldownAfterLoss: {
            isEnabled: false,
            windowLabel: null,
          },
        },
      }),
    ).resolves.toEqual({
      status: 'REJECTED',
      reason: 'INVALID_CONFIGURATION',
    });
  });

  it('keeps a first explicit all-off update account-scoped and off by default', async () => {
    const guardrailPreferencesStore = createInMemoryGuardrailPreferencesStore();

    await expect(
      updateGuardrailPreferences({
        accountId: 'acct-a',
        preferences: createDefaultGuardrailPreferences(),
        guardrailPreferencesStore,
      }),
    ).resolves.toEqual({
      status: 'UPDATED',
      accountId: 'acct-a',
      preferences: createDefaultGuardrailPreferences(),
    });

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
});
