import type { MarketEvent } from '@/core/types/marketEvent';
import {
  createPreparedReferenceCopy,
  createPreparedReferenceLabel,
  createPreparedReferenceUnavailableCopy,
  resolvePreparedReferenceSourceFromLabel,
  type PreparedReferenceSource,
} from '@/services/trade/createPreparedReferenceCopy';
import { resolveStrategyPreparedField } from '@/services/trade/createStrategyPreparedRiskReferences';
import type {
  PreparedTradeReference,
  PreparedTradeReferenceKind,
  PreparedTradeReferencesAvailability,
  ProtectionPlanIntentType,
} from '@/services/trade/types';

const ACTIONABLE_INTENT_TYPES = new Set<ProtectionPlanIntentType>(['ACCUMULATE', 'REDUCE']);
const KIND_ORDER: Record<PreparedTradeReferenceKind, number> = {
  STOP: 0,
  TARGET: 1,
};

type PreparedFieldResolution = {
  hasExplicitValue: boolean;
  value: number | null;
};

type StopTargetField = 'stopPrice' | 'targetPrice';
type PreparedTradeReferencesUnavailable = Extract<
  PreparedTradeReferencesAvailability,
  { status: 'UNAVAILABLE' }
>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalisePositiveNumber(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

function normaliseText(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function normaliseReferenceKind(value: unknown): PreparedTradeReferenceKind | null {
  if (value === 'STOP' || value === 'TARGET') {
    return value;
  }

  return null;
}

function normaliseUnavailableReason(value: unknown): PreparedTradeReferencesUnavailable['reason'] {
  if (
    value === 'NO_STRATEGY_REFERENCE' ||
    value === 'THIN_CONTEXT' ||
    value === 'NOT_ENABLED_FOR_SURFACE'
  ) {
    return value;
  }

  return 'NO_STRATEGY_REFERENCE';
}

function createUnavailable(
  reason: PreparedTradeReferencesUnavailable['reason'],
): PreparedTradeReferencesAvailability {
  return {
    status: 'UNAVAILABLE',
    reason,
  };
}

function getExplicitPreparedValue(event: MarketEvent, field: StopTargetField): number | null {
  const preparedRiskReferences = event.metadata.preparedRiskReferences;

  if (!isRecord(preparedRiskReferences)) {
    return null;
  }

  return normalisePositiveNumber(preparedRiskReferences[field]);
}

function resolvePreparedField(
  events: ReadonlyArray<MarketEvent>,
  field: StopTargetField,
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

function createPreparedTradeReference(params: {
  kind: PreparedTradeReferenceKind;
  value: number;
  source: PreparedReferenceSource;
}): PreparedTradeReference {
  const copy = createPreparedReferenceCopy({
    kind: params.kind,
    source: params.source,
  });

  return {
    kind: params.kind,
    label: copy.label,
    value: params.value.toString(),
    sourceLabel: copy.sourceLabel,
    limitations: [...copy.limitations],
  };
}

function normaliseReferenceLimitations(value: unknown): ReadonlyArray<string> | undefined {
  if (!Array.isArray(value) || value.length === 0) {
    return undefined;
  }

  const limitations = value
    .map((item) => normaliseText(item))
    .filter((item): item is string => item !== null);

  if (limitations.length === 0) {
    return undefined;
  }

  return limitations;
}

function normalisePreparedTradeReference(reference: unknown): PreparedTradeReference | null {
  if (!isRecord(reference)) {
    return null;
  }

  const kind = normaliseReferenceKind(reference.kind);
  const label = normaliseText(reference.label);
  const value = normalisePositiveNumber(Number(reference.value));
  const sourceLabel = normaliseText(reference.sourceLabel);

  if (kind === null || label === null || value === null || sourceLabel === null) {
    return null;
  }

  const source = resolvePreparedReferenceSourceFromLabel(sourceLabel);
  const limitations = normaliseReferenceLimitations(reference.limitations);
  const canonicalCopy =
    source === null
      ? null
      : createPreparedReferenceCopy({
          kind,
          source,
        });
  const outputLimitations = canonicalCopy?.limitations ?? limitations;

  return {
    kind,
    label: canonicalCopy?.label ?? createPreparedReferenceLabel(kind),
    value: value.toString(),
    sourceLabel: canonicalCopy?.sourceLabel ?? sourceLabel,
    ...(outputLimitations && outputLimitations.length > 0
      ? { limitations: [...outputLimitations] }
      : {}),
  };
}

function normaliseAvailableReferences(
  references: ReadonlyArray<PreparedTradeReference>,
): ReadonlyArray<PreparedTradeReference> {
  const byKind = new Map<PreparedTradeReferenceKind, PreparedTradeReference>();

  references.forEach((reference) => {
    if (!byKind.has(reference.kind)) {
      byKind.set(reference.kind, reference);
    }
  });

  return [...byKind.values()].sort(
    (left, right) => KIND_ORDER[left.kind] - KIND_ORDER[right.kind],
  );
}

function resolveReference(
  kind: PreparedTradeReferenceKind,
  explicit: PreparedFieldResolution,
  strategy:
    | {
        hasStrategyContext: boolean;
        value: number | null;
      }
    | null,
): PreparedTradeReference | null {
  if (explicit.value !== null) {
    return createPreparedTradeReference({
      kind,
      value: explicit.value,
      source: 'PREPARED_PLAN',
    });
  }

  if (strategy?.hasStrategyContext && strategy.value !== null) {
    return createPreparedTradeReference({
      kind,
      value: strategy.value,
      source: 'STRATEGY_CONTEXT',
    });
  }

  return null;
}

export function createUnavailablePreparedTradeReferences(
  reason: PreparedTradeReferencesUnavailable['reason'],
): PreparedTradeReferencesAvailability {
  return createUnavailable(reason);
}

export function describePreparedTradeReferencesUnavailableReason(
  reason: PreparedTradeReferencesUnavailable['reason'],
): string {
  return createPreparedReferenceUnavailableCopy(reason);
}

export function normalisePreparedTradeReferencesAvailability(
  availability: PreparedTradeReferencesAvailability | null | undefined,
): PreparedTradeReferencesAvailability {
  if (!availability || availability.status !== 'AVAILABLE') {
    return createUnavailable(
      availability ? normaliseUnavailableReason(availability.reason) : 'NO_STRATEGY_REFERENCE',
    );
  }

  const references = availability.references
    .map((reference) => normalisePreparedTradeReference(reference))
    .filter((reference): reference is PreparedTradeReference => reference !== null);
  const normalisedReferences = normaliseAvailableReferences(references);

  if (normalisedReferences.length === 0) {
    return createUnavailable('THIN_CONTEXT');
  }

  return {
    status: 'AVAILABLE',
    references: normalisedReferences,
  };
}

export function selectPreparedTradeReferenceValue(params: {
  availability: PreparedTradeReferencesAvailability | null | undefined;
  kind: PreparedTradeReferenceKind;
}): number | null {
  const normalisedAvailability = normalisePreparedTradeReferencesAvailability(params.availability);

  if (normalisedAvailability.status !== 'AVAILABLE') {
    return null;
  }

  const reference = normalisedAvailability.references.find(
    (candidate) => candidate.kind === params.kind,
  );

  if (!reference) {
    return null;
  }

  return normalisePositiveNumber(Number(reference.value));
}

export function createPreparedTradeReferences(params: {
  intentType: ProtectionPlanIntentType;
  events: ReadonlyArray<MarketEvent>;
  isEnabledForSurface?: boolean;
}): PreparedTradeReferencesAvailability {
  if (params.isEnabledForSurface === false || !ACTIONABLE_INTENT_TYPES.has(params.intentType)) {
    return createUnavailable('NOT_ENABLED_FOR_SURFACE');
  }

  const explicitStop = resolvePreparedField(params.events, 'stopPrice');
  const explicitTarget = resolvePreparedField(params.events, 'targetPrice');
  const strategyStop = explicitStop.hasExplicitValue
    ? null
    : resolveStrategyPreparedField(params.events, 'stopPrice');
  const strategyTarget = explicitTarget.hasExplicitValue
    ? null
    : resolveStrategyPreparedField(params.events, 'targetPrice');

  const references = normaliseAvailableReferences(
    [
      resolveReference('STOP', explicitStop, strategyStop),
      resolveReference('TARGET', explicitTarget, strategyTarget),
    ].filter((reference): reference is PreparedTradeReference => reference !== null),
  );

  if (references.length > 0) {
    return {
      status: 'AVAILABLE',
      references,
    };
  }

  const hasAnyContext =
    explicitStop.hasExplicitValue ||
    explicitTarget.hasExplicitValue ||
    strategyStop?.hasStrategyContext === true ||
    strategyTarget?.hasStrategyContext === true;

  return createUnavailable(hasAnyContext ? 'THIN_CONTEXT' : 'NO_STRATEGY_REFERENCE');
}
