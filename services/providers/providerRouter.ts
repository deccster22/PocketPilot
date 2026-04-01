import type { Quote } from '@/core/types/quote';
import type { QuoteBroker } from '@/providers/quoteBroker';
import type {
  QuoteRequest,
  QuoteResponse,
  QuoteResponseMetadata,
  QuoteSymbolPolicyState,
  ProviderRequestRole,
} from '@/services/providers/types';

export type QuoteProvider = {
  id: string;
  role: ProviderRequestRole;
  getQuotes: (request: QuoteRequest) => Promise<QuoteResponse>;
};

export type ProviderRouterResult = QuoteResponse;

export type GetQuotesForSymbolsParams = QuoteRequest;

export type QuoteProviderChain = {
  primary: QuoteProvider;
  fallback?: QuoteProvider;
};

function toOrderedSymbols(symbols: string[]): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const symbol of symbols) {
    if (seen.has(symbol)) {
      continue;
    }

    seen.add(symbol);
    ordered.push(symbol);
  }

  return ordered;
}

function getQuoteTimestampMs(quote: Quote): number | null {
  const timestampMs = quote.timestampMs ?? quote.timestamp;
  return typeof timestampMs === 'number' && Number.isFinite(timestampMs) ? timestampMs : null;
}

function toIsoString(timestampMs: number | null): string | null {
  return timestampMs === null ? null : new Date(timestampMs).toISOString();
}

function getFreshnessFromPolicyState(
  policyStateBySymbol: Record<string, QuoteSymbolPolicyState>,
  returnedSymbolCount: number,
): QuoteResponseMetadata['freshness'] {
  if (returnedSymbolCount === 0) {
    return 'UNAVAILABLE';
  }

  const states = Object.values(policyStateBySymbol);

  if (states.includes('LAST_GOOD')) {
    return 'LAST_GOOD';
  }

  if (states.includes('STALE')) {
    return 'STALE';
  }

  return 'FRESH';
}

function combinePolicyStateBySymbol(params: {
  request: QuoteRequest;
  primaryMeta: QuoteResponseMetadata;
  fallbackMeta?: QuoteResponseMetadata;
  quotes: Record<string, Quote>;
}): Record<string, QuoteSymbolPolicyState> {
  return params.request.symbols.reduce<Record<string, QuoteSymbolPolicyState>>((acc, symbol) => {
    acc[symbol] =
      params.fallbackMeta?.policyStateBySymbol[symbol] ??
      params.primaryMeta.policyStateBySymbol[symbol] ??
      (params.quotes[symbol] ? 'FRESH' : 'UNAVAILABLE');
    return acc;
  }, {});
}

function combineProviderHealthSummary(
  primaryMeta: QuoteResponseMetadata,
  fallbackMeta?: QuoteResponseMetadata,
): QuoteResponseMetadata['providerHealthSummary'] {
  const summaries = [
    ...Object.values(primaryMeta.providerHealthSummary),
    ...Object.values(fallbackMeta?.providerHealthSummary ?? {}),
  ];

  return summaries.reduce<QuoteResponseMetadata['providerHealthSummary']>((acc, summary) => {
    const existing = acc[summary.providerId];

    if (!existing) {
      acc[summary.providerId] = summary;
      return acc;
    }

    acc[summary.providerId] = {
      providerId: summary.providerId,
      requests: Math.max(existing.requests, summary.requests),
      symbolsRequested: Math.max(existing.symbolsRequested, summary.symbolsRequested),
      symbolsFetched: Math.max(existing.symbolsFetched, summary.symbolsFetched),
      symbolsBlocked: Math.max(existing.symbolsBlocked, summary.symbolsBlocked),
      cooldown:
        existing.cooldown === 'ACTIVE_SKIP' || summary.cooldown === 'ACTIVE_SKIP'
          ? 'ACTIVE_SKIP'
          : 'INACTIVE',
    };
    return acc;
  }, {});
}

