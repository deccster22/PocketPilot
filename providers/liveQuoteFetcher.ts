import type { Quote } from '@/core/types/quote';

const BINANCE_TICKER_URL = 'https://api.binance.com/api/v3/ticker/bookTicker';

function toBinanceSymbol(symbol: string): string {
  return `${symbol.toUpperCase()}USDT`;
}

export async function fetchLiveQuotes(_accountId: string, symbols: string[], nowMs: number): Promise<Quote[]> {
  const requests = symbols.map(async (symbol): Promise<Quote> => {
    const pair = toBinanceSymbol(symbol);

    try {
      const response = await fetch(`${BINANCE_TICKER_URL}?symbol=${pair}`);
      if (!response.ok) {
        throw new Error(`ticker fetch failed: ${response.status}`);
      }

      const body = (await response.json()) as {
        bidPrice?: string;
        askPrice?: string;
      };

      const bid = Number(body.bidPrice ?? Number.NaN);
      const ask = Number(body.askPrice ?? Number.NaN);
      const midpoint = (bid + ask) / 2;

      if (!Number.isFinite(midpoint)) {
        throw new Error('invalid ticker response');
      }

      return {
        symbol,
        price: midpoint,
        bid: Number.isFinite(bid) ? bid : undefined,
        ask: Number.isFinite(ask) ? ask : undefined,
        estimated: false,
        timestamp: nowMs,
        source: 'binance-book-ticker',
      };
    } catch {
      return {
        symbol,
        price: 0,
        estimated: true,
        timestamp: nowMs,
        source: 'fallback-estimated',
      };
    }
  });

  return Promise.all(requests);
}
