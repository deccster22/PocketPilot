import type {
  PreparedRiskPlanContext,
  PreparedRiskQuoteContext,
  RiskReferenceSource,
  RiskReferenceValue,
  RiskToolInput,
  RiskToolReferences,
} from '@/services/risk/types';

type SelectRiskReferencesParams = {
  input: RiskToolInput;
  preparedQuoteContext?: PreparedRiskQuoteContext | null;
  preparedPlanContext?: PreparedRiskPlanContext | null;
};

function normalisePositiveNumber(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

function createReference(value: number | null, source: RiskReferenceSource): RiskReferenceValue {
  if (value === null) {
    return {
      value: null,
      source: 'UNAVAILABLE',
    };
  }

  return {
    value,
    source,
  };
}

function selectReference(params: {
  explicitValue: number | null;
  preparedPlanValue?: number | null;
  preparedQuoteValue?: number | null;
  allowPreparedReferences: boolean;
}): RiskReferenceValue {
  if (params.explicitValue !== null) {
    return createReference(params.explicitValue, 'USER_INPUT');
  }

  if (!params.allowPreparedReferences) {
    return createReference(null, 'UNAVAILABLE');
  }

  const preparedPlanValue = normalisePositiveNumber(params.preparedPlanValue);

  if (preparedPlanValue !== null) {
    return createReference(preparedPlanValue, 'PREPARED_PLAN');
  }

  const preparedQuoteValue = normalisePositiveNumber(params.preparedQuoteValue);

  if (preparedQuoteValue !== null) {
    return createReference(preparedQuoteValue, 'PREPARED_QUOTE');
  }

  return createReference(null, 'UNAVAILABLE');
}

export function selectRiskReferences(params: SelectRiskReferencesParams): RiskToolReferences {
  const allowPreparedReferences = params.input.allowPreparedReferences !== false;
  const explicitEntryPrice = normalisePositiveNumber(params.input.entryPrice);
  const explicitStopPrice = normalisePositiveNumber(params.input.stopPrice);
  const explicitTargetPrice = normalisePositiveNumber(params.input.targetPrice);

  return {
    entryReference: selectReference({
      explicitValue: explicitEntryPrice,
      preparedPlanValue: params.preparedPlanContext?.entryPrice,
      preparedQuoteValue: params.preparedQuoteContext?.currentPrice,
      allowPreparedReferences,
    }),
    stopReference: selectReference({
      explicitValue: explicitStopPrice,
      preparedPlanValue: params.preparedPlanContext?.stopPrice,
      allowPreparedReferences,
    }),
    targetReference: selectReference({
      explicitValue: explicitTargetPrice,
      preparedPlanValue: params.preparedPlanContext?.targetPrice,
      allowPreparedReferences,
    }),
  };
}
