import type { Quote } from '@/core/types/quote';
import {
  appendProviderHealthEvent,
  buildProviderHealthSnapshot,
  DEFAULT_PROVIDER_HEALTH_WINDOW_SIZE,
  type ProviderHealthEvent,
} from '@/services/providers/providerHealth';
import type {
  CertaintyState,
  FreshnessState,
  ProviderBudgetClass,
  ProviderRequestContext,
  ProviderRequestRole,
  QuoteProviderHealthSummary,
  QuoteRequest,
  QuoteResponse,
  QuoteRuntimePolicyState,
  QuoteSymbolPolicyState,
} from '@/services/providers/types';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

const MODE_BUDGETS: Record<ProviderBudgetClass, number> = {
  CALM: 20,
  WATCHING_NOW: 60,
  MACRO: 20,
  ENRICHMENT: 20,
};

export type QuoteBrokerInstrumentation = {
  requests: number;
  symbolsRequested: number;
  symbolsFetched: number;
  symbolsBlocked: number;
};

type QuoteFetcher = (request: QuoteRequest) => Promise<Quote[]>;

type BudgetWindow = {
  windowStartMs: number;
  used: number;
};

type LastGoodEntry = {
  quote: Quote;
  timestampMs: number;
};

type InFlightRequest = {
  consumerCount: number;
  promise: Promise<QuoteResponse>;
};

