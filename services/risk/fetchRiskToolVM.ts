import { createRiskToolVM } from '@/services/risk/createRiskToolVM';
import { selectRiskReferences } from '@/services/risk/selectRiskReferences';
import type { RiskToolInput, RiskToolVM } from '@/services/risk/types';
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

export async function fetchRiskToolVM(params: {
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
  const references = selectRiskReferences({
    input: params.input,
    preparedQuoteContext,
  });

  return createRiskToolVM({
    input: params.input,
    references,
    context: {
      symbol,
      hasPreparedContext:
        (params.confirmationSession !== null && params.confirmationSession.planId !== null) ||
        preparedQuoteContext !== null,
    },
    generatedAt: params.generatedAt,
    generatedAtMs: params.generatedAt === undefined ? params.nowProvider?.() : undefined,
  });
}
