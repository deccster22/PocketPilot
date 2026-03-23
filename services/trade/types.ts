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
