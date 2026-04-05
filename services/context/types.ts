import type { AlignmentState } from '@/core/types/marketEvent';

export type StrategyFitState = 'FAVOURABLE' | 'MIXED' | 'UNFAVOURABLE' | 'UNKNOWN';

export type StrategyFitSummary = {
  state: StrategyFitState;
  summary: string;
};

export type PreparedContextStrength = 'THIN' | 'BASELINE' | 'SUPPORTED';

export type PreparedContextDirection = 'UP' | 'DOWN' | 'FLAT';

export type PreparedContextVolatilityState = 'CALM' | 'ELEVATED' | 'EXPANDING';

export type PreparedContextStructurePosture = 'STABLE' | 'MIXED' | 'STRAINED';

export type PreparedContextConditionState = 'ORDERLY' | 'MIXED' | 'STRESSED' | 'UNKNOWN';

export type PreparedContextFitSupport = 'SUPPORTED' | 'NEUTRAL' | 'STRAINED' | 'UNKNOWN';

export type PreparedContextHistoricalGroundingState = 'LIGHT' | 'SUPPORTED' | 'ACTIVE';

export type PreparedContextInputs = {
  alignmentState: AlignmentState | null;
  contextStrength: PreparedContextStrength;
  currentState: PreparedContextDirection | null;
  hasEstimatedContext: boolean;
  volatilityContext: {
    state: PreparedContextVolatilityState;
  } | null;
  structureContext: {
    posture: PreparedContextStructurePosture;
  } | null;
  conditionState: PreparedContextConditionState;
  fitSupport: PreparedContextFitSupport;
  historicalGrounding: {
    state: PreparedContextHistoricalGroundingState;
  } | null;
};

export type ThirtyThousandFootAvailability =
  | {
      status: 'UNAVAILABLE';
      reason:
        | 'NO_MEANINGFUL_CONTEXT'
        | 'NOT_ENABLED_FOR_SURFACE'
        | 'INSUFFICIENT_INTERPRETED_CONTEXT';
    }
  | {
      status: 'AVAILABLE';
      title: string;
      summary: string;
      details: ReadonlyArray<string>;
    };

export type ThirtyThousandFootVM = {
  generatedAt: string | null;
  fit: StrategyFitSummary;
  availability: ThirtyThousandFootAvailability;
};
