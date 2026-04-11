import type {
  PreparedTradeRiskLane,
  ProtectionPlan,
  TradePlanPreview,
} from '@/services/trade/types';
import { createPositionSizingOutput } from '@/services/trade/createPositionSizingOutput';
import { createRiskInputGuidance } from '@/services/trade/createRiskInputGuidance';
import { resolveTradeHubActionState } from '@/services/trade/resolveTradeHubActionState';

export function createTradePlanPreview(
  plan: ProtectionPlan,
  risk: PreparedTradeRiskLane,
  accountContext?: {
    portfolioValue: number | null;
    baseCurrency: string | null;
  } | null,
): TradePlanPreview {
  const positionSizing = createPositionSizingOutput({
    plan,
    risk,
    accountContext: accountContext ?? null,
  });

  return {
    planId: plan.planId,
    headline: {
      intentType: plan.intentType,
      symbol: plan.symbol,
      actionState: resolveTradeHubActionState(plan),
    },
    rationale: {
      summary: plan.rationale.summary,
      primaryEventId: plan.rationale.primaryEventId,
      supportingEventIds: [...plan.rationale.supportingEventIds],
      supportingEventCount: plan.rationale.supportingEventIds.length,
    },
    constraints: {
      requiresConfirmation: true,
      ...(plan.constraints.maxPositionSize !== undefined
        ? { maxPositionSize: plan.constraints.maxPositionSize }
        : {}),
      ...(plan.constraints.cooldownActive !== undefined
        ? { cooldownActive: plan.constraints.cooldownActive }
        : {}),
    },
    readiness: {
      alignment: plan.riskProfile.alignment,
      certainty: plan.riskProfile.certainty,
    },
    placeholders: {
      orderPreviewAvailable: false,
      executionPreviewAvailable: false,
    },
    risk,
    positionSizing,
    riskInputGuidance: createRiskInputGuidance({
      plan,
      risk,
      accountContext: accountContext ?? null,
      positionSizing,
    }),
  };
}
