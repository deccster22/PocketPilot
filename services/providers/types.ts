import type { Quote } from '@/core/types/quote';

export type ProviderRequestRole =
  | 'execution'
  | 'reference'
  | 'macro'
  | 'enrichment';

export type FreshnessState =
  | 'FRESH'
  | 'STALE'
  | 'LAST_GOOD'
  | 'UNAVAILABLE';

export type CertaintyState =
  | 'CONFIRMED'
  | 'ESTIMATED'
  | 'UNAVAILABLE';

export type ProviderBudgetClass =
  | 'CALM'
  | 'WATCHING_NOW'
  | 'MACRO'
  | 'ENRICHMENT';

export type ProviderRequestContext = {
  role: ProviderRequestRole;
  accountId?: string | null;
  symbols?: ReadonlyArray<string>;
  quoteCurrency?: string | null;
  budgetClass?: ProviderBudgetClass;
};

export type QuoteRuntimeMetadata = {
  role: ProviderRequestRole;
  providerId: string | null;
  freshness: FreshnessState;
  certainty: CertaintyState;
  lastUpdatedAt: string | null;
  lastGoodAt: string | null;
  usedLastGood: boolean;
};

export type QuoteRuntimePolicyState = {
  staleIfError: 'NOT_NEEDED' | 'USED_LAST_GOOD' | 'FAILED_WITHOUT_LAST_GOOD';
  staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY';
  cooldown: 'INACTIVE' | 'ACTIVE_SKIP';
  cooldownSkippedProviders: string[];
};

export type QuoteSymbolPolicyState =
  | 'FRESH'
  | 'STALE'
  | 'LAST_GOOD'
  | 'UNAVAILABLE';

export type QuoteProviderHealthSummary = {
  providerId: string;
  requests: number;
  symbolsRequested: number;
  symbolsFetched: number;
  symbolsBlocked: number;
  cooldown: QuoteRuntimePolicyState['cooldown'];
};

export type QuoteRequest = {
  accountId: string;
  symbols: string[];
  nowMs: number;
  cachedQuotes?: Record<string, Quote>;
  context: ProviderRequestContext;
};

export type QuoteResponseMetadata = QuoteRuntimeMetadata & {
  requestedSymbols: string[];
  returnedSymbols: string[];
  missingSymbols: string[];
  timestampMs: number;
  providersTried: string[];
  sourceBySymbol: Record<string, string | undefined>;
  fallbackUsed: boolean;
  coalescedRequest: boolean;
  policyStateBySymbol: Record<string, QuoteSymbolPolicyState>;
  providerHealthSummary: Record<string, QuoteProviderHealthSummary>;
  policy: QuoteRuntimePolicyState;
};

export type QuoteResponse = {
  quotes: Record<string, Quote>;
  meta: QuoteResponseMetadata;
};