type ReusedQuoteSelection = {
  quotes: Record<string, Quote>;
  lastGoodSymbols: string[];
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

function toQuoteRecord(quotes: Quote[]): Record<string, Quote> {
  return quotes.reduce<Record<string, Quote>>((acc, quote) => {
    if (!acc[quote.symbol]) {
      acc[quote.symbol] = quote;
    }

    return acc;
  }, {});
}

function getQuoteTimestampMs(quote: Quote): number | null {
  const timestampMs = quote.timestampMs ?? quote.timestamp;
  return typeof timestampMs === 'number' && Number.isFinite(timestampMs) ? timestampMs : null;
}

function toIsoString(timestampMs: number | null): string | null {
  return timestampMs === null ? null : new Date(timestampMs).toISOString();
}

function normalizeContext(
  context: ProviderRequestContext,
  accountId: string,
  symbols: string[],
): ProviderRequestContext {
  return {
    ...context,
    accountId,
    symbols,
    quoteCurrency: context.quoteCurrency ?? null,
  };
}

function resolveBudgetClass(context: ProviderRequestContext): ProviderBudgetClass {
  if (context.budgetClass) {
    return context.budgetClass;
  }

  switch (context.role) {
    case 'macro':
      return 'MACRO';
    case 'enrichment':
      return 'ENRICHMENT';
    default:
      return 'CALM';
  }
}

function getFreshnessThresholdMs(context: ProviderRequestContext): number {
  const budgetClass = resolveBudgetClass(context);

  switch (context.role) {
    case 'execution':
      return 15_000;
    case 'macro':
      return 30 * 60 * 1000;
    case 'enrichment':
      return 60 * 60 * 1000;
    case 'reference':
    default:
      return budgetClass === 'WATCHING_NOW' ? 60_000 : 5 * 60 * 1000;
  }
}

function serializeQuoteForKey(quote: Quote | undefined): [
  number | null,
  number | null,
  boolean | null,
  number | null,
  number | null,
  string | null,
] | null {
  if (!quote) {
    return null;
  }

  return [
    quote.price ?? null,
    getQuoteTimestampMs(quote),
    quote.estimated ?? null,
    quote.bid ?? null,
    quote.ask ?? null,
    quote.source ?? null,
  ];
}

function createRequestKey(request: QuoteRequest): string {
  return JSON.stringify({
    accountId: request.accountId,
    nowMs: request.nowMs,
    role: request.context.role,
    budgetClass: resolveBudgetClass(request.context),
    quoteCurrency: request.context.quoteCurrency ?? null,
    symbols: request.symbols,
    cachedQuotes: request.symbols.map((symbol) => [symbol, serializeQuoteForKey(request.cachedQuotes?.[symbol])]),
  });
}

function getFetchedSymbolPolicyState(
  context: ProviderRequestContext,
  nowMs: number,
  quote: Quote,
): QuoteSymbolPolicyState {
  const timestampMs = getQuoteTimestampMs(quote);

  if (timestampMs === null) {
    return 'STALE';
  }

  return nowMs - timestampMs > getFreshnessThresholdMs(context) ? 'STALE' : 'FRESH';
}

export class QuoteBroker {
  readonly providerId: string;

  private readonly fetcher: QuoteFetcher;

  private readonly nowProvider: () => number;

  private readonly cooldownMs: number;

  private readonly healthWindowSize: number;

  private readonly budgetWindows: Partial<Record<ProviderBudgetClass, BudgetWindow>>;

  private instrumentationState: QuoteBrokerInstrumentation;

  private readonly lastGoodByKey: Map<string, LastGoodEntry>;

  private readonly inFlightByKey: Map<string, InFlightRequest>;

  private readonly recentHealthEventsByRole: Partial<
    Record<ProviderRequestRole, ReadonlyArray<ProviderHealthEvent>>
  >;

  private cooldownUntilMs: number | null;

  constructor(options: {
    providerId?: string;
    fetcher: QuoteFetcher;
    nowProvider?: () => number;
    cooldownMs?: number;
    healthWindowSize?: number;
  }) {
    this.providerId = options.providerId ?? 'quote-broker';
    this.fetcher = options.fetcher;
    this.nowProvider = options.nowProvider ?? Date.now;
    this.cooldownMs = options.cooldownMs ?? 0;
    this.healthWindowSize = options.healthWindowSize ?? DEFAULT_PROVIDER_HEALTH_WINDOW_SIZE;
    this.budgetWindows = {};
    this.instrumentationState = {
      requests: 0,
      symbolsRequested: 0,
      symbolsFetched: 0,
      symbolsBlocked: 0,
    };
    this.lastGoodByKey = new Map<string, LastGoodEntry>();
    this.inFlightByKey = new Map<string, InFlightRequest>();
    this.recentHealthEventsByRole = {};
    this.cooldownUntilMs = null;
  }

  get instrumentation(): QuoteBrokerInstrumentation {
    return { ...this.instrumentationState };
  }

  async getQuotes(request: QuoteRequest): Promise<QuoteResponse> {
    const nowMs = request.nowMs ?? this.nowProvider();
    const requestedSymbols = toOrderedSymbols(request.symbols);
    const context = normalizeContext(request.context, request.accountId, requestedSymbols);
    const normalizedRequest: QuoteRequest = {
      ...request,
      nowMs,
      symbols: requestedSymbols,
      context,
    };
    const requestKey = createRequestKey(normalizedRequest);

    this.instrumentationState.requests += 1;
    this.instrumentationState.symbolsRequested += requestedSymbols.length;

    const inFlightRequest = this.inFlightByKey.get(requestKey);
    if (inFlightRequest) {
      inFlightRequest.consumerCount += 1;
      return inFlightRequest.promise;
    }

    const pendingRequest: InFlightRequest = {
      consumerCount: 1,
      promise: Promise.resolve(undefined as never),
    };

    pendingRequest.promise = this.executeRequest(normalizedRequest, pendingRequest).finally(() => {
      this.inFlightByKey.delete(requestKey);
    });
    this.inFlightByKey.set(requestKey, pendingRequest);

    return pendingRequest.promise;
  }

  private async executeRequest(
    request: QuoteRequest,
    inFlightRequest: InFlightRequest,
  ): Promise<QuoteResponse> {
    const requestedSymbols = request.symbols;
    const context = request.context;
    const nowMs = request.nowMs;
    const budgetClass = resolveBudgetClass(context);
    const budgetWindow = this.getBudgetWindow(budgetClass, nowMs);

    if (this.isCooldownActive(nowMs)) {
      this.recordHealthEvent(context.role, 'COOLDOWN_SKIP', nowMs);
      const reusedQuotes = this.selectLastGoodQuotes(request);
      this.instrumentationState.symbolsBlocked += requestedSymbols.length;
      return this.buildResponse({
        request,
        quotes: reusedQuotes.quotes,
        providersTried: [],
        staleIfError:
          reusedQuotes.lastGoodSymbols.length > 0
            ? 'USED_LAST_GOOD'
            : 'FAILED_WITHOUT_LAST_GOOD',
        cooldown: 'ACTIVE_SKIP',
        coalescedRequest: inFlightRequest.consumerCount > 1,
        policyStateBySymbol: this.buildPolicyStateBySymbol(request, {}, reusedQuotes),
      });
    }

    const available = MODE_BUDGETS[budgetClass] - budgetWindow.used;
    const allowedCount = Math.max(0, Math.min(available, requestedSymbols.length));
    const allowedSymbols = requestedSymbols.slice(0, allowedCount);

    budgetWindow.used += allowedSymbols.length;
    this.instrumentationState.symbolsFetched += allowedSymbols.length;
    this.instrumentationState.symbolsBlocked += requestedSymbols.length - allowedSymbols.length;

    if (allowedSymbols.length === 0) {
      const reusedQuotes = this.selectLastGoodQuotes(request);
      return this.buildResponse({
        request,
        quotes: reusedQuotes.quotes,
        providersTried: [],
        staleIfError: 'NOT_NEEDED',
        cooldown: 'INACTIVE',
        coalescedRequest: inFlightRequest.consumerCount > 1,
        policyStateBySymbol: this.buildPolicyStateBySymbol(request, {}, reusedQuotes),
      });
    }

    const providerRequest: QuoteRequest = {
      ...request,
      symbols: allowedSymbols,
      context: normalizeContext(context, request.accountId, allowedSymbols),
    };

    try {
      const fetchedQuotes = await this.fetcher(providerRequest);
      const fetchedRecord = toQuoteRecord(fetchedQuotes);
      const reusedQuotes = this.selectLastGoodQuotes({
        ...request,
        symbols: requestedSymbols.filter((symbol) => !fetchedRecord[symbol]),
      });
      const quotes = {
        ...fetchedRecord,
        ...reusedQuotes.quotes,
      };

      this.cooldownUntilMs = null;
      this.recordHealthEvent(context.role, 'SUCCESS', nowMs);
      this.storeLastGoodQuotes(context, request.accountId, fetchedRecord);

      return this.buildResponse({
        request,
        quotes,
        providersTried: [this.providerId],
        staleIfError:
          reusedQuotes.lastGoodSymbols.length > 0 ? 'USED_LAST_GOOD' : 'NOT_NEEDED',
        cooldown: 'INACTIVE',
        coalescedRequest: inFlightRequest.consumerCount > 1,
        policyStateBySymbol: this.buildPolicyStateBySymbol(request, fetchedRecord, reusedQuotes),
      });
    } catch {
      this.recordHealthEvent(context.role, 'FAILURE', nowMs);
      if (this.cooldownMs > 0) {
        this.cooldownUntilMs = nowMs + this.cooldownMs;
      }

      const reusedQuotes = this.selectLastGoodQuotes(request);
      return this.buildResponse({
        request,
        quotes: reusedQuotes.quotes,
        providersTried: [this.providerId],
        staleIfError:
          reusedQuotes.lastGoodSymbols.length > 0
            ? 'USED_LAST_GOOD'
            : 'FAILED_WITHOUT_LAST_GOOD',
        cooldown: 'INACTIVE',
        coalescedRequest: inFlightRequest.consumerCount > 1,
        policyStateBySymbol: this.buildPolicyStateBySymbol(request, {}, reusedQuotes),
      });
    }
  }

  private getBudgetWindow(budgetClass: ProviderBudgetClass, nowMs: number): BudgetWindow {
    const existingWindow = this.budgetWindows[budgetClass];

    if (!existingWindow || nowMs - existingWindow.windowStartMs >= FIVE_MINUTES_MS) {
      const nextWindow = { windowStartMs: nowMs, used: 0 };
      this.budgetWindows[budgetClass] = nextWindow;
      return nextWindow;
    }

    return existingWindow;
  }

  private isCooldownActive(nowMs: number): boolean {
    return this.cooldownUntilMs !== null && nowMs < this.cooldownUntilMs;
  }

  private selectLastGoodQuotes(request: QuoteRequest): ReusedQuoteSelection {
    const quotes: Record<string, Quote> = {};
    const lastGoodSymbols: string[] = [];

    for (const symbol of request.symbols) {
      const lastGoodEntry = this.getLastGoodEntry(request.context, request.accountId, symbol);
      const cachedQuote = request.cachedQuotes?.[symbol];

      if (lastGoodEntry) {
        quotes[symbol] = lastGoodEntry.quote;
        lastGoodSymbols.push(symbol);
        continue;
      }

      if (cachedQuote) {
        quotes[symbol] = cachedQuote;
        lastGoodSymbols.push(symbol);
      }
    }

    return {
      quotes,
      lastGoodSymbols,
    };
  }

  private buildPolicyStateBySymbol(
    request: QuoteRequest,
    fetchedQuotes: Record<string, Quote>,
    reusedQuotes: ReusedQuoteSelection,
  ): Record<string, QuoteSymbolPolicyState> {
    const reusedSymbolSet = new Set(reusedQuotes.lastGoodSymbols);

    return request.symbols.reduce<Record<string, QuoteSymbolPolicyState>>((acc, symbol) => {
      if (reusedSymbolSet.has(symbol)) {
        acc[symbol] = 'LAST_GOOD';
        return acc;
      }

      const fetchedQuote = fetchedQuotes[symbol];
      if (fetchedQuote) {
        acc[symbol] = getFetchedSymbolPolicyState(request.context, request.nowMs, fetchedQuote);
        return acc;
      }

      acc[symbol] = 'UNAVAILABLE';
      return acc;
    }, {});
  }

  private getLastGoodEntry(
    context: ProviderRequestContext,
    accountId: string,
    symbol: string,
  ): LastGoodEntry | undefined {
    return this.lastGoodByKey.get(this.createLastGoodKey(context, accountId, symbol));
  }

  private createLastGoodKey(
    context: ProviderRequestContext,
    accountId: string,
    symbol: string,
  ): string {
    return [context.role, accountId, context.quoteCurrency ?? 'default', symbol].join(':');
  }

  private storeLastGoodQuotes(
    context: ProviderRequestContext,
    accountId: string,
    quotes: Record<string, Quote>,
  ): void {
    for (const quote of Object.values(quotes)) {
      if (quote.estimated) {
        continue;
      }

      const timestampMs = getQuoteTimestampMs(quote);
      if (timestampMs === null) {
        continue;
      }

      this.lastGoodByKey.set(this.createLastGoodKey(context, accountId, quote.symbol), {
        quote,
        timestampMs,
      });
    }
  }

  private recordHealthEvent(
    role: ProviderRequestRole,
    kind: ProviderHealthEvent['kind'],
    timestampMs: number,
  ): void {
    const existingEvents = this.recentHealthEventsByRole[role] ?? [];

    this.recentHealthEventsByRole[role] = appendProviderHealthEvent({
      events: existingEvents,
      event: {
        kind,
        timestampMs,
      },
      windowSize: this.healthWindowSize,
    });
  }

  private buildResponse(params: {
    request: QuoteRequest;
    quotes: Record<string, Quote>;
    providersTried: string[];
    staleIfError: QuoteRuntimePolicyState['staleIfError'];
    cooldown: QuoteRuntimePolicyState['cooldown'];
    coalescedRequest: boolean;
    policyStateBySymbol: Record<string, QuoteSymbolPolicyState>;
  }): QuoteResponse {
    const requestedSymbols = params.request.symbols;
    const returnedSymbols = requestedSymbols.filter((symbol) => Boolean(params.quotes[symbol]));
    const missingSymbols = requestedSymbols.filter((symbol) => !params.quotes[symbol]);
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
    const lastGoodTimestamps = requestedSymbols
      .filter((symbol) => params.policyStateBySymbol[symbol] === 'LAST_GOOD')
      .map((symbol) => params.quotes[symbol])
      .map((quote) => (quote ? getQuoteTimestampMs(quote) : null))
      .filter((timestampMs): timestampMs is number => timestampMs !== null);
    const usedLastGood = requestedSymbols.some(
      (symbol) => params.policyStateBySymbol[symbol] === 'LAST_GOOD',
    );

    return {
      quotes: params.quotes,
      meta: {
        role: params.request.context.role,
        providerId: returnedSymbols.length > 0 || params.providersTried.length > 0 ? this.providerId : null,
        freshness: this.getFreshness(params.policyStateBySymbol, returnedSymbols.length),
        certainty: this.getCertainty(params.quotes, returnedSymbols),
        lastUpdatedAt: toIsoString(conservativeLastUpdatedMs),
        lastGoodAt: lastGoodTimestamps.length > 0 ? toIsoString(Math.min(...lastGoodTimestamps)) : null,
        usedLastGood,
        requestedSymbols,
        returnedSymbols,
        missingSymbols,
        timestampMs: params.request.nowMs,
        providersTried: params.providersTried,
        sourceBySymbol,
        fallbackUsed: false,
        coalescedRequest: params.coalescedRequest,
        policyStateBySymbol: params.policyStateBySymbol,
        providerHealthSummary: this.getProviderHealthSummary({
          role: params.request.context.role,
          cooldown: params.cooldown,
          nowMs: params.request.nowMs,
        }),
        policy: {
          staleIfError: params.staleIfError,
          staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY',
          cooldown: params.cooldown,
          cooldownSkippedProviders: params.cooldown === 'ACTIVE_SKIP' ? [this.providerId] : [],
        },
      },
    };
  }

  private getProviderHealthSummary(params: {
    role: ProviderRequestRole;
    cooldown: QuoteRuntimePolicyState['cooldown'];
    nowMs: number;
  }): Record<string, QuoteProviderHealthSummary> {
    const instrumentation = this.instrumentation;
    const recentEvents = this.recentHealthEventsByRole[params.role] ?? [];
    const recentHealth = buildProviderHealthSnapshot({
      providerId: this.providerId,
      role: params.role,
      events: recentEvents,
      cooldownActive: this.isCooldownActive(params.nowMs),
      windowSize: this.healthWindowSize,
    });

    return {
      [this.providerId]: {
        providerId: this.providerId,
        requests: instrumentation.requests,
        symbolsRequested: instrumentation.symbolsRequested,
        symbolsFetched: instrumentation.symbolsFetched,
        symbolsBlocked: instrumentation.symbolsBlocked,
        cooldown: params.cooldown,
        windowSize: recentHealth.windowSize,
        window: recentHealth.window,
        score: recentHealth.score,
      },
    };
  }

  private getFreshness(
    policyStateBySymbol: Record<string, QuoteSymbolPolicyState>,
    returnedSymbolCount: number,
  ): FreshnessState {
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

  private getCertainty(
    quotes: Record<string, Quote>,
    returnedSymbols: string[],
  ): CertaintyState {
    if (returnedSymbols.length === 0) {
      return 'UNAVAILABLE';
    }

    return returnedSymbols.some((symbol) => quotes[symbol]?.estimated) ? 'ESTIMATED' : 'CONFIRMED';
  }
}
