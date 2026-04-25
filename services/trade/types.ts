import type { UserProfile } from '@/core/profile/types';

export type ProtectionPlanIntentType = 'ACCUMULATE' | 'REDUCE' | 'HOLD' | 'WAIT';

export type ProtectionPlanRiskCertainty = 'HIGH' | 'MEDIUM' | 'LOW';

export type ProtectionPlanRiskAlignment = 'ALIGNED' | 'NEUTRAL' | 'MISALIGNED';

export type PreparedTradePlanRiskReferences = {
  entryPrice: number | null;
  stopPrice: number | null;
  targetPrice: number | null;
};

export type PreparedTradeReferenceKind = 'STOP' | 'TARGET';

export type PreparedTradeReference = {
  kind: PreparedTradeReferenceKind;
  label: string;
  value: string;
  sourceLabel: string;
  limitations?: ReadonlyArray<string>;
};

export type PreparedTradeReferencesAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_STRATEGY_REFERENCE' | 'THIN_CONTEXT' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      references: ReadonlyArray<PreparedTradeReference>;
    };

export type RiskBasis = 'ACCOUNT_PERCENT' | 'FIXED_CURRENCY' | 'POSITION_PERCENT';

export type GuardrailKey = 'riskLimitPerTrade' | 'dailyLossThreshold' | 'cooldownAfterLoss';

export type PreferredRiskBasis = {
  accountId: string;
  riskBasis: RiskBasis;
};

export type PreferredRiskBasisAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_ACCOUNT_CONTEXT' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      accountId: string;
      preferredBasis: RiskBasis | null;
    };

export type PreferredRiskBasisUpdateResult =
  | {
      status: 'UPDATED';
      accountId: string;
      riskBasis: RiskBasis;
    }
  | {
      status: 'UNCHANGED';
      accountId: string;
      riskBasis: RiskBasis;
    }
  | {
      status: 'REJECTED';
      reason: 'NO_ACCOUNT_CONTEXT' | 'UNSUPPORTED_RISK_BASIS';
    };

export type GuardrailPreferenceSetting = {
  isEnabled: boolean;
  thresholdLabel: string | null;
};

export type GuardrailCooldownSetting = {
  isEnabled: boolean;
  windowLabel: string | null;
};

export type GuardrailPreferences = {
  riskLimitPerTrade: GuardrailPreferenceSetting;
  dailyLossThreshold: GuardrailPreferenceSetting;
  cooldownAfterLoss: GuardrailCooldownSetting;
};

export type GuardrailPreferencesInput = Partial<{
  riskLimitPerTrade: Partial<GuardrailPreferenceSetting> | null;
  dailyLossThreshold: Partial<GuardrailPreferenceSetting> | null;
  cooldownAfterLoss: Partial<GuardrailCooldownSetting> | null;
}>;

export type GuardrailPreferencesAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_ACCOUNT_CONTEXT' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      accountId: string;
      preferences: GuardrailPreferences;
    };

export type GuardrailPreferencesUpdateResult =
  | {
      status: 'UPDATED';
      accountId: string;
      preferences: GuardrailPreferences;
    }
  | {
      status: 'UNCHANGED';
      accountId: string;
      preferences: GuardrailPreferences;
    }
  | {
      status: 'REJECTED';
      reason: 'NO_ACCOUNT_CONTEXT' | 'INVALID_CONFIGURATION';
    };

export type GuardrailEvaluationStatus =
  | 'WITHIN_GUARDRAIL'
  | 'NEAR_GUARDRAIL'
  | 'OUTSIDE_GUARDRAIL'
  | 'NOT_EVALUATED';

export type GuardrailEvaluationItem = {
  guardrailKey: GuardrailKey;
  status: GuardrailEvaluationStatus;
  label: string;
  summary: string;
};

export type GuardrailEvaluation = {
  title: string;
  summary: string;
  items: ReadonlyArray<GuardrailEvaluationItem>;
};

export type GuardrailEvaluationAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_ENABLED_GUARDRAILS' | 'INSUFFICIENT_CONTEXT' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      evaluation: GuardrailEvaluation;
    };

export type RiskBasisOption = {
  basis: RiskBasis;
  label: string;
  isSelected: boolean;
};

export type RiskBasisAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_SUPPORTED_RISK_BASIS' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      selectedBasis: RiskBasis;
      options: ReadonlyArray<RiskBasisOption>;
    };

