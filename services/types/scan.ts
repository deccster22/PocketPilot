import type { Quote } from '@/core/types/quote';
import type { QuoteBrokerInstrumentation } from '@/providers/quoteBroker';

export type ForegroundScanResult = {
  accountId: string;
  symbols: string[];
  quotes: Quote[];
  instrumentation: QuoteBrokerInstrumentation;
};
