import type { UserProfile } from '@/core/profile/types';

export type ProtectionPlanIntentType = 'ACCUMULATE' | 'REDUCE' | 'HOLD' | 'WAIT';

export type ProtectionPlanRiskCertainty = 'HIGH' | 'MEDIUM' | 'LOW';

export type ProtectionPlanRiskAlignment = 'ALIGNED' | 'NEUTRAL' | 'MISALIGNED';

export type ProtectionPlan = {
  planId: string;
  accountId: string;
  strategyId: string;
  symbol: string | null;
  intentType: ProtectionPlanIntentType;
  rationale: {
    primaryEventId: string | null;
    supportingEventIds: string[];
    summary: string;
  };
  riskProfile: {
    certainty: ProtectionPlanRiskCertainty;
    alignment: ProtectionPlanRiskAlignment;
  };
  constraints: {
    maxPositionSize?: number;
    cooldownActive?: boolean;
  };
  createdAt: number;
};

export type TradeHubActionState = 'READY' | 'CAUTION' | 'WAIT';

export type TradeHubPlanCard = {
  planId: string;
  intentType: ProtectionPlanIntentType;
  symbol: string | null;
  alignment: ProtectionPlanRiskAlignment;
  certainty: ProtectionPlanRiskCertainty;
  summary: string;
  supportingEventCount: number;
  actionState: TradeHubActionState;
};

export type TradeHubSurfaceModel = {
  primaryPlan: TradeHubPlanCard | null;
  alternativePlans: TradeHubPlanCard[];
  meta: {
    hasPrimaryPlan: boolean;
    profile: UserProfile;
    requiresConfirmation: boolean;
  };
};

export type TradePlanPreview = {
  planId: string;
  headline: {
    intentType: ProtectionPlanIntentType;
    symbol: string | null;
    actionState: TradeHubActionState;
  };
  rationale: {
    summary: string;
    primaryEventId: string | null;
    supportingEventIds: string[];
    supportingEventCount: number;
  };
  constraints: {
    requiresConfirmation: true;
    maxPositionSize?: number;
    cooldownActive?: boolean;
  };
  readiness: {
    alignment: ProtectionPlanRiskAlignment;
    certainty: ProtectionPlanRiskCertainty;
  };
  placeholders: {
    orderPreviewAvailable: boolean;
    executionPreviewAvailable: boolean;
  };
};

export type AccountCapabilityContext = {
  accountId: string;
  brokerId?: string;
  supportsBracketOrders: boolean;
  supportsOCO: boolean;
  requiresSeparateOrders: boolean;
  supportsStopLoss: boolean;
  supportsTakeProfit: boolean;
};

export type TradePlanConfirmationPathType =
  | 'BRACKET'
  | 'OCO'
  | 'GUIDED_SEQUENCE'
  | 'UNAVAILABLE';

export type TradePlanConfirmationShell = {
  planId: string;
  headline: {
    intentType: ProtectionPlanIntentType;
    symbol: string | null;
    actionState: TradeHubActionState;
  };
  readiness: {
    alignment: ProtectionPlanRiskAlignment;
    certainty: ProtectionPlanRiskCertainty;
  };
  confirmation: {
    requiresConfirmation: true;
    pathType: TradePlanConfirmationPathType;
    stepsLabel: string;
    executionAvailable: boolean;
  };
  constraints: {
    cooldownActive?: boolean;
    maxPositionSize?: number;
  };
  placeholders: {
    orderPayloadAvailable: boolean;
    executionPreviewAvailable: boolean;
  };
};

export type ConfirmationFlowStepType =
  | 'REVIEW'
  | 'CONSTRAINT_CHECK'
  | 'CONFIRM_INTENT'
  | 'UNAVAILABLE';

export type ConfirmationFlowStep = {
  stepId: string;
  type: ConfirmationFlowStepType;
  label: string;
  completed: boolean;
  required: boolean;
};

export type ConfirmationFlow = {
  planId: string;
  steps: ConfirmationFlowStep[];
  currentStepId: string;
  canProceed: boolean;
  blockedReason?: string;
};
