import { selectRiskBasis } from '@/services/trade/selectRiskBasis';

describe('selectRiskBasis', () => {
  it('returns one explicit default basis when the surface supports risk framing', () => {
    expect(
      selectRiskBasis({
        isEnabledForSurface: true,
      }),
    ).toEqual({
      status: 'APPLIED',
      selectedBasis: 'ACCOUNT_PERCENT',
      availability: {
        status: 'AVAILABLE',
        selectedBasis: 'ACCOUNT_PERCENT',
        options: [
          {
            basis: 'ACCOUNT_PERCENT',
            label: 'Account %',
            isSelected: true,
          },
          {
            basis: 'FIXED_CURRENCY',
            label: 'Fixed currency',
            isSelected: false,
          },
          {
            basis: 'POSITION_PERCENT',
            label: 'Position %',
            isSelected: false,
          },
        ],
      },
    });
  });

  it('applies an explicit supported basis without hiding the selected option state', () => {
    expect(
      selectRiskBasis({
        requestedBasis: 'FIXED_CURRENCY',
        isEnabledForSurface: true,
      }),
    ).toEqual({
      status: 'APPLIED',
      selectedBasis: 'FIXED_CURRENCY',
      availability: {
        status: 'AVAILABLE',
        selectedBasis: 'FIXED_CURRENCY',
        options: [
          {
            basis: 'ACCOUNT_PERCENT',
            label: 'Account %',
            isSelected: false,
          },
          {
            basis: 'FIXED_CURRENCY',
            label: 'Fixed currency',
            isSelected: true,
          },
          {
            basis: 'POSITION_PERCENT',
            label: 'Position %',
            isSelected: false,
          },
        ],
      },
    });
  });

  it('returns an honest unavailable result when risk framing is not enabled for the surface', () => {
    expect(
      selectRiskBasis({
        requestedBasis: 'POSITION_PERCENT',
        isEnabledForSurface: false,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
    });
  });

  it('rejects unsupported basis requests instead of silently switching them', () => {
    expect(
      selectRiskBasis({
        requestedBasis: 'NOT_A_BASIS',
        isEnabledForSurface: true,
      }),
    ).toEqual({
      status: 'REJECTED',
      requestedBasis: 'NOT_A_BASIS',
      reason: 'REQUESTED_BASIS_NOT_SUPPORTED',
      selectedBasis: 'ACCOUNT_PERCENT',
      availability: {
        status: 'AVAILABLE',
        selectedBasis: 'ACCOUNT_PERCENT',
        options: [
          {
            basis: 'ACCOUNT_PERCENT',
            label: 'Account %',
            isSelected: true,
          },
          {
            basis: 'FIXED_CURRENCY',
            label: 'Fixed currency',
            isSelected: false,
          },
          {
            basis: 'POSITION_PERCENT',
            label: 'Position %',
            isSelected: false,
          },
        ],
      },
    });
  });
});