export type RiskBasisSelectionResult =
  | {
      status: 'UNAVAILABLE';
      availability: Extract<RiskBasisAvailability, { status: 'UNAVAILABLE' }>;
    }
  | {
      status: 'REJECTED';
      requestedBasis: string;
      reason: 'REQUESTED_BASIS_NOT_SUPPORTED';
      availability: Extract<RiskBasisAvailability, { status: 'AVAILABLE' }>;
      selectedBasis: RiskBasis;
    }
  | {
      status: 'APPLIED';
      availability: Extract<RiskBasisAvailability, { status: 'AVAILABLE' }>;
      selectedBasis: RiskBasis;
    };

export type RiskPerTradeContext = {
  status: 'AVAILABLE' | 'UNAVAILABLE';
  basis: RiskBasis;
  headline: string;
  summary: string;
  items: ReadonlyArray<{
    label: string;
    value: string;
  }>;
  reason?: 'MISSING_ACCOUNT_VALUE' | 'MISSING_POSITION_CAP' | 'MISSING_PRICE_REFERENCES';
};

export type PositionSizingOutput = {
  sizeLabel: string;
  sizeValue: string;
  maxLossLabel: string;
  maxLossValue: string;
  notes: ReadonlyArray<string>;
};

export type PositionSizingUnavailableReason =
  | 'INSUFFICIENT_INPUTS'
  | 'UNSUPPORTED_RISK_BASIS'
  | 'NOT_ENABLED_FOR_SURFACE';

export type PositionSizingAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: PositionSizingUnavailableReason;
    }
  | {
      status: 'AVAILABLE';
      output: PositionSizingOutput;
    };

export type RiskInputGuidance = {
  title: string;
  summary: string;
  items: ReadonlyArray<string>;
};

export type RiskInputGuidanceAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_GUIDANCE_NEEDED' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      guidance: RiskInputGuidance;
    };

export type PreparedTradeRiskLane = {
  activeBasis: RiskBasis | null;
  activeBasisLabel: string | null;
  basisAvailability: RiskBasisAvailability;
  context: RiskPerTradeContext | null;
};

export type TradeHubRiskLane = {
  selectedRiskBasis: RiskBasis | null;
  preparedRiskLane: PreparedTradeRiskLane;
  preferredRiskBasisAvailability: PreferredRiskBasisAvailability;
  positionSizingAvailability: PositionSizingAvailability;
  riskInputGuidanceAvailability: RiskInputGuidanceAvailability;
  guardrailPreferencesAvailability: GuardrailPreferencesAvailability;
  guardrailEvaluationAvailability: GuardrailEvaluationAvailability;
};

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
  preparedRiskReferences: PreparedTradePlanRiskReferences | null;
  preparedTradeReferencesAvailability?: PreparedTradeReferencesAvailability;
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
  riskLane: TradeHubRiskLane;
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
  preparedTradeReferences?: PreparedTradeReferencesAvailability;
  risk: PreparedTradeRiskLane;
  positionSizing: PositionSizingAvailability;
  riskInputGuidance?: RiskInputGuidanceAvailability;
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

export type ExecutionCapabilityPath = 'BRACKET' | 'OCO' | 'SEPARATE_ORDERS' | 'UNAVAILABLE';

export type ConfirmationCapabilityPath =
  | 'BRACKET'
  | 'OCO'
  | 'GUIDED_SEQUENCE'
  | 'UNAVAILABLE';

export type ExecutionCapabilityResolution = {
  accountId: string;
  path: ExecutionCapabilityPath;
  confirmationPath: ConfirmationCapabilityPath;
  supported: boolean;
  unavailableReason: string | null;
};

export type TradePlanConfirmationPathType = 'BRACKET' | 'OCO' | 'GUIDED_SEQUENCE' | 'UNAVAILABLE';

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
  acknowledged: boolean;
  required: boolean;
  acknowledgementLabel?: string;
};

export type ConfirmationFlow = {
  planId: string;
  steps: ConfirmationFlowStep[];
  currentStepId: string;
  canProceed: boolean;
  allRequiredAcknowledged: boolean;
  blockedReason?: string;
};

export type ConfirmationFlowActions = {
  acknowledgeStep(flow: ConfirmationFlow, stepId: string): ConfirmationFlow;
  unacknowledgeStep(flow: ConfirmationFlow, stepId: string): ConfirmationFlow;
  resetFlow(flow: ConfirmationFlow): ConfirmationFlow;
};

