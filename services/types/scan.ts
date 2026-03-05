import type { Quote } from '@/core/types/quote';
import type { QuoteBrokerInstrumentation } from '@/providers/quoteBroker';

export type ForegroundScanResult = {
  accountId: string;
  symbols: string[];
  quotes: Record<string, Quote>;
  baselineQuotes?: Record<string, Quote>;
  pctChangeBySymbol?: Record<string, number>;
  estimatedFlags: Record<string, boolean>;
  instrumentation: QuoteBrokerInstrumentation;
};
