import type {
  RiskReferenceValue,
  RiskToolInput,
  RiskToolReferences,
  RiskToolState,
  RiskToolVM,
} from '@/services/risk/types';

type RiskToolContext = {
  symbol: string | null;
  hasPreparedContext?: boolean;
};

export type CreateRiskToolVMParams = {
  input: RiskToolInput;
  references?: RiskToolReferences | null;
  context?: RiskToolContext | null;
  generatedAt?: string | null;
  generatedAtMs?: number | null;
};

function toIsoString(timestampMs: number | null | undefined): string | null {
  if (typeof timestampMs !== 'number' || !Number.isFinite(timestampMs)) {
    return null;
  }

  return new Date(timestampMs).toISOString();
}

function normalisePositiveNumber(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

function normaliseSymbol(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function createUnavailableReference(): RiskReferenceValue {
  return {
    value: null,
    source: 'UNAVAILABLE',
  };
}

function normaliseReference(reference: RiskReferenceValue | null | undefined): RiskReferenceValue {
  const value = normalisePositiveNumber(reference?.value);

  if (value === null) {
    return createUnavailableReference();
  }

  if (!reference || reference.source === 'UNAVAILABLE') {
    return createUnavailableReference();
  }

  return {
    value,
    source: reference.source,
  };
}

function hasAvailableReference(reference: RiskReferenceValue): boolean {
  return reference.value !== null && reference.source !== 'UNAVAILABLE';
}

function hasExplicitInput(input: RiskToolInput): boolean {
  return (
    input.accountSize !== null ||
    input.riskAmount !== null ||
    input.riskPercent !== null ||
    input.entryPrice !== null ||
    input.stopPrice !== null ||
    input.targetPrice !== null ||
    normaliseSymbol(input.symbol) !== null
  );
}

function resolveGeneratedAt(params: CreateRiskToolVMParams): string | null {
  if (params.generatedAt !== undefined) {
    return params.generatedAt;
  }

  return toIsoString(params.generatedAtMs);
}

function resolveRiskAmount(params: {
  explicitRiskAmount: number | null;
  accountSize: number | null;
  riskPercent: number | null;
}): number | null {
  if (params.explicitRiskAmount !== null) {
    return params.explicitRiskAmount;
  }

  if (params.accountSize === null || params.riskPercent === null) {
    return null;
  }

  return (params.accountSize * params.riskPercent) / 100;
}

function resolveRiskPercent(params: {
  explicitRiskAmount: number | null;
  accountSize: number | null;
  riskAmount: number | null;
  riskPercent: number | null;
}): number | null {
  if (params.accountSize !== null && params.riskAmount !== null) {
    return (params.riskAmount / params.accountSize) * 100;
  }

  if (params.explicitRiskAmount !== null) {
    return params.riskPercent;
  }

  return params.riskPercent;
}

function resolveStopDistance(entryPrice: number | null, stopPrice: number | null): number | null {
  if (entryPrice === null || stopPrice === null || entryPrice === stopPrice) {
    return null;
  }

  return Math.abs(entryPrice - stopPrice);
}

function resolveRewardRiskRatio(params: {
  entryPrice: number | null;
  stopPrice: number | null;
  targetPrice: number | null;
  stopDistance: number | null;
}): number | null {
  if (
    params.entryPrice === null ||
    params.stopPrice === null ||
    params.targetPrice === null ||
    params.stopDistance === null
  ) {
    return null;
  }

  const isLongFrame = params.stopPrice < params.entryPrice;
  const isShortFrame = params.stopPrice > params.entryPrice;

  if (!isLongFrame && !isShortFrame) {
    return null;
  }

  if (isLongFrame && params.targetPrice <= params.entryPrice) {
    return null;
  }

  if (isShortFrame && params.targetPrice >= params.entryPrice) {
    return null;
  }

  return Math.abs(params.targetPrice - params.entryPrice) / params.stopDistance;
}

function resolveState(params: {
  hasContext: boolean;
  stopDistance: number | null;
  riskAmount: number | null;
  positionSize: number | null;
}): RiskToolState {
  if (!params.hasContext) {
    return 'UNAVAILABLE';
  }

  if (params.stopDistance !== null && params.riskAmount !== null && params.positionSize !== null) {
    return 'READY';
  }

  return 'INCOMPLETE';
}

function buildNotes(params: {
  state: RiskToolState;
  stopDistance: number | null;
  riskAmount: number | null;
  entryPrice: number | null;
  targetPrice: number | null;
  rewardRiskRatio: number | null;
}): string[] {
  if (params.state === 'UNAVAILABLE') {
    return [];
  }

  const notes: string[] = [];

  if (params.stopDistance === null) {
    notes.push('Add distinct entry and stop prices to frame stop distance.');
  }

  if (params.riskAmount === null) {
    notes.push('Add a risk amount, or combine account size with risk percent.');
  }

  if (
    params.entryPrice !== null &&
    params.targetPrice !== null &&
    params.stopDistance !== null &&
    params.rewardRiskRatio === null
  ) {
    notes.push('Reward/risk is left empty until the target sits on the reward side of the entry.');
  }

  return notes;
}

export function createRiskToolVM(params: CreateRiskToolVMParams): RiskToolVM {
  const accountSize = normalisePositiveNumber(params.input.accountSize);
  const explicitRiskAmount = normalisePositiveNumber(params.input.riskAmount);
  const riskPercent = normalisePositiveNumber(params.input.riskPercent);
  const entryReference = normaliseReference(params.references?.entryReference);
  const stopReference = normaliseReference(params.references?.stopReference);
  const targetReference = normaliseReference(params.references?.targetReference);
  const entryPrice = entryReference.value;
  const stopPrice = stopReference.value;
  const targetPrice = targetReference.value;
  const symbol = normaliseSymbol(params.input.symbol) ?? normaliseSymbol(params.context?.symbol);
  const riskAmount = resolveRiskAmount({
    explicitRiskAmount,
    accountSize,
    riskPercent,
  });
  const resolvedRiskPercent = resolveRiskPercent({
    explicitRiskAmount,
    accountSize,
    riskAmount,
    riskPercent,
  });
  const stopDistance = resolveStopDistance(entryPrice, stopPrice);
  const positionSize =
    riskAmount !== null && stopDistance !== null ? riskAmount / stopDistance : null;
  const rewardRiskRatio = resolveRewardRiskRatio({
    entryPrice,
    stopPrice,
    targetPrice,
    stopDistance,
  });
  const hasReferenceContext =
    hasAvailableReference(entryReference) ||
    hasAvailableReference(stopReference) ||
    hasAvailableReference(targetReference);
  const state = resolveState({
    hasContext:
      params.context?.hasPreparedContext === true ||
      symbol !== null ||
      hasExplicitInput(params.input) ||
      hasReferenceContext,
    stopDistance,
    riskAmount,
    positionSize,
  });

  return {
    generatedAt: resolveGeneratedAt(params),
    inlineHelpAffordances: {
      status: 'UNAVAILABLE',
      reason: 'NO_ELIGIBLE_TERMS',
    },
    summary: {
      state,
      symbol,
      entryPrice,
      stopPrice,
      targetPrice,
      entryReference,
      stopReference,
      targetReference,
      stopDistance,
      riskAmount,
      riskPercent: resolvedRiskPercent,
      positionSize,
      rewardRiskRatio,
      notes: buildNotes({
        state,
        stopDistance,
        riskAmount,
        entryPrice,
        targetPrice,
        rewardRiskRatio,
      }),
    },
  };
}
