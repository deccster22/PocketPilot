import type { MarketEvent } from '@/core/types/marketEvent';
import { resolveStrategyPreparedField } from '@/services/trade/createStrategyPreparedRiskReferences';
import type {
  PreparedTradePlanRiskReferences,
  ProtectionPlanIntentType,
} from '@/services/trade/types';

const ACTIONABLE_INTENT_TYPES = new Set<ProtectionPlanIntentType>(['ACCUMULATE', 'REDUCE']);
const PREPARED_RISK_REFERENCE_FIELDS: ReadonlyArray<keyof PreparedTradePlanRiskReferences> = [
  'entryPrice',
  'stopPrice',
  'targetPrice',
];

type PreparedFieldResolution = {
  hasExplicitValue: boolean;
  value: number | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalisePositiveNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

function getExplicitPreparedValue(
  event: MarketEvent,
  field: keyof PreparedTradePlanRiskReferences,
): number | null {
  const preparedRiskReferences = event.metadata.preparedRiskReferences;

  if (!isRecord(preparedRiskReferences)) {
    return null;
  }

  return normalisePositiveNumber(preparedRiskReferences[field]);
}

function resolvePreparedField(
  events: ReadonlyArray<MarketEvent>,
  field: keyof PreparedTradePlanRiskReferences,
): PreparedFieldResolution {
  const distinctValues = new Set<number>();

  events.forEach((event) => {
    const value = getExplicitPreparedValue(event, field);

    if (value !== null) {
      distinctValues.add(value);
    }
  });

  if (distinctValues.size === 0) {
    return {
      hasExplicitValue: false,
      value: null,
    };
  }

  if (distinctValues.size === 1) {
    return {
      hasExplicitValue: true,
      value: [...distinctValues][0] ?? null,
    };
  }

  return {
    hasExplicitValue: true,
    value: null,
  };
}

function resolveFallbackEntryPrice(params: {
  intentType: ProtectionPlanIntentType;
  primaryEvent: MarketEvent | null;
}): number | null {
  if (!ACTIONABLE_INTENT_TYPES.has(params.intentType)) {
    return null;
  }

  if (!params.primaryEvent || params.primaryEvent.certainty !== 'confirmed') {
    return null;
  }

  return normalisePositiveNumber(params.primaryEvent.price);
}

export function normalisePreparedRiskReferences(
  references: PreparedTradePlanRiskReferences | null | undefined,
): PreparedTradePlanRiskReferences | null {
  const preparedRiskReferences = references ?? null;

  if (!preparedRiskReferences) {
    return null;
  }

  const normalised = PREPARED_RISK_REFERENCE_FIELDS.reduce<PreparedTradePlanRiskReferences>(
    (result, field) => ({
      ...result,
      [field]: normalisePositiveNumber(preparedRiskReferences[field]),
    }),
    {
      entryPrice: null,
      stopPrice: null,
      targetPrice: null,
    },
  );

  if (
    normalised.entryPrice === null &&
    normalised.stopPrice === null &&
    normalised.targetPrice === null
  ) {
    return null;
  }

  return normalised;
}

export function createPreparedRiskReferences(params: {
  intentType: ProtectionPlanIntentType;
  primaryEvent: MarketEvent | null;
  events: ReadonlyArray<MarketEvent>;
}): PreparedTradePlanRiskReferences | null {
  const explicitEntry = resolvePreparedField(params.events, 'entryPrice');
  const explicitStop = resolvePreparedField(params.events, 'stopPrice');
  const explicitTarget = resolvePreparedField(params.events, 'targetPrice');
  const strategyEntry = explicitEntry.hasExplicitValue
    ? null
    : resolveStrategyPreparedField(params.events, 'entryPrice');
  const strategyStop = explicitStop.hasExplicitValue
    ? null
    : resolveStrategyPreparedField(params.events, 'stopPrice');
  const strategyTarget = explicitTarget.hasExplicitValue
    ? null
    : resolveStrategyPreparedField(params.events, 'targetPrice');

  return normalisePreparedRiskReferences({
    entryPrice: explicitEntry.hasExplicitValue
      ? explicitEntry.value
      : strategyEntry?.hasStrategyContext
        ? strategyEntry.value
        : resolveFallbackEntryPrice({
            intentType: params.intentType,
            primaryEvent: params.primaryEvent,
          }),
    stopPrice: explicitStop.hasExplicitValue
      ? explicitStop.value
      : strategyStop?.hasStrategyContext
        ? strategyStop.value
        : null,
    targetPrice: explicitTarget.hasExplicitValue
      ? explicitTarget.value
      : strategyTarget?.hasStrategyContext
        ? strategyTarget.value
        : null,
  });
}
