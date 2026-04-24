import type { StrategyArchetype } from '@/core/strategy/catalogTypes';
import type { StrategyId } from '@/core/strategy/types';

export type StrategyNavigatorSurface =
  | 'STRATEGY_NAVIGATOR'
  | 'DASHBOARD'
  | 'SNAPSHOT'
  | 'TRADE_HUB'
  | 'KNOWLEDGE_LIBRARY';

export type StrategyPreviewScenarioId =
  | 'DIP_VOLATILITY'
  | 'TREND_CONTINUATION'
  | 'MIXED_REVERSAL'
  | 'RANGE_COMPRESSION';

export type StrategyPreviewScenarioTraits = {
  volatilityState: string | null;
  structureState: string | null;
  conditionState: string | null;
};

export type StrategyPreviewScenario = {
  scenarioId: StrategyPreviewScenarioId;
  title: string;
  summary: string;
  traits?: StrategyPreviewScenarioTraits;
};

export type StrategyPreviewStrategyOption = {
  strategyId: StrategyId;
  title: string;
  summary: string;
  archetype: StrategyArchetype;
};

export type StrategyPreviewFocus = {
  snapshotHeadline: string;
  dashboardFocus: ReadonlyArray<string>;
  eventHighlights: ReadonlyArray<string>;
  alertPosture: string;
};

export type StrategyPreviewExplanation = {
  title: string;
  summary: string;
  bullets: ReadonlyArray<string>;
};

export type StrategyPreviewExplanationAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_EXPLANATION_AVAILABLE' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      content: StrategyPreviewExplanation;
    };

export type StrategyPreviewContrast = {
  title: string;
  summary: string;
  bullets: ReadonlyArray<string>;
};

export type StrategyPreviewContrastAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_CONTRAST_AVAILABLE' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      content: StrategyPreviewContrast;
    };

export type StrategyContrastReason = {
  strategyId: StrategyId;
  label: string;
  lines: ReadonlyArray<string>;
};

export type StrategyFitContrast = {
  bestFitStrategyId: StrategyId;
  bestFitLabel: string;
  whyItFits: ReadonlyArray<string>;
  lessSuitableAlternatives: ReadonlyArray<StrategyContrastReason>;
  ambiguityNote?: string | null;
};

export type StrategyFitContrastAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_COMPARABLE_CONTEXT' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      contrast: StrategyFitContrast;
    };

export type NearbyAlternativeSelection = {
  bestFitStrategyId: StrategyId;
  nearbyAlternativeStrategyIds: ReadonlyArray<StrategyId>;
};

export type NearbyAlternativeAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_COMPARABLE_ALTERNATIVES' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      selection: NearbyAlternativeSelection;
    };

export type StrategyPreviewKnowledgeLink = {
  topicId: string;
  title: string;
  reason: string;
};

export type StrategyPreviewKnowledgeFollowThrough =
  | {
      status: 'UNAVAILABLE';
      reason:
        | 'NO_RELEVANT_KNOWLEDGE'
        | 'NOT_ENABLED_FOR_SURFACE'
        | 'KNOWLEDGE_UNAVAILABLE';
    }
  | {
      status: 'AVAILABLE';
      items: ReadonlyArray<StrategyPreviewKnowledgeLink>;
    };

export type StrategyPreviewAvailability =
  | {
      status: 'UNAVAILABLE';
      reason:
        | 'NO_STRATEGY_SELECTED'
        | 'NO_SCENARIO_AVAILABLE'
        | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      strategyId: StrategyId;
      scenario: StrategyPreviewScenario;
      focus: StrategyPreviewFocus;
    };

export type StrategyNavigatorVM = {
  title: string;
  summary: string;
  generatedAt: string | null;
  selectedStrategyId: StrategyId | null;
  selectedScenarioId: StrategyPreviewScenarioId | null;
  strategyOptions: ReadonlyArray<StrategyPreviewStrategyOption>;
  scenarios: ReadonlyArray<StrategyPreviewScenario>;
  availability: StrategyPreviewAvailability;
  explanation: StrategyPreviewExplanationAvailability;
  contrast: StrategyPreviewContrastAvailability;
  fitContrast: StrategyFitContrastAvailability;
  knowledgeFollowThrough?: StrategyPreviewKnowledgeFollowThrough;
};
