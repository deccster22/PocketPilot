import type { ProtectionPlan, TradeHubActionState } from '@/services/trade/types';

export function resolveTradeHubActionState(plan: ProtectionPlan): TradeHubActionState {
  if (plan.intentType === 'WAIT' || plan.riskProfile.certainty === 'LOW') {
    return 'WAIT';
  }

  if (
    plan.intentType === 'HOLD' ||
    plan.riskProfile.alignment !== 'ALIGNED' ||
    plan.riskProfile.certainty === 'MEDIUM'
  ) {
    return 'CAUTION';
  }

  return 'READY';
}