function combineMeta(
  params: {
    request: QuoteRequest;
    primaryMeta: QuoteResponseMetadata;
    fallbackMeta?: QuoteResponseMetadata;
    quotes: Record<string, Quote>;
    fallbackUsed: boolean;
  },
): QuoteResponseMetadata {
  const requestedSymbols = params.request.symbols;
  const returnedSymbols = requestedSymbols.filter((symbol) => Boolean(params.quotes[symbol]));
  const missingSymbols = requestedSymbols.filter((symbol) => !params.quotes[symbol]);
  const policyStateBySymbol = combinePolicyStateBySymbol(params);
  const sourceBySymbol = returnedSymbols.reduce<Record<string, string | undefined>>((acc, symbol) => {
    acc[symbol] = params.quotes[symbol]?.source;
    return acc;
  }, {});
  const quoteTimestamps = returnedSymbols
    .map((symbol) => params.quotes[symbol])
    .map((quote) => (quote ? getQuoteTimestampMs(quote) : null))
    .filter((timestampMs): timestampMs is number => timestampMs !== null);
  const conservativeLastUpdatedMs =
    quoteTimestamps.length > 0 ? Math.min(...quoteTimestamps) : null;
  const lastGoodCandidates = [params.primaryMeta.lastGoodAt, params.fallbackMeta?.lastGoodAt]
    .filter((timestamp): timestamp is string => typeof timestamp === 'string')
    .map((timestamp) => Date.parse(timestamp))
    .filter((timestampMs) => Number.isFinite(timestampMs));

  return {
    role: params.request.context.role,
    providerId: params.fallbackUsed ? null : params.primaryMeta.providerId,
    freshness: getFreshnessFromPolicyState(policyStateBySymbol, returnedSymbols.length),
    certainty:
      returnedSymbols.length === 0
        ? 'UNAVAILABLE'
        : returnedSymbols.some((symbol) => params.quotes[symbol]?.estimated)
          ? 'ESTIMATED'
          : 'CONFIRMED',
    lastUpdatedAt: toIsoString(conservativeLastUpdatedMs),
    lastGoodAt: lastGoodCandidates.length > 0 ? toIsoString(Math.min(...lastGoodCandidates)) : null,
    usedLastGood: params.primaryMeta.usedLastGood || Boolean(params.fallbackMeta?.usedLastGood),
    requestedSymbols,
    returnedSymbols,
    missingSymbols,
    timestampMs: params.request.nowMs,
    providersTried: Array.from(
      new Set([
        ...params.primaryMeta.providersTried,
        ...(params.fallbackMeta?.providersTried ?? []),
      ]),
    ),
    sourceBySymbol,
    fallbackUsed: params.fallbackUsed,
    coalescedRequest:
      params.primaryMeta.coalescedRequest || Boolean(params.fallbackMeta?.coalescedRequest),
    policyStateBySymbol,
    providerHealthSummary: combineProviderHealthSummary(params.primaryMeta, params.fallbackMeta),
    policy: {
      staleIfError:
        params.primaryMeta.policy.staleIfError === 'USED_LAST_GOOD' ||
        params.fallbackMeta?.policy.staleIfError === 'USED_LAST_GOOD'
          ? 'USED_LAST_GOOD'
          : params.primaryMeta.policy.staleIfError === 'FAILED_WITHOUT_LAST_GOOD' ||
              params.fallbackMeta?.policy.staleIfError === 'FAILED_WITHOUT_LAST_GOOD'
            ? 'FAILED_WITHOUT_LAST_GOOD'
            : 'NOT_NEEDED',
      staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY',
      cooldown:
        params.primaryMeta.policy.cooldown === 'ACTIVE_SKIP' ||
        params.fallbackMeta?.policy.cooldown === 'ACTIVE_SKIP'
          ? 'ACTIVE_SKIP'
          : 'INACTIVE',
      cooldownSkippedProviders: Array.from(
        new Set([
          ...params.primaryMeta.policy.cooldownSkippedProviders,
          ...(params.fallbackMeta?.policy.cooldownSkippedProviders ?? []),
        ]),
      ),
    },
  };
}

function assertProviderRole(provider: QuoteProvider, requestedRole: ProviderRequestRole): void {
  if (provider.role !== requestedRole) {
    throw new Error(
      `Provider ${provider.id} is tagged ${provider.role} but request role is ${requestedRole}.`,
    );
  }
}

export function createQuoteBrokerProvider(
  broker: QuoteBroker,
  role: ProviderRequestRole,
): QuoteProvider {
  return {
    id: broker.providerId,
    role,
    getQuotes: (request: QuoteRequest) => broker.getQuotes(request),
  };
}

export async function getQuotesForSymbols(
  providers: Partial<Record<ProviderRequestRole, QuoteProviderChain>>,
  params: GetQuotesForSymbolsParams,
): Promise<ProviderRouterResult> {
  const requestedSymbols = toOrderedSymbols(params.symbols);
  const chain = providers[params.context.role];

  if (!chain) {
    throw new Error(`No provider chain configured for role ${params.context.role}.`);
  }

  assertProviderRole(chain.primary, params.context.role);
  if (chain.fallback) {
    assertProviderRole(chain.fallback, params.context.role);
  }

  const normalizedParams: QuoteRequest = {
    ...params,
    symbols: requestedSymbols,
    context: {
      ...params.context,
      accountId: params.accountId,
      symbols: requestedSymbols,
      quoteCurrency: params.context.quoteCurrency ?? null,
    },
  };

  const primaryResult = await chain.primary.getQuotes(normalizedParams);
  const quotes: Record<string, Quote> = {
    ...primaryResult.quotes,
  };
  const missingAfterPrimary = requestedSymbols.filter((symbol) => !quotes[symbol]);

  let fallbackResult: QuoteResponse | undefined;
  let fallbackUsed = false;

  if (chain.fallback && missingAfterPrimary.length > 0) {
    fallbackUsed = true;
    fallbackResult = await chain.fallback.getQuotes({
      ...normalizedParams,
      symbols: missingAfterPrimary,
      cachedQuotes: normalizedParams.cachedQuotes,
      context: {
        ...normalizedParams.context,
        symbols: missingAfterPrimary,
      },
    });

    for (const symbol of missingAfterPrimary) {
      const quote = fallbackResult.quotes[symbol];
      if (quote) {
        quotes[symbol] = quote;
      }
    }
  }

  return {
    quotes,
    meta: combineMeta({
      request: normalizedParams,
      primaryMeta: primaryResult.meta,
      fallbackMeta: fallbackResult?.meta,
      quotes,
      fallbackUsed,
    }),
  };
}
