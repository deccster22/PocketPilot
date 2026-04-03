import type { MarketEvent } from '@/core/types/marketEvent';
import { createExplanationSummary } from '@/services/explanation/createExplanationSummary';
import type { ExplanationAvailability } from '@/services/explanation/types';

import type { DashboardData } from './dashboardDataService';
import type { DashboardSurfaceModel } from './types';

function matchesPrimeItem(
  event: MarketEvent,
  primeItem: DashboardSurfaceModel['primeZone']['items'][number],
): boolean {
  return (
    event.timestamp === primeItem.timestamp &&
    event.accountId === primeItem.accountId &&
    event.strategyId === primeItem.strategyId &&
    event.eventType === primeItem.eventType &&
    event.symbol === (primeItem.symbol ?? null)
  );
}

export function fetchDashboardExplanationVM(params: {
  surfaceModel: DashboardSurfaceModel;
  events: ReadonlyArray<MarketEvent>;
  explanationContext: DashboardData['explanationContext'];
}): ExplanationAvailability {
  const primeItem = params.surfaceModel.primeZone.items[0];

  if (!primeItem) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_EXPLANATION_TARGET',
    };
  }

  return createExplanationSummary({
    surface: 'DASHBOARD_PRIME',
    target: primeItem,
    currentEvent: params.events.find((event) => matchesPrimeItem(event, primeItem)) ?? null,
    orientationContext: params.explanationContext,
  });
}
