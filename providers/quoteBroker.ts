import type { Quote } from '@/core/types/quote';
import type {
  CertaintyState,
  FreshnessState,
  ProviderBudgetClass,
  ProviderRequestContext,
  QuoteRequest,
  QuoteResponse,
  QuoteRuntimePolicyState,
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

export class QuoteBroker {
  readonly providerId: string;

  private readonly fetcher: QuoteFetcher;

  private readonly nowProvider: () => number;

  private readonly cooldownMs: number;

  private readonly budgetWindows: Partial<Record<ProviderBudgetClass, BudgetWindow>>;

  private instrumentationState: QuoteBrokerInstrumentation;

  private readonly lastGoodByKey: Map<string, LastGoodEntry>;

  private cooldownUntilMs: number | null;

  constructor(options: {
    providerId?: string;
    fetcher: QuoteFetcher;
    nowProvider?: () => number;
    cooldownMs?: number;
  }) {
    this.providerId = options.providerId ?? 'quote-broker';
    this.fetcher = options.fetcher;
    this.nowProvider = options.nowProvider ?? Date.now;
    this.cooldownMs = options.cooldownMs ?? 0;
    this.budgetWindows = {};
    this.instrumentationState = {
      requests: 0,
      symbolsRequested: 0,
      symbolsFetched: 0,
      symbolsBlocked: 0,
    };
    this.lastGoodByKey = new Map<string, LastGoodEntry>();
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
    const budgetClass = resolveBudgetClass(context);
    const budgetWindow = this.getBudgetWindow(budgetClass, nowMs);
    this.instrumentationState.requests += 1;
    this.instrumentationState.symbolsRequested += requestedSymbols.length;

    if (this.isCooldownActive(nowMs)) {
      const lastGoodQuotes = this.selectLastGoodQuotes(normalizedRequest);
      this.instrumentationState.symbolsBlocked += requestedSymbols.length;
      return this.buildResponse({
        request: normalizedRequest,
        quotes: lastGoodQuotes,
        providersTried: [],
        fallbackUsed: false,
        usedLastGood: Object.keys(lastGoodQuotes).length > 0,
        staleIfError:
          Object.keys(lastGoodQuotes).length > 0 ? 'USED_LAST_GOOD' : 'FAILED_WITHOUT_LAST_GOOD',
        cooldown: 'ACTIVE_SKIP',
      });
    }

    const available = MODE_BUDGETS[budgetClass] - budgetWindow.used;
    const allowedCount = Math.max(0, Math.min(available, requestedSymbols.length));
    const allowedSymbols = requestedSymbols.slice(0, allowedCount);

    budgetWindow.used += allowedSymbols.length;
    this.instrumentationState.symbolsFetched += allowedSymbols.length;
    this.instrumentationState.symbolsBlocked += requestedSymbols.length - allowedSymbols.length;

    if (allowedSymbols.length === 0) {
      const lastGoodQuotes = this.selectLastGoodQuotes(normalizedRequest);
      return this.buildResponse({
        request: normalizedRequest,
        quotes: lastGoodQuotes,
        providersTried: [],
        fallbackUsed: false,
        usedLastGood: Object.keys(lastGoodQuotes).length > 0,
        staleIfError: 'NOT_NEEDED',
        cooldown: 'INACTIVE',
      });
    }

    const providerRequest: QuoteRequest = {
      ...normalizedRequest,
      symbols: allowedSymbols,
      context: normalizeContext(context, normalizedRequest.accountId, allowedSymbols),
    };

    try {
      const fetchedQuotes = await this.fetcher(providerRequest);
      const fetchedRecord = toQuoteRecord(fetchedQuotes);
      const lastGoodQuotes = this.selectLastGoodQuotes({
        ...normalizedRequest,
        symbols: requestedSymbols.filter((symbol) => !fetchedRecord[symbol]),
      });
      const quotes = {
        ...fetchedRecord,
        ...lastGoodQuotes,
      };

      this.cooldownUntilMs = null;
      this.storeLastGoodQuotes(context, fetchedRecord);

      return this.buildResponse({
        request: normalizedRequest,
        quotes,
        providersTried: [this.providerId],
        fallbackUsed: false,
        usedLastGood: Object.keys(lastGoodQuotes).length > 0,
        staleIfError: Object.keys(lastGoodQuotes).length > 0 ? 'USED_LAST_GOOD' : 'NOT_NEEDED',
        cooldown: 'INACTIVE',
      });
    } catch {
      if (this.cooldownMs > 0) {
        this.cooldownUntilMs = nowMs + this.cooldownMs;
      }

      const lastGoodQuotes = this.selectLastGoodQuotes(normalizedRequest);
      return this.buildResponse({
        request: normalizedRequest,
        quotes: lastGoodQuotes,
        providersTried: [this.providerId],
        fallbackUsed: false,
        usedLastGood: Object.keys(lastGoodQuotes).length > 0,
        staleIfError:
          Object.keys(lastGoodQuotes).length > 0
            ? 'USED_LAST_GOOD'
            : 'FAILED_WITHOUT_LAST_GOOD',
        cooldown: 'INACTIVE',
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

  private selectLastGoodQuotes(request: QuoteRequest): Record<string, Quote> {
    const quotes: Record<string, Quote> = {};

    for (const symbol of request.symbols) {
      const lastGoodEntry = this.getLastGoodEntry(request.context, request.accountId, symbol);
      const cachedQuote = request.cachedQuotes?.[symbol];

      if (lastGoodEntry) {
        quotes[symbol] = lastGoodEntry.quote;
        continue;
      }

      if (cachedQuote) {
        quotes[symbol] = cachedQuote;
      }
    }

    return quotes;
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

      this.lastGoodByKey.set(this.createLastGoodKey(context, context.accountId ?? '', quote.symbol), {
        quote,
        timestampMs,
      });
    }
  }

  private buildResponse(params: {
    request: QuoteRequest;
    quotes: Record<string, Quote>;
    providersTried: string[];
    fallbackUsed: boolean;
    usedLastGood: boolean;
    staleIfError: QuoteRuntimePolicyState['staleIfError'];
    cooldown: QuoteRuntimePolicyState['cooldown'];
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
    const conservativeLastGoodMs = returnedSymbols
      .map((symbol) => this.getLastGoodEntry(params.request.context, params.request.accountId, symbol)?.timestampMs)
      .filter((timestampMs): timestampMs is number => typeof timestampMs === 'number');

    return {
      quotes: params.quotes,
      meta: {
        role: params.request.context.role,
        providerId: returnedSymbols.length > 0 || params.providersTried.length > 0 ? this.providerId : null,
        freshness: this.getFreshness(
          params.request.context,
          params.request.nowMs,
          conservativeLastUpdatedMs,
          params.usedLastGood,
          returnedSymbols.length,
        ),
        certainty: this.getCertainty(params.quotes, returnedSymbols),
        lastUpdatedAt: toIsoString(conservativeLastUpdatedMs),
        lastGoodAt:
          conservativeLastGoodMs.length > 0 ? toIsoString(Math.min(...conservativeLastGoodMs)) : null,
        usedLastGood: params.usedLastGood,
        requestedSymbols,
        returnedSymbols,
        missingSymbols,
        timestampMs: params.request.nowMs,
        providersTried: params.providersTried,
        sourceBySymbol,
        fallbackUsed: params.fallbackUsed,
        policy: {
          staleIfError: params.staleIfError,
          staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY',
          cooldown: params.cooldown,
        },
      },
    };
  }

  private getFreshness(
    context: ProviderRequestContext,
    nowMs: number,
    lastUpdatedMs: number | null,
    usedLastGood: boolean,
    returnedSymbolCount: number,
  ): FreshnessState {
    if (returnedSymbolCount === 0 || lastUpdatedMs === null) {
      return 'UNAVAILABLE';
    }

    if (usedLastGood) {
      return 'LAST_GOOD';
    }

    return nowMs - lastUpdatedMs > getFreshnessThresholdMs(context) ? 'STALE' : 'FRESH';
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
