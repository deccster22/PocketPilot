import { createInMemoryPreferredRiskBasisStore } from '@/services/trade/preferredRiskBasisStore';
import { fetchPreferredRiskBasis } from '@/services/trade/fetchPreferredRiskBasis';
import { updatePreferredRiskBasis } from '@/services/trade/updatePreferredRiskBasis';

describe('updatePreferredRiskBasis', () => {
  it('stores one preferred basis per account and keeps accounts isolated', async () => {
    const preferredRiskBasisStore = createInMemoryPreferredRiskBasisStore();

    await expect(
      updatePreferredRiskBasis({
        accountId: 'acct-a',
        riskBasis: 'ACCOUNT_PERCENT',
        preferredRiskBasisStore,
      }),
    ).resolves.toEqual({
      status: 'UPDATED',
      accountId: 'acct-a',
      riskBasis: 'ACCOUNT_PERCENT',
    });

    await expect(
      updatePreferredRiskBasis({
        accountId: 'acct-b',
        riskBasis: 'POSITION_PERCENT',
        preferredRiskBasisStore,
      }),
    ).resolves.toEqual({
      status: 'UPDATED',
      accountId: 'acct-b',
      riskBasis: 'POSITION_PERCENT',
    });

    await expect(
      fetchPreferredRiskBasis({
        accountId: 'acct-a',
        isEnabledForSurface: true,
        preferredRiskBasisStore,
      }),
    ).resolves.toEqual({
      status: 'AVAILABLE',
      accountId: 'acct-a',
      preferredBasis: 'ACCOUNT_PERCENT',
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

  it('returns unchanged when the same preferred basis is written again', async () => {
    const preferredRiskBasisStore = createInMemoryPreferredRiskBasisStore([
      {
        accountId: 'acct-a',
        riskBasis: 'FIXED_CURRENCY',
      },
    ]);

    await expect(
      updatePreferredRiskBasis({
        accountId: 'acct-a',
        riskBasis: 'FIXED_CURRENCY',
        preferredRiskBasisStore,
      }),
    ).resolves.toEqual({
      status: 'UNCHANGED',
      accountId: 'acct-a',
      riskBasis: 'FIXED_CURRENCY',
    });
  });

  it('rejects unsupported bases and missing account context honestly', async () => {
    await expect(
      updatePreferredRiskBasis({
        accountId: 'acct-a',
        riskBasis: 'NOT_A_BASIS',
      }),
    ).resolves.toEqual({
      status: 'REJECTED',
      reason: 'UNSUPPORTED_RISK_BASIS',
    });

    await expect(
      updatePreferredRiskBasis({
        accountId: null,
        riskBasis: 'ACCOUNT_PERCENT',
      }),
    ).resolves.toEqual({
      status: 'REJECTED',
      reason: 'NO_ACCOUNT_CONTEXT',
    });
  });
});
