import { createInMemoryPreferredRiskBasisStore } from '@/services/trade/preferredRiskBasisStore';
import { fetchPreferredRiskBasis } from '@/services/trade/fetchPreferredRiskBasis';

describe('fetchPreferredRiskBasis', () => {
  it('returns the saved basis for one account without crossing into another account', async () => {
    const preferredRiskBasisStore = createInMemoryPreferredRiskBasisStore([
      {
        accountId: 'acct-a',
        riskBasis: 'FIXED_CURRENCY',
      },
      {
        accountId: 'acct-b',
        riskBasis: 'POSITION_PERCENT',
      },
    ]);

    await expect(
      fetchPreferredRiskBasis({
        accountId: 'acct-a',
        isEnabledForSurface: true,
        preferredRiskBasisStore,
      }),
    ).resolves.toEqual({
      status: 'AVAILABLE',
      accountId: 'acct-a',
      preferredBasis: 'FIXED_CURRENCY',
    });

    await expect(
      fetchPreferredRiskBasis({
        accountId: 'acct-b',
        isEnabledForSurface: true,
        preferredRiskBasisStore,
      }),
    ).resolves.toEqual({
      status: 'AVAILABLE',
      accountId: 'acct-b',
      preferredBasis: 'POSITION_PERCENT',
    });
  });

  it('returns available with no saved basis when the account has no preference yet', async () => {
    const preferredRiskBasisStore = createInMemoryPreferredRiskBasisStore();

    await expect(
      fetchPreferredRiskBasis({
        accountId: 'acct-a',
        isEnabledForSurface: true,
        preferredRiskBasisStore,
      }),
    ).resolves.toEqual({
      status: 'AVAILABLE',
      accountId: 'acct-a',
      preferredBasis: null,
    });
  });

  it('keeps unavailable states honest when the surface is disabled or the account context is missing', async () => {
    await expect(
      fetchPreferredRiskBasis({
        accountId: 'acct-a',
        isEnabledForSurface: false,
      }),
    ).resolves.toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });

    await expect(
      fetchPreferredRiskBasis({
        accountId: null,
        isEnabledForSurface: true,
      }),
    ).resolves.toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_ACCOUNT_CONTEXT',
    });
  });
});
