import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type { AlignmentState, MarketEvent } from '@/core/types/marketEvent';
import type { OrientationContext } from '@/services/orientation/createOrientationContext';

import type {
  PreparedContextConditionState,
  PreparedContextDirection,
  PreparedContextFitSupport,
  PreparedContextHistoricalGroundingState,
  PreparedContextInputs,
  PreparedContextStrength,
  PreparedContextStructurePosture,
  PreparedContextVolatilityState,
} from './types';

const ELEVATED_CHANGE_THRESHOLD = 0.03;
const EXPANDING_CHANGE_THRESHOLD = 0.06;

type ContextMarketEvent = Pick<
  MarketEvent,
  'eventType' | 'alignmentState' | 'certainty' | 'pctChange'
>;

type ContextHistoryEvent = EventLedgerEntry | ContextMarketEvent;

function isMarketEvent(entry: ContextHistoryEvent): entry is EventLedgerEntry & ContextMarketEvent {
  return 'eventType' in entry && 'alignmentState' in entry && 'certainty' in entry;
}

function normaliseAlignmentState(value: string | null | undefined): AlignmentState | null {
  if (!value) {
    return null;
  }

  const normalisedValue = value.trim().toUpperCase().replace(/\s+/g, '_');

  switch (normalisedValue) {
    case 'ALIGNED':
    case 'WATCHFUL':
    case 'NEEDS_REVIEW':
      return normalisedValue;
    default:
      return null;
  }
}

function summariseEventAlignment(events: ReadonlyArray<ContextMarketEvent>): AlignmentState | null {
  if (events.some((event) => event.alignmentState === 'NEEDS_REVIEW')) {
    return 'NEEDS_REVIEW';
  }

  if (events.some((event) => event.alignmentState === 'WATCHFUL')) {
    return 'WATCHFUL';
  }

  if (events.some((event) => event.alignmentState === 'ALIGNED')) {
    return 'ALIGNED';
  }

  return null;
}

function normaliseCurrentState(
  value: PreparedContextDirection | string | null | undefined,
): PreparedContextDirection | null {
  if (!value) {
    return null;
  }

  const normalisedValue = value.trim().toUpperCase();

  switch (normalisedValue) {
    case 'UP':
    case 'DOWN':
    case 'FLAT':
      return normalisedValue;
    default:
      return null;
  }
}

function isMeaningfulEvent(event: ContextMarketEvent): boolean {
  return event.eventType !== 'DATA_QUALITY' && event.eventType !== 'ESTIMATED_PRICE';
}

function hasEstimatedEvents(events: ReadonlyArray<ContextMarketEvent>): boolean {
  return events.some(
    (event) => event.eventType === 'ESTIMATED_PRICE' || event.certainty === 'estimated',
  );
}

function hasDataQualityEvents(events: ReadonlyArray<ContextMarketEvent>): boolean {
  return events.some((event) => event.eventType === 'DATA_QUALITY');
}

function countVolatilityEvents(events: ReadonlyArray<ContextMarketEvent>): number {
  return events.filter(
    (event) =>
      event.eventType === 'PRICE_MOVEMENT' ||
      event.eventType === 'DIP_DETECTED' ||
      event.eventType === 'MOMENTUM_BUILDING',
  ).length;
}

function countPositiveStructureHints(events: ReadonlyArray<ContextMarketEvent>): number {
  return events.filter(
    (event) =>
      event.eventType === 'MOMENTUM_BUILDING' ||
      (event.eventType === 'PRICE_MOVEMENT' &&
        event.pctChange !== null &&
        event.pctChange !== undefined &&
        event.pctChange > 0),
  ).length;
}

function countNegativeStructureHints(events: ReadonlyArray<ContextMarketEvent>): number {
  return events.filter(
    (event) =>
      event.eventType === 'DIP_DETECTED' ||
      (event.eventType === 'PRICE_MOVEMENT' &&
        event.pctChange !== null &&
        event.pctChange !== undefined &&
        event.pctChange < 0),
  ).length;
}

function getStrongestAbsoluteMove(params: {
  change24h?: number | null;
  events: ReadonlyArray<ContextMarketEvent>;
}): number {
  const currentMove =
    params.change24h === null || params.change24h === undefined ? 0 : Math.abs(params.change24h);
  const eventMove = params.events.reduce((largestMove, event) => {
    if (event.pctChange === null || event.pctChange === undefined) {
      return largestMove;
    }

    return Math.max(largestMove, Math.abs(event.pctChange));
  }, 0);

  return Math.max(currentMove, eventMove);
}

