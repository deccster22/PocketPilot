import { createGuardrailEvaluation } from '@/services/trade/createGuardrailEvaluation';
import { createPositionSizingOutput } from '@/services/trade/createPositionSizingOutput';
import { createPreparedTradeRiskLane } from '@/services/trade/createPreparedTradeRiskLane';
import { createRiskInputGuidance } from '@/services/trade/createRiskInputGuidance';
import { fetchGuardrailPreferences } from '@/services/trade/fetchGuardrailPreferences';
import { fetchPreferredRiskBasis } from '@/services/trade/fetchPreferredRiskBasis';
import type { GuardrailPreferencesStore } from '@/services/trade/guardrailPreferencesStore';
import type { PreferredRiskBasisStore } from '@/services/trade/preferredRiskBasisStore';
import type {
  PreparedTradeRiskLane,
  ProtectionPlan,
  RiskBasis,
  TradeHubRiskLane,
} from '@/services/trade/types';

type TradeHubRiskAccountContext = {
  portfolioValue: number | null;
  baseCurrency: string | null;
};

function createUnavailablePreparedRiskLane(): PreparedTradeRiskLane {
  return {
    activeBasis: null,
    activeBasisLabel: null,
    basisAvailability: {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    },
    context: null,
  };
}

export function createUnavailableTradeHubRiskLane(): TradeHubRiskLane {
  return {
    selectedRiskBasis: null,
    preparedRiskLane: createUnavailablePreparedRiskLane(),
    preferredRiskBasisAvailability: {
      status: 'UNAVAILABLE',
      reason: 'NO_ACCOUNT_CONTEXT',
    },
    positionSizingAvailability: {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    },
    riskInputGuidanceAvailability: {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    },
    guardrailPreferencesAvailability: {
      status: 'UNAVAILABLE',
      reason: 'NO_ACCOUNT_CONTEXT',
    },
    guardrailEvaluationAvailability: {
      status: 'UNAVAILABLE',
      reason: 'INSUFFICIENT_CONTEXT',
    },
  };
}

export async function createTradeHubRiskLane(params: {
  plan: ProtectionPlan | null;
  selectedRiskBasis?: RiskBasis | null;
  accountId?: string | null;
  accountContext?: TradeHubRiskAccountContext | null;
  preferredRiskBasisStore?: Pick<PreferredRiskBasisStore, 'load'>;
  guardrailPreferencesStore?: Pick<GuardrailPreferencesStore, 'load'>;
  isEnabledForSurface?: boolean;
}): Promise<TradeHubRiskLane> {
  if (params.isEnabledForSurface === false) {
    return createUnavailableTradeHubRiskLane();
  }

  const accountId = params.accountId ?? null;
  const selectedPlan = params.plan;

  const [preferredRiskBasisAvailability, guardrailPreferencesAvailability] =
    await Promise.all([
      fetchPreferredRiskBasis({
        accountId,
        isEnabledForSurface: selectedPlan !== null,
        preferredRiskBasisStore: params.preferredRiskBasisStore,
      }),
      fetchGuardrailPreferences({
        accountId,
        isEnabledForSurface: true,
        guardrailPreferencesStore: params.guardrailPreferencesStore,
      }),
    ]);

  const preferredBasis =
    preferredRiskBasisAvailability.status === 'AVAILABLE'
      ? preferredRiskBasisAvailability.preferredBasis
      : null;
  const preparedRiskLane = createPreparedTradeRiskLane({
    plan: selectedPlan,
    requestedBasis: params.selectedRiskBasis,
    preferredBasis,
    accountContext: params.accountContext ?? null,
  });
  const positionSizingAvailability = createPositionSizingOutput({
    plan: selectedPlan,
    risk: preparedRiskLane,
    accountContext: params.accountContext ?? null,
  });
  const riskInputGuidanceAvailability = createRiskInputGuidance({
    plan: selectedPlan,
    risk: preparedRiskLane,
    accountContext: params.accountContext ?? null,
    positionSizing: positionSizingAvailability,
  });
  const guardrailEvaluationAvailability = createGuardrailEvaluation({
    plan: selectedPlan,
    risk: preparedRiskLane,
    guardrailPreferencesAvailability,
    accountValue: params.accountContext?.portfolioValue ?? null,
    isEnabledForSurface: true,
  });

  return {
    selectedRiskBasis: preparedRiskLane.activeBasis,
    preparedRiskLane,
    preferredRiskBasisAvailability,
    positionSizingAvailability,
    riskInputGuidanceAvailability,
    guardrailPreferencesAvailability,
    guardrailEvaluationAvailability,
  };
}
