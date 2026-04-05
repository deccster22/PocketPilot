import { createRiskToolVM } from '@/services/risk/createRiskToolVM';
import type { RiskToolInput, RiskToolVM } from '@/services/risk/types';
import type { ConfirmationSession } from '@/services/trade/types';

function resolveRiskToolSymbol(session: ConfirmationSession | null): string | null {
  return session?.preview?.headline.symbol ?? session?.shell?.headline.symbol ?? null;
}

export async function fetchRiskToolVM(params: {
  confirmationSession: ConfirmationSession | null;
  input: RiskToolInput;
  generatedAt?: string | null;
  nowProvider?: () => number;
}): Promise<RiskToolVM> {
  return createRiskToolVM({
    input: params.input,
    context: {
      symbol: resolveRiskToolSymbol(params.confirmationSession),
      hasPreparedContext:
        params.confirmationSession !== null && params.confirmationSession.planId !== null,
    },
    generatedAt: params.generatedAt,
    generatedAtMs: params.generatedAt === undefined ? params.nowProvider?.() : undefined,
  });
}