export type ConfirmationSession = {
  planId: string | null;
  accountId: string | null;
  executionCapability: ExecutionCapabilityResolution | null;
  preparedRiskReferences: PreparedTradePlanRiskReferences | null;
  preparedTradeReferences?: PreparedTradeReferencesAvailability;
  preview: TradePlanPreview | null;
  shell: TradePlanConfirmationShell | null;
  flow: ConfirmationFlow | null;
};

export type ConfirmationSessionActions = {
  acknowledgeStep(stepId: string): ConfirmationSession;
  unacknowledgeStep(stepId: string): ConfirmationSession;
  resetFlow(): ConfirmationSession;
  selectPlan(planId: string | null): Promise<ConfirmationSession>;
};

export type ExecutionPayloadType = ExecutionCapabilityPath;

export type ExecutionAdapterCapability = {
  adapterId: string;
  supportsBracket: boolean;
  supportsOCO: boolean;
  supportsMarketBuy: boolean;
  supportsLimitBuy: boolean;
  supportsStopLoss: boolean;
  supportsTakeProfit: boolean;
};

export type ExecutionPathPreview = {
  planId: string | null;
  adapterId: string;
  confirmationPathType: TradePlanConfirmationPathType;
  payloadType: ExecutionPayloadType;
  label: string;
  supported: boolean;
  executable: false;
};

export type OrderPayloadPreview = {
  payloadType: ExecutionPayloadType;
  symbol: string | null;
  orderCount: number;
  fieldsPresent: string[];
  executable: false;
};

export type ExecutionPreviewVM = {
  planId: string | null;
  capabilityResolution: ExecutionCapabilityResolution | null;
  adapterCapability: ExecutionAdapterCapability | null;
  pathPreview: ExecutionPathPreview | null;
  payloadPreview: OrderPayloadPreview | null;
};

export type ReadinessBlockerCode =
  | 'NOT_ACKNOWLEDGED'
  | 'UNAVAILABLE_PATH'
  | 'CAPABILITY_MISSING'
  | 'NO_PLAN_SELECTED';

export type ReadinessWarningCode = 'LOW_CERTAINTY' | 'CAUTION_STATE' | 'PARTIAL_CAPABILITY';

export type ReadinessBlocker = {
  code: ReadinessBlockerCode;
  message: string;
};

export type ReadinessWarning = {
  code: ReadinessWarningCode;
  message: string;
};

export type ExecutionReadiness = {
  eligible: boolean;
  blockers: ReadinessBlocker[];
  warnings: ReadinessWarning[];
  summary: {
    requiresAcknowledgement: boolean;
    hasUnavailablePath: boolean;
    hasCapabilityMismatch: boolean;
  };
};

export type SubmissionIntentAdapterType = Exclude<ExecutionCapabilityPath, 'UNAVAILABLE'>;

export type SubmissionIntentResult =
  | {
      status: 'BLOCKED';
      blockers: ReadonlyArray<ReadinessBlocker>;
      warnings: ReadonlyArray<ReadinessWarning>;
    }
  | {
      status: 'READY';
      adapterType: SubmissionIntentAdapterType;
      placeholderOnly: true;
      planId: string;
      accountId: string;
      symbol: string | null;
      payloadPreview: ReadonlyArray<OrderPayloadPreview>;
      warnings: ReadonlyArray<ReadinessWarning>;
    };

export type ReadySubmissionIntent = Extract<SubmissionIntentResult, { status: 'READY' }>;

export type SimulatedExecutionOutcome = 'SIMULATED_ACCEPTABLE' | 'SIMULATED_UNAVAILABLE';

export type MockExecutionAdapterResponse = {
  status: 'SIMULATED';
  dispatchEnabled: false;
  placeholderOnly: true;
  adapterType: SubmissionIntentAdapterType;
  outcome: SimulatedExecutionOutcome;
  simulatedOrderIds: ReadonlyArray<string>;
  executionSummary: {
    planId: string;
    accountId: string;
    symbol: string | null;
    orderCount: number;
    path: SubmissionIntentAdapterType;
  };
  warnings: ReadonlyArray<ReadinessWarning>;
};

export type ExecutionAdapterAttemptResult =
  | {
      status: 'BLOCKED';
      blockers: ReadonlyArray<ReadinessBlocker>;
      warnings: ReadonlyArray<ReadinessWarning>;
    }
  | MockExecutionAdapterResponse;
