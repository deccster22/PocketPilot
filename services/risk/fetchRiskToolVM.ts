import type { UserProfile } from '@/core/profile/types';
import { createTradeHubHelpAffordances } from '@/services/knowledge/createTradeHubHelpAffordances';
import { createRiskToolVM } from '@/services/risk/createRiskToolVM';
import { selectRiskReferences } from '@/services/risk/selectRiskReferences';
import type {
  PreparedRiskPlanContext,
  RiskToolInput,
  RiskToolVM,
} from '@/services/risk/types';
import { selectPreparedTradeReferenceValue } from '@/services/trade/createPreparedTradeReferences';
import type { ConfirmationSession } from '@/services/trade/types';
import type { ForegroundScanResult } from '@/services/types/scan';

function normaliseSymbol(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function resolveRiskToolSymbol(params: {
  confirmationSession: ConfirmationSession | null;
  input: RiskToolInput;
}): string | null {
  return (
    normaliseSymbol(params.input.symbol) ??
    normaliseSymbol(params.confirmationSession?.preview?.headline.symbol) ??
    normaliseSymbol(params.confirmationSession?.shell?.headline.symbol)
  );
}

function resolvePreparedQuoteContext(params: {
  preparedQuoteScan?: Pick<ForegroundScanResult, 'quotes'> | null;
  symbol: string | null;
}): { currentPrice: number | null } | null {
  if (!params.preparedQuoteScan || !params.symbol) {
    return null;
  }

  const quote = params.preparedQuoteScan.quotes[params.symbol];

  if (!quote) {
    return null;
  }

  return {
    currentPrice:
      typeof quote.price === 'number' && Number.isFinite(quote.price) ? quote.price : null,
  };
}

function resolvePreparedPlanContext(params: {
  confirmationSession: ConfirmationSession | null;
}): PreparedRiskPlanContext | null {
  const confirmationSession = params.confirmationSession;
  const preparedRiskReferences = confirmationSession?.preparedRiskReferences;
  const preparedTradeReferences = confirmationSession?.preparedTradeReferences;
  const stopFromPreparedTradeReferences = selectPreparedTradeReferenceValue({
    availability: preparedTradeReferences,
    kind: 'STOP',
  });
  const targetFromPreparedTradeReferences = selectPreparedTradeReferenceValue({
    availability: preparedTradeReferences,
    kind: 'TARGET',
  });

  if (!preparedRiskReferences) {
    if (stopFromPreparedTradeReferences === null && targetFromPreparedTradeReferences === null) {
      return null;
    }

    return {
      entryPrice: null,
      stopPrice: stopFromPreparedTradeReferences,
      targetPrice: targetFromPreparedTradeReferences,
    };
  }

  return {
    entryPrice: preparedRiskReferences.entryPrice,
    stopPrice: stopFromPreparedTradeReferences ?? preparedRiskReferences.stopPrice,
    targetPrice: targetFromPreparedTradeReferences ?? preparedRiskReferences.targetPrice,
  };
}

export async function fetchRiskToolVM(params: {
  profile: UserProfile;
  confirmationSession: ConfirmationSession | null;
  preparedQuoteScan?: Pick<ForegroundScanResult, 'quotes'> | null;
  input: RiskToolInput;
  generatedAt?: string | null;
  nowProvider?: () => number;
}): Promise<RiskToolVM> {
  const symbol = resolveRiskToolSymbol({
    confirmationSession: params.confirmationSession,
    input: params.input,
  });
  const preparedQuoteContext = resolvePreparedQuoteContext({
    preparedQuoteScan: params.preparedQuoteScan,
    symbol,
  });
  const preparedPlanContext = resolvePreparedPlanContext({
    confirmationSession: params.confirmationSession,
  });
  const references = selectRiskReferences({
    input: params.input,
    preparedQuoteContext,
    preparedPlanContext,
  });

  const riskToolVM = createRiskToolVM({
    input: params.input,
    references,
    context: {
      symbol,
      hasPreparedContext:
        preparedPlanContext !== null ||
        (params.confirmationSession !== null && params.confirmationSession.planId !== null) ||
        preparedQuoteContext !== null,
    },
    generatedAt: params.generatedAt,
    generatedAtMs: params.generatedAt === undefined ? params.nowProvider?.() : undefined,
  });

  return {
    ...riskToolVM,
    inlineHelpAffordances: createTradeHubHelpAffordances({
      profile: params.profile,
      surface: 'RISK_TOOL',
      activeRiskBasis: params.confirmationSession?.preview?.risk.activeBasis ?? null,
      includeStopLossPrice: true,
      includeTargetPrice: true,
      includeActiveRiskBasis: true,
    }),
  };
}
