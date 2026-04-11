import { createRiskPerTradeContext } from '@/services/trade/createRiskPerTradeContext';
import { selectRiskBasis } from '@/services/trade/selectRiskBasis';
import type {
  PreparedTradeRiskLane,
  ProtectionPlan,
  RiskBasis,
} from '@/services/trade/types';

type AccountRiskContext = {
  portfolioValue: number | null;
  baseCurrency: string | null;
};

function getSelectedBasisLabel(
  basisAvailability: PreparedTradeRiskLane['basisAvailability'],
): string | null {
  if (basisAvailability.status !== 'AVAILABLE') {
    return null;
  }

  return basisAvailability.options.find((option) => option.isSelected)?.label ?? null;
}

export function createPreparedTradeRiskLane(params: {
  plan: ProtectionPlan | null;
  requestedBasis?: RiskBasis | null;
  accountContext?: AccountRiskContext | null;
}): PreparedTradeRiskLane {
  const selection = selectRiskBasis({
    requestedBasis: params.requestedBasis,
    isEnabledForSurface: params.plan !== null,
  });

  if (selection.status === 'UNAVAILABLE') {
    return {
      activeBasis: null,
      activeBasisLabel: null,
      basisAvailability: selection.availability,
      context: null,
    };
  }

  return {
    activeBasis: selection.selectedBasis,
    activeBasisLabel: getSelectedBasisLabel(selection.availability),
    basisAvailability: selection.availability,
    context:
      params.plan === null
        ? null
        : createRiskPerTradeContext({
            selectedBasis: selection.selectedBasis,
            plan: params.plan,
            accountContext: params.accountContext,
          }),
  };
}
