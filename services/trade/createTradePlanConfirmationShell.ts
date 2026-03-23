import { resolveTradeHubActionState } from '@/services/trade/resolveTradeHubActionState';
import type {
  AccountCapabilityContext,
  ProtectionPlan,
  TradePlanConfirmationPathType,
  TradePlanConfirmationShell,
} from '@/services/trade/types';

function resolvePathType(
  capabilities: AccountCapabilityContext,
): TradePlanConfirmationPathType {
  if (
    capabilities.supportsBracketOrders &&
    capabilities.supportsStopLoss &&
    capabilities.supportsTakeProfit
  ) {
    return 'BRACKET';
  }

  if (
    capabilities.supportsOCO &&
    capabilities.supportsStopLoss &&
    capabilities.supportsTakeProfit
  ) {
    return 'OCO';
  }

  if (
    capabilities.requiresSeparateOrders &&
    capabilities.supportsStopLoss &&
    capabilities.supportsTakeProfit
  ) {
    return 'GUIDED_SEQUENCE';
  }

  return 'UNAVAILABLE';
}

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
  capabilities: AccountCapabilityContext;
}): TradePlanConfirmationShell {
  const pathType = resolvePathType(params.capabilities);

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
