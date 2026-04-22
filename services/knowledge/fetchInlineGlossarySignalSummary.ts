import {
  defaultInlineGlossarySignalStore,
  type InlineGlossarySignalStore,
} from '@/services/knowledge/inlineGlossarySignalStore';
import type { InlineGlossarySignalSummaryAvailability } from '@/services/knowledge/types';

export function fetchInlineGlossarySignalSummary(params: {
  signalStore?: InlineGlossarySignalStore;
} = {}): InlineGlossarySignalSummaryAvailability {
  const signalStore = params.signalStore ?? defaultInlineGlossarySignalStore;
  const signals = signalStore.getSignals();

  if (signals.length === 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_SIGNALS_RECORDED',
    };
  }

  return {
    status: 'AVAILABLE',
    signals,
  };
}