function resolveContextStrength(params: {
  alignmentState: AlignmentState | null;
  currentState: PreparedContextDirection | null;
  change24h?: number | null;
  currentEvents: ReadonlyArray<ContextMarketEvent>;
  historyEvents: ReadonlyArray<ContextMarketEvent>;
  hasEstimatedContext: boolean;
  hasDataQualityContext: boolean;
}): PreparedContextStrength {
  const hasBaselineContext =
    params.alignmentState !== null &&
    params.currentState !== null &&
    params.change24h !== null &&
    params.change24h !== undefined;
  const hasMeaningfulCurrentContext = params.currentEvents.some(isMeaningfulEvent);
  const hasMeaningfulHistoryContext = params.historyEvents.some(isMeaningfulEvent);

  if (
    (params.hasEstimatedContext || params.hasDataQualityContext) &&
    !hasMeaningfulCurrentContext &&
    !hasMeaningfulHistoryContext
  ) {
    return 'THIN';
  }

  if (hasMeaningfulCurrentContext || hasMeaningfulHistoryContext) {
    return 'SUPPORTED';
  }

  if (hasBaselineContext) {
    return 'BASELINE';
  }

  return 'THIN';
}

function resolveVolatilityState(params: {
  contextStrength: PreparedContextStrength;
  change24h?: number | null;
  currentEvents: ReadonlyArray<ContextMarketEvent>;
}): PreparedContextVolatilityState | null {
  if (params.contextStrength === 'THIN') {
    return null;
  }

  const strongestAbsoluteMove = getStrongestAbsoluteMove({
    change24h: params.change24h,
    events: params.currentEvents,
  });
  const volatilityEventCount = countVolatilityEvents(params.currentEvents);

  if (strongestAbsoluteMove >= EXPANDING_CHANGE_THRESHOLD || volatilityEventCount >= 2) {
    return 'EXPANDING';
  }

  if (strongestAbsoluteMove >= ELEVATED_CHANGE_THRESHOLD || volatilityEventCount >= 1) {
    return 'ELEVATED';
  }

  return 'CALM';
}

function resolveStructurePosture(params: {
  contextStrength: PreparedContextStrength;
  alignmentState: AlignmentState | null;
  currentState: PreparedContextDirection | null;
  currentEvents: ReadonlyArray<ContextMarketEvent>;
  volatilityState: PreparedContextVolatilityState | null;
}): PreparedContextStructurePosture | null {
  if (params.contextStrength === 'THIN') {
    return null;
  }

  const positiveHints = countPositiveStructureHints(params.currentEvents);
  const negativeHints = countNegativeStructureHints(params.currentEvents);
  const hasConflictingHints = positiveHints > 0 && negativeHints > 0;

  if (
    params.alignmentState === 'NEEDS_REVIEW' ||
    negativeHints >= 2 ||
    (negativeHints > 0 && params.volatilityState === 'EXPANDING')
  ) {
    return 'STRAINED';
  }

  if (
    hasConflictingHints ||
    params.alignmentState === 'WATCHFUL' ||
    params.currentState === 'DOWN' ||
    negativeHints > 0
  ) {
    return 'MIXED';
  }

  if (params.alignmentState === 'ALIGNED' || params.currentState !== null) {
    return 'STABLE';
  }

  return null;
}

function resolveConditionState(params: {
  contextStrength: PreparedContextStrength;
  alignmentState: AlignmentState | null;
  volatilityState: PreparedContextVolatilityState | null;
  structurePosture: PreparedContextStructurePosture | null;
}): PreparedContextConditionState {
  if (params.contextStrength === 'THIN') {
    return 'UNKNOWN';
  }

  if (
    params.structurePosture === 'STRAINED' ||
    (params.volatilityState === 'EXPANDING' && params.structurePosture === 'MIXED')
  ) {
    return 'STRESSED';
  }

  if (
    params.alignmentState === 'WATCHFUL' ||
    params.volatilityState === 'ELEVATED' ||
    params.volatilityState === 'EXPANDING' ||
    params.structurePosture === 'MIXED'
  ) {
    return 'MIXED';
  }

  return 'ORDERLY';
}

