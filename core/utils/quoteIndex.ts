import type { Quote } from '@/core/types/quote';

export function indexQuotesBySymbol(quotes: Quote[]): Record<string, Quote> {
  return quotes.reduce<Record<string, Quote>>((acc, quote) => {
    acc[quote.symbol] = quote;
    return acc;
  }, {});
}
