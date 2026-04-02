import type { Quote } from '@/core/types/quote';
import type {
  ProviderRequestRole,
  QuoteProviderHealthSummary,
  QuoteResponse,
} from '@/services/providers/types';

import type {
  RuntimeDiagnosticsProviderEntry,
  RuntimeDiagnosticsQuotePolicySummary,
  RuntimeDiagnosticsSymbolEntry,
  RuntimeDiagnosticsVM,
} from '@/services/debug/runtimeDiagnosticsTypes';

type QuoteMeta = QuoteResponse['meta'];

export type CreateRuntimeDiagnosticsVMParams = {
  quoteMeta?: QuoteMeta;
  quotes?: Record<string, Quote>;
  generatedAt?: string | null;
  generatedAtMs?: number | null;
  role?: ProviderRequestRole | 'mixed';
  symbols?: ReadonlyArray<string>;
  providerHealthSummary?: Record<string, QuoteProviderHealthSummary>;
};

function toIsoString(timestampMs: number | null | undefined): string | null {
  if (typeof timestampMs !== 'number' || !Number.isFinite(timestampMs)) {
    return null;
  }

  return new Date(timestampMs).toISOString();
}

function getQuoteTimestampMs(quote: Quote | undefined): number | null {
  if (!quote) {
    return null;
  }

  const timestampMs = quote.timestampMs ?? quote.timestamp;
  return typeof timestampMs === 'number' && Number.isFinite(timestampMs) ? timestampMs : null;
}

function toOrderedUnique(values: ReadonlyArray<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const value of values) {
    if (!value || seen.has(value)) {
      continue;
    }

    seen.add(value);
    ordered.push(value);
  }

  return ordered;
}

function getProviderHealthSummary(
  params: CreateRuntimeDiagnosticsVMParams,
): Record<string, QuoteProviderHealthSummary> {
  return params.quoteMeta?.providerHealthSummary ?? params.providerHealthSummary ?? {};
}

function getFallbackRole(params: CreateRuntimeDiagnosticsVMParams): ProviderRequestRole | 'mixed' {
  return params.quoteMeta?.role ?? params.role ?? 'mixed';
}

function createProviderEntry(params: {
  providerId: string;
  summary?: QuoteProviderHealthSummary;
  fallbackRole: ProviderRequestRole | 'mixed';
}): RuntimeDiagnosticsProviderEntry {
  return {
    providerId: params.providerId,
    role:
      params.summary?.window?.role ?? params.summary?.score?.role ?? params.fallbackRole,
    healthState: params.summary?.score?.state ?? 'UNKNOWN',
    score: params.summary?.score?.score ?? null,
    recentAttempts: params.summary?.window?.recentAttempts ?? null,
    recentSuccesses: params.summary?.window?.recentSuccesses ?? null,
    recentFailures: params.summary?.window?.recentFailures ?? null,
    recentCooldownSkips: params.summary?.window?.recentCooldownSkips ?? null,
    lastAttemptAt: params.summary?.window?.lastAttemptAt ?? null,
    lastSuccessAt: params.summary?.window?.lastSuccessAt ?? null,
    lastFailureAt: params.summary?.window?.lastFailureAt ?? null,
  };
}

function buildProviderEntries(
  params: CreateRuntimeDiagnosticsVMParams,
): RuntimeDiagnosticsProviderEntry[] {
  const providerHealthSummary = getProviderHealthSummary(params);
  const providerIds = toOrderedUnique([
    ...(params.quoteMeta?.providersTried ?? []),
    params.quoteMeta?.providerId,
    ...(params.quoteMeta?.policy.cooldownSkippedProviders ?? []),
    ...Object.keys(providerHealthSummary).sort(),
  ]);
  const fallbackRole = getFallbackRole(params);

  return providerIds.map((providerId) =>
    createProviderEntry({
      providerId,
      summary: providerHealthSummary[providerId],
      fallbackRole,
    }),
  );
}

