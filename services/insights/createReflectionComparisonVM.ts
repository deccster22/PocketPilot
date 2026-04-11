import type { EventLedgerEntry } from '@/core/types/eventLedger';
import { createComparisonWindowVM } from '@/services/insights/createComparisonWindowVM';
import type { ReflectionComparisonVM } from '@/services/insights/types';

export function createReflectionComparisonVM(params: {
  generatedAt: string | null;
  history: ReadonlyArray<EventLedgerEntry>;
}): ReflectionComparisonVM {
  return createComparisonWindowVM({
    generatedAt: params.generatedAt,
    history: params.history,
    window: 'LAST_90_DAYS_VS_PREVIOUS_90_DAYS',
  });
}
