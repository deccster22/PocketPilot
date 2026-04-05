import type { MarketEvent } from '@/core/types/marketEvent';
import type { PreparedTradePlanRiskReferences } from '@/services/trade/types';

type PreparedFieldResolution = {
  hasStrategyContext: boolean;
  value: number | null;
};

type StrategyPreparedRiskBasis = 'BASELINE_PRICE' | 'EVENT_PRICE';

type StrategyPreparedRiskFieldContext = {
  basis: StrategyPreparedRiskBasis;
};

type StrategyPreparedRiskField = keyof PreparedTradePlanRiskReferences;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalisePositiveNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

function normalisePctChange(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

function normaliseBasis(value: unknown): StrategyPreparedRiskBasis | null {
  return value === 'BASELINE_PRICE' || value === 'EVENT_PRICE' ? value : null;
}

function hasSingleScopedSymbol(event: MarketEvent): boolean {
  if (event.symbol === null) {
    return false;
  }

  const relatedSymbols = event.metadata.relatedSymbols;

  if (!Array.isArray(relatedSymbols)) {
    return true;
  }

  return relatedSymbols.length === 1 && relatedSymbols[0] === event.symbol;
}

function getStrategyFieldContext(
  event: MarketEvent,
  field: StrategyPreparedRiskField,
): StrategyPreparedRiskFieldContext | null {
  const strategyPreparedRiskContext = event.metadata.strategyPreparedRiskContext;

  if (!isRecord(strategyPreparedRiskContext)) {
    return null;
  }

  const fieldContext = strategyPreparedRiskContext[field];

  if (!isRecord(fieldContext)) {
    return null;
  }

  const basis = normaliseBasis(fieldContext.basis);

  if (basis === null) {
    return null;
  }

  return {
    basis,
  };
}

function deriveBaselinePrice(event: MarketEvent): number | null {
  if (event.certainty !== 'confirmed') {
    return null;
  }

  const currentPrice = normalisePositiveNumber(event.price);
  const pctChange = normalisePctChange(event.pctChange);

  if (currentPrice === null || pctChange === null || pctChange <= -1) {
    return null;
  }

  return normalisePositiveNumber(currentPrice / (1 + pctChange));
}

function deriveStrategyValue(params: {
  event: MarketEvent;
  field: StrategyPreparedRiskField;
  fieldContext: StrategyPreparedRiskFieldContext;
}): number | null {
  if (!hasSingleScopedSymbol(params.event)) {
    return null;
  }

  switch (params.fieldContext.basis) {
    case 'EVENT_PRICE':
      if (params.field !== 'entryPrice' || params.event.certainty !== 'confirmed') {
        return null;
      }

      return normalisePositiveNumber(params.event.price);
    case 'BASELINE_PRICE': {
      const currentPrice = normalisePositiveNumber(params.event.price);
      const baselinePrice = deriveBaselinePrice(params.event);

      if (currentPrice === null || baselinePrice === null) {
        return null;
      }

      if (params.field === 'stopPrice' && baselinePrice < currentPrice) {
        return baselinePrice;
      }

      if (params.field === 'targetPrice' && baselinePrice > currentPrice) {
        return baselinePrice;
      }

      return null;
    }
    default:
      return null;
  }
}

export function resolveStrategyPreparedField(
  events: ReadonlyArray<MarketEvent>,
  field: StrategyPreparedRiskField,
): PreparedFieldResolution {
  const distinctValues = new Set<number>();
  let hasStrategyContext = false;
  let hasInvalidContext = false;

  events.forEach((event) => {
    const fieldContext = getStrategyFieldContext(event, field);

    if (!fieldContext) {
      return;
    }

    hasStrategyContext = true;

    const value = deriveStrategyValue({
      event,
      field,
      fieldContext,
    });

    if (value === null) {
      hasInvalidContext = true;
      return;
    }

    distinctValues.add(value);
  });

  if (!hasStrategyContext) {
    return {
      hasStrategyContext: false,
      value: null,
    };
  }

  if (hasInvalidContext || distinctValues.size !== 1) {
    return {
      hasStrategyContext: true,
      value: null,
    };
  }

  return {
    hasStrategyContext: true,
    value: [...distinctValues][0] ?? null,
  };
}
