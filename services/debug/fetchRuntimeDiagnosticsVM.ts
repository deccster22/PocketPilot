import type {
  ProviderRequestRole,
  QuoteProviderHealthSummary,
  QuoteResponse,
} from '@/services/providers/types';

import {
  createRuntimeDiagnosticsVM,
  type CreateRuntimeDiagnosticsVMParams,
} from '@/services/debug/createRuntimeDiagnosticsVM';
import type { RuntimeDiagnosticsVM } from '@/services/debug/runtimeDiagnosticsTypes';

export type FetchRuntimeDiagnosticsVMParams = {
  quoteResult?: Pick<QuoteResponse, 'quotes' | 'meta'>;
  generatedAt?: string | null;
  generatedAtMs?: number | null;
  role?: ProviderRequestRole | 'mixed';
  symbols?: ReadonlyArray<string>;
  providerHealthSummary?: Record<string, QuoteProviderHealthSummary>;
};

function toCreateParams(
  params: FetchRuntimeDiagnosticsVMParams,
): CreateRuntimeDiagnosticsVMParams {
  return {
    quoteMeta: params.quoteResult?.meta,
    quotes: params.quoteResult?.quotes,
    generatedAt: params.generatedAt,
    generatedAtMs: params.generatedAtMs,
    role: params.role,
    symbols: params.symbols,
    providerHealthSummary: params.providerHealthSummary,
  };
}

export function fetchRuntimeDiagnosticsVM(
  params: FetchRuntimeDiagnosticsVMParams,
): RuntimeDiagnosticsVM {
  return createRuntimeDiagnosticsVM(toCreateParams(params));
}
