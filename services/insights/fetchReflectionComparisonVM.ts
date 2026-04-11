import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import { fetchComparisonWindowVM } from '@/services/insights/fetchComparisonWindowVM';
import type {
  InsightsHistorySurface,
  ReflectionComparisonVM,
} from '@/services/insights/types';

export function fetchReflectionComparisonVM(params?: {
  surface?: InsightsHistorySurface;
  nowProvider?: () => number;
  accountId?: string;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
}): ReflectionComparisonVM {
  return fetchComparisonWindowVM({
    ...params,
    window: 'LAST_90_DAYS_VS_PREVIOUS_90_DAYS',
  });
}
