import { resolveTradeHubActionState } from '@/services/trade/resolveTradeHubActionState';
import type {
  ExecutionCapabilityResolution,
  ProtectionPlan,
  TradePlanConfirmationPathType,
  TradePlanConfirmationShell,
} from '@/services/trade/types';

function resolveStepsLabel(pathType: TradePlanConfirmationPathType): string {
  switch (pathType) {
    case 'BRACKET':
      return 'Single confirmation flow';
    case 'OCO':
      return 'Link exits after entry';
    case 'GUIDED_SEQUENCE':
      return 'Review separate order steps';
    default:
      return 'Execution path unavailable';
  }
}

export function createTradePlanConfirmationShell(params: {
  plan: ProtectionPlan;
  capabilityResolution: ExecutionCapabilityResolution;
}): TradePlanConfirmationShell {
  const pathType = params.capabilityResolution.confirmationPath;

  return {
    planId: params.plan.planId,
    headline: {
      intentType: params.plan.intentType,
      symbol: params.plan.symbol,
      actionState: resolveTradeHubActionState(params.plan),
    },
    readiness: {
      alignment: params.plan.riskProfile.alignment,
      certainty: params.plan.riskProfile.certainty,
    },
    confirmation: {
      requiresConfirmation: true,
      pathType,
      stepsLabel: resolveStepsLabel(pathType),
      executionAvailable: false,
    },
    constraints: {
      ...(params.plan.constraints.cooldownActive !== undefined
        ? { cooldownActive: params.plan.constraints.cooldownActive }
        : {}),
      ...(params.plan.constraints.maxPositionSize !== undefined
        ? { maxPositionSize: params.plan.constraints.maxPositionSize }
        : {}),
    },
    placeholders: {
      orderPayloadAvailable: false,
      executionPreviewAvailable: false,
    },
  };
}