function buildQuotePolicySummary(
  quoteMeta: QuoteMeta | undefined,
): RuntimeDiagnosticsQuotePolicySummary | null {
  if (!quoteMeta) {
    return null;
  }

  return {
    coalescedRequest: quoteMeta.coalescedRequest,
    providersTried: [...quoteMeta.providersTried],
    cooldownSkippedProviders: [...quoteMeta.policy.cooldownSkippedProviders],
    usedLastGood: quoteMeta.usedLastGood,
    freshness: quoteMeta.freshness,
    certainty: quoteMeta.certainty,
  };
}

function buildSymbolEntries(
  params: CreateRuntimeDiagnosticsVMParams,
): RuntimeDiagnosticsSymbolEntry[] {
  const symbols = toOrderedUnique([
    ...(params.symbols ?? []),
    ...(params.quoteMeta?.requestedSymbols ?? []),
    ...Object.keys(params.quoteMeta?.policyStateBySymbol ?? {}),
    ...Object.keys(params.quotes ?? {}),
    ...Object.keys(params.quoteMeta?.sourceBySymbol ?? {}),
  ]);

  return symbols.map((symbol) => {
    const quote = params.quotes?.[symbol];
    const quoteTimestamp = toIsoString(getQuoteTimestampMs(quote));
    const policyState = params.quoteMeta?.policyStateBySymbol[symbol] ?? null;

    return {
      symbol,
      providerId: quote?.source ?? params.quoteMeta?.sourceBySymbol[symbol] ?? null,
      policyState,
      lastUpdatedAt: quoteTimestamp,
      lastGoodAt: policyState === 'LAST_GOOD' ? quoteTimestamp : null,
    };
  });
}

function resolveRole(
  params: CreateRuntimeDiagnosticsVMParams,
  providers: ReadonlyArray<RuntimeDiagnosticsProviderEntry>,
): ProviderRequestRole | 'mixed' {
  if (params.quoteMeta?.role) {
    return params.quoteMeta.role;
  }

  if (params.role) {
    return params.role;
  }

  const providerRoles = toOrderedUnique(providers.map((provider) => provider.role));

  if (providerRoles.length === 1) {
    return providerRoles[0] as ProviderRequestRole | 'mixed';
  }

  return 'mixed';
}

function buildNotes(params: {
  quoteMeta?: QuoteMeta;
  providers: ReadonlyArray<RuntimeDiagnosticsProviderEntry>;
  quotePolicy: RuntimeDiagnosticsQuotePolicySummary | null;
}): string[] {
  const notes: string[] = [];

  if (
    params.quoteMeta?.policy.staleWhileRevalidate ===
    'NOT_IMPLEMENTED_FOREGROUND_ONLY'
  ) {
    notes.push('Foreground-only runtime: stale-while-revalidate is not implemented.');
  }

  if (
    params.providers.some(
      (provider) =>
        provider.healthState === 'UNKNOWN' && provider.recentAttempts !== null,
    )
  ) {
    notes.push(
      'Provider health uses a thin recent window and can remain UNKNOWN when recent attempt data is too thin.',
    );
  }

  if (!params.quotePolicy) {
    notes.push('Quote policy diagnostics are unavailable for this call path.');
  }

  return notes;
}

function resolveGeneratedAt(params: CreateRuntimeDiagnosticsVMParams): string | null {
  if (params.generatedAt !== undefined) {
    return params.generatedAt;
  }

  if (params.quoteMeta) {
    return toIsoString(params.quoteMeta.timestampMs);
  }

  return toIsoString(params.generatedAtMs);
}

export function createRuntimeDiagnosticsVM(
  params: CreateRuntimeDiagnosticsVMParams,
): RuntimeDiagnosticsVM {
  const providers = buildProviderEntries(params);
  const quotePolicy = buildQuotePolicySummary(params.quoteMeta);

  return {
    generatedAt: resolveGeneratedAt(params),
    role: resolveRole(params, providers),
    providers,
    quotePolicy,
    symbols: buildSymbolEntries(params),
    notes: buildNotes({
      quoteMeta: params.quoteMeta,
      providers,
      quotePolicy,
    }),
  };
}
