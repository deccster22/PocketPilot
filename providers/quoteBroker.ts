import type { Quote } from '@/core/types/quote';

export type QuoteMode = 'CALM' | 'WATCHING_NOW';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

const MODE_BUDGETS: Record<QuoteMode, number> = {
  CALM: 20,
  WATCHING_NOW: 60,
};

export type QuoteBrokerInstrumentation = {
  requests: number;
  symbolsRequested: number;
  symbolsFetched: number;
  symbolsBlocked: number;
};

type QuoteFetcher = (
  accountId: string,
  symbols: string[],
  nowMs: number,
) => Promise<Quote[]>;

type BudgetWindow = {
  windowStartMs: number;
  used: number;
};

export class QuoteBroker {
  private readonly fetcher: QuoteFetcher;

  private readonly nowProvider: () => number;

  private readonly mode: QuoteMode;

  private budgetWindow: BudgetWindow;

  private instrumentationState: QuoteBrokerInstrumentation;

  constructor(options: {
    mode: QuoteMode;
    fetcher: QuoteFetcher;
    nowProvider?: () => number;
  }) {
    this.mode = options.mode;
    this.fetcher = options.fetcher;
    this.nowProvider = options.nowProvider ?? Date.now;
    const startMs = this.nowProvider();
    this.budgetWindow = { windowStartMs: startMs, used: 0 };
    this.instrumentationState = {
      requests: 0,
      symbolsRequested: 0,
      symbolsFetched: 0,
      symbolsBlocked: 0,
    };
  }

  get instrumentation(): QuoteBrokerInstrumentation {
    return { ...this.instrumentationState };
  }

  async getQuotes(accountId: string, symbols: string[]): Promise<Quote[]> {
    const nowMs = this.nowProvider();
    this.rollWindow(nowMs);

    this.instrumentationState.requests += 1;
    this.instrumentationState.symbolsRequested += symbols.length;

    const available = MODE_BUDGETS[this.mode] - this.budgetWindow.used;
    const allowedCount = Math.max(0, Math.min(available, symbols.length));
    const allowedSymbols = symbols.slice(0, allowedCount);

    this.budgetWindow.used += allowedSymbols.length;
    this.instrumentationState.symbolsFetched += allowedSymbols.length;
    this.instrumentationState.symbolsBlocked += symbols.length - allowedSymbols.length;

    if (allowedSymbols.length === 0) {
      return [];
    }

    return this.fetcher(accountId, allowedSymbols, nowMs);
  }

  private rollWindow(nowMs: number): void {
    if (nowMs - this.budgetWindow.windowStartMs >= FIVE_MINUTES_MS) {
      this.budgetWindow = { windowStartMs: nowMs, used: 0 };
    }
  }
}
