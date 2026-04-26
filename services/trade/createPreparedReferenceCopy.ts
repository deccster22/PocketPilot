import type {
  PreparedTradeReferenceKind,
  PreparedTradeReferencesAvailability,
} from '@/services/trade/types';

export type PreparedReferenceSource = 'PREPARED_PLAN' | 'STRATEGY_CONTEXT';

export type PreparedReferenceUnavailableReason = Extract<
  PreparedTradeReferencesAvailability,
  { status: 'UNAVAILABLE' }
>['reason'];

const SOURCE_LABEL_BY_SOURCE: Record<PreparedReferenceSource, string> = {
  PREPARED_PLAN: 'Source: prepared plan context',
  STRATEGY_CONTEXT: 'Source: supported strategy context',
};

const COMMON_LIMITATIONS: ReadonlyArray<string> = [
  'Planning context only; this is not an order instruction.',
];

const STRATEGY_CONTEXT_LIMITATIONS: ReadonlyArray<string> = [
  ...COMMON_LIMITATIONS,
  'Derived from supported strategy context and omitted when context is thin.',
];

const UNAVAILABLE_COPY: Record<PreparedReferenceUnavailableReason, string> = {
  NO_STRATEGY_REFERENCE:
    'Unavailable because this context does not publish prepared stop/target references.',
  THIN_CONTEXT: 'Unavailable because prepared stop/target context is thin or ambiguous.',
  NOT_ENABLED_FOR_SURFACE:
    'Unavailable because this surface does not publish prepared stop/target references.',
};

function normaliseSourceLabelKey(sourceLabel: string): string {
  return sourceLabel.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function createPreparedReferenceLabel(kind: PreparedTradeReferenceKind): string {
  return kind === 'STOP' ? 'Prepared stop reference' : 'Prepared target reference';
}

export function createPreparedReferenceSourceLabel(source: PreparedReferenceSource): string {
  return SOURCE_LABEL_BY_SOURCE[source];
}

export function createPreparedReferenceLimitations(
  source: PreparedReferenceSource,
): ReadonlyArray<string> {
  return source === 'STRATEGY_CONTEXT'
    ? [...STRATEGY_CONTEXT_LIMITATIONS]
    : [...COMMON_LIMITATIONS];
}

export function createPreparedReferenceCopy(params: {
  kind: PreparedTradeReferenceKind;
  source: PreparedReferenceSource;
}): {
  label: string;
  sourceLabel: string;
  limitations: ReadonlyArray<string>;
} {
  return {
    label: createPreparedReferenceLabel(params.kind),
    sourceLabel: createPreparedReferenceSourceLabel(params.source),
    limitations: createPreparedReferenceLimitations(params.source),
  };
}

export function resolvePreparedReferenceSourceFromLabel(
  sourceLabel: string,
): PreparedReferenceSource | null {
  const key = normaliseSourceLabelKey(sourceLabel);

  if (key === 'source: prepared plan' || key === 'source: prepared plan context') {
    return 'PREPARED_PLAN';
  }

  if (key === 'source: strategy context' || key === 'source: supported strategy context') {
    return 'STRATEGY_CONTEXT';
  }

  return null;
}

export function createPreparedReferenceUnavailableCopy(
  reason: PreparedReferenceUnavailableReason,
): string {
  return UNAVAILABLE_COPY[reason];
}