function resolveFitSupport(params: {
  contextStrength: PreparedContextStrength;
  alignmentState: AlignmentState | null;
  volatilityState: PreparedContextVolatilityState | null;
  structurePosture: PreparedContextStructurePosture | null;
  conditionState: PreparedContextConditionState;
}): PreparedContextFitSupport {
  if (params.contextStrength === 'THIN' || params.alignmentState === null) {
    return 'UNKNOWN';
  }

  if (
    params.alignmentState === 'NEEDS_REVIEW' ||
    params.conditionState === 'STRESSED' ||
    params.structurePosture === 'STRAINED'
  ) {
    return 'STRAINED';
  }

  if (
    params.alignmentState === 'ALIGNED' &&
    params.structurePosture === 'STABLE' &&
    params.volatilityState === 'CALM'
  ) {
    return 'SUPPORTED';
  }

  return 'NEUTRAL';
}

function resolveHistoricalGrounding(params: {
  orientationContext?: Pick<OrientationContext, 'historyContext'> | null;
  historyEvents: ReadonlyArray<ContextMarketEvent>;
}): { state: PreparedContextHistoricalGroundingState } | null {
  const sinceLastChecked = params.orientationContext?.historyContext?.sinceLastChecked;

  if (!sinceLastChecked) {
    return null;
  }

  const meaningfulHistoryCount = params.historyEvents.filter(isMeaningfulEvent).length;

  if (meaningfulHistoryCount === 0) {
    return {
      state: 'LIGHT',
    };
  }

  if (meaningfulHistoryCount >= 3) {
    return {
      state: 'ACTIVE',
    };
  }

  return {
    state: 'SUPPORTED',
  };
}

function extractHistoryEvents(
  orientationContext?: Pick<OrientationContext, 'historyContext'> | null,
): ContextMarketEvent[] {
  if (!orientationContext?.historyContext.eventsSinceLastViewed) {
    return [];
  }

  return orientationContext.historyContext.eventsSinceLastViewed
    .filter(isMarketEvent)
    .map((event) => ({
      eventType: event.eventType,
      alignmentState: event.alignmentState,
      certainty: event.certainty,
      pctChange: event.pctChange,
    }));
}

export function createPreparedContextInputs(params: {
  strategyAlignment?: string | null;
  change24h?: number | null;
  currentState?: PreparedContextDirection | string | null;
  currentEvents?: ReadonlyArray<ContextMarketEvent>;
  orientationContext?: Pick<OrientationContext, 'historyContext'> | null;
}): PreparedContextInputs {
  const currentEvents = params.currentEvents ?? [];
  const historyEvents = extractHistoryEvents(params.orientationContext);
  const alignmentState =
    normaliseAlignmentState(params.strategyAlignment) ?? summariseEventAlignment(currentEvents);
  const currentState = normaliseCurrentState(params.currentState);
  const hasEstimatedContext =
    hasEstimatedEvents(currentEvents) || hasEstimatedEvents(historyEvents);
  const hasDataQualityContext =
    hasDataQualityEvents(currentEvents) || hasDataQualityEvents(historyEvents);
  const contextStrength = resolveContextStrength({
    alignmentState,
    currentState,
    change24h: params.change24h,
    currentEvents,
    historyEvents,
    hasEstimatedContext,
    hasDataQualityContext,
  });
  const volatilityState = resolveVolatilityState({
    contextStrength,
    change24h: params.change24h,
    currentEvents,
  });
  const structurePosture = resolveStructurePosture({
    contextStrength,
    alignmentState,
    currentState,
    currentEvents,
    volatilityState,
  });
  const conditionState = resolveConditionState({
    contextStrength,
    alignmentState,
    volatilityState,
    structurePosture,
  });
  const fitSupport = resolveFitSupport({
    contextStrength,
    alignmentState,
    volatilityState,
    structurePosture,
    conditionState,
  });
  const historicalGrounding = resolveHistoricalGrounding({
    orientationContext: params.orientationContext,
    historyEvents,
  });

  return {
    alignmentState,
    contextStrength,
    currentState,
    hasEstimatedContext,
    volatilityContext:
      volatilityState === null
        ? null
        : {
            state: volatilityState,
          },
    structureContext:
      structurePosture === null
        ? null
        : {
            posture: structurePosture,
          },
    conditionState,
    fitSupport,
    historicalGrounding,
  };
}
