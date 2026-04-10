import type {
  RiskBasis,
  RiskBasisAvailability,
  RiskBasisSelectionResult,
} from '@/services/trade/types';

const RISK_BASIS_OPTIONS: ReadonlyArray<{
  basis: RiskBasis;
  label: string;
}> = [
  {
    basis: 'ACCOUNT_PERCENT',
    label: 'Account %',
  },
  {
    basis: 'FIXED_CURRENCY',
    label: 'Fixed currency',
  },
  {
    basis: 'POSITION_PERCENT',
    label: 'Position %',
  },
];

function isRiskBasis(value: unknown): value is RiskBasis {
  return RISK_BASIS_OPTIONS.some((option) => option.basis === value);
}

function createAvailableAvailability(
  selectedBasis: RiskBasis,
): Extract<RiskBasisAvailability, { status: 'AVAILABLE' }> {
  return {
    status: 'AVAILABLE',
    selectedBasis,
    options: RISK_BASIS_OPTIONS.map((option) => ({
      basis: option.basis,
      label: option.label,
      isSelected: option.basis === selectedBasis,
    })),
  };
}

export function selectRiskBasis(params: {
  requestedBasis?: string | null;
  isEnabledForSurface: boolean;
}): RiskBasisSelectionResult {
  if (!params.isEnabledForSurface) {
    return {
      status: 'UNAVAILABLE',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
    };
  }

  const defaultBasis = RISK_BASIS_OPTIONS[0]?.basis;

  if (!defaultBasis) {
    return {
      status: 'UNAVAILABLE',
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_SUPPORTED_RISK_BASIS',
      },
    };
  }

  if (params.requestedBasis == null) {
    return {
      status: 'APPLIED',
      availability: createAvailableAvailability(defaultBasis),
      selectedBasis: defaultBasis,
    };
  }

  if (!isRiskBasis(params.requestedBasis)) {
    return {
      status: 'REJECTED',
      requestedBasis: params.requestedBasis,
      reason: 'REQUESTED_BASIS_NOT_SUPPORTED',
      availability: createAvailableAvailability(defaultBasis),
      selectedBasis: defaultBasis,
    };
  }

  return {
    status: 'APPLIED',
    availability: createAvailableAvailability(params.requestedBasis),
    selectedBasis: params.requestedBasis,
  };
}
