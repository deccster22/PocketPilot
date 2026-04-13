import type { EventType, MarketEvent } from '@/core/types/marketEvent';
import type {
  MessagePolicySnapshotContext,
  PreparedMessageChangeStrength,
  PreparedMessageConfirmationSupport,
  PreparedMessageEventFamily,
  PreparedMessageInputContext,
  PreparedMessageSubjectScope,
} from '@/services/messages/types';

type ChangeStrengthRule = {
  strongConfidence: number;
  strongAbsPctChange: number;
  meaningfulConfidence: number;
  meaningfulAbsPctChange: number;
  modestConfidence: number;
  modestAbsPctChange: number;
};

function sanitiseSymbol(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readRelatedSymbols(event: MarketEvent): string[] {
  const relatedSymbols = event.metadata.relatedSymbols;

  if (!Array.isArray(relatedSymbols)) {
    return [];
  }

  return relatedSymbols
    .map((value) => (typeof value === 'string' ? sanitiseSymbol(value) : null))
    .filter((value): value is string => value !== null);
}

function createSubjectScope(event: MarketEvent): {
  subjectLabel: string | null;
  subjectScope: PreparedMessageSubjectScope;
  isSingleSymbolScope: boolean;
} {
  const symbols = new Set<string>();
  const primarySymbol = sanitiseSymbol(event.symbol);

  if (primarySymbol) {
    symbols.add(primarySymbol);
  }

  for (const symbol of readRelatedSymbols(event)) {
    symbols.add(symbol);
  }

  if (symbols.size > 1) {
    return {
      subjectLabel: null,
      subjectScope: 'MULTI_SYMBOL',
      isSingleSymbolScope: false,
    };
  }

  if (symbols.size === 1) {
    return {
      subjectLabel: [...symbols][0],
      subjectScope: 'SINGLE_SYMBOL',
      isSingleSymbolScope: true,
    };
  }

  return {
    subjectLabel: null,
    subjectScope: 'PORTFOLIO',
    isSingleSymbolScope: false,
  };
}

function createEventFamily(eventType: EventType): PreparedMessageEventFamily {
  switch (eventType) {
    case 'PRICE_MOVEMENT':
      return 'PRICE_CHANGE';
    case 'MOMENTUM_BUILDING':
      return 'MOMENTUM';
    case 'DIP_DETECTED':
      return 'PULLBACK';
    default:
      return 'NON_ALERTABLE';
  }
}

function hasUsableAlertMetrics(event: MarketEvent): boolean {
  return (
    Number.isFinite(event.confidenceScore) &&
    typeof event.pctChange === 'number' &&
    Number.isFinite(event.pctChange)
  );
}

function createChangeStrengthRule(eventType: EventType): ChangeStrengthRule {
  switch (eventType) {
    case 'MOMENTUM_BUILDING':
      return {
        strongConfidence: 0.92,
        strongAbsPctChange: 0.04,
        meaningfulConfidence: 0.84,
        meaningfulAbsPctChange: 0.03,
        modestConfidence: 0.78,
        modestAbsPctChange: 0.02,
      };
    case 'DIP_DETECTED':
      return {
        strongConfidence: 0.92,
        strongAbsPctChange: 0.05,
        meaningfulConfidence: 0.84,
        meaningfulAbsPctChange: 0.04,
        modestConfidence: 0.78,
        modestAbsPctChange: 0.03,
      };
    default:
      return {
        strongConfidence: 0.9,
        strongAbsPctChange: 0.05,
        meaningfulConfidence: 0.82,
        meaningfulAbsPctChange: 0.03,
        modestConfidence: 0.76,
        modestAbsPctChange: 0.02,
      };
  }
}

function resolveChangeStrength(event: MarketEvent): PreparedMessageChangeStrength {
  if (!hasUsableAlertMetrics(event)) {
    return 'THIN';
  }

  const rule = createChangeStrengthRule(event.eventType);
  const absPctChange = Math.abs(event.pctChange ?? 0);

  if (
    event.confidenceScore >= rule.strongConfidence &&
    absPctChange >= rule.strongAbsPctChange
  ) {
    return 'STRONG';
  }

  if (
    event.confidenceScore >= rule.meaningfulConfidence &&
    absPctChange >= rule.meaningfulAbsPctChange
  ) {
    return 'MEANINGFUL';
  }

  if (event.confidenceScore >= rule.modestConfidence && absPctChange >= rule.modestAbsPctChange) {
    return 'MODEST';
  }

  return 'THIN';
}

function hasSinceLastCheckedContext(snapshot: MessagePolicySnapshotContext): boolean {
  return (
    snapshot.sinceLastChecked?.status === 'AVAILABLE' ||
    snapshot.sinceLastCheckedSummaryCount > 0 ||
    (snapshot.briefing.status === 'VISIBLE' && snapshot.briefing.kind === 'SINCE_LAST_CHECKED')
  );
}

function hasReorientationContext(snapshot: MessagePolicySnapshotContext): boolean {
  return snapshot.reorientation.summary?.status === 'AVAILABLE';
}

function resolveConfirmationSupport(
  snapshot: MessagePolicySnapshotContext,
  event: MarketEvent,
): PreparedMessageConfirmationSupport {
  if (event.certainty !== 'confirmed' || !hasUsableAlertMetrics(event)) {
    return 'ESTIMATED_OR_THIN';
  }

  if (hasSinceLastCheckedContext(snapshot) || hasReorientationContext(snapshot)) {
    return 'CONFIRMED_WITH_HISTORY';
  }

  return 'CONFIRMED_EVENT';
}

export function createPreparedMessageInputs(
  snapshot: MessagePolicySnapshotContext,
): PreparedMessageInputContext | null {
  const latestRelevantEvent = snapshot.latestRelevantEvent;

  if (!latestRelevantEvent) {
    return null;
  }

  const subjectScope = createSubjectScope(latestRelevantEvent);

  return {
    ...subjectScope,
    eventFamily: createEventFamily(latestRelevantEvent.eventType),
    confirmationSupport: resolveConfirmationSupport(snapshot, latestRelevantEvent),
    changeStrength: resolveChangeStrength(latestRelevantEvent),
    hasSinceLastCheckedContext: hasSinceLastCheckedContext(snapshot),
    hasReorientationContext: hasReorientationContext(snapshot),
  };
}
