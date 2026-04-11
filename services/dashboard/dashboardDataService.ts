import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type { UserProfile } from '@/core/profile/types';
import type { MarketEvent } from '@/core/types/marketEvent';
import type {
  AggregatePortfolioAvailability,
  SelectedAccountAvailability,
} from '@/services/accounts/types';
import type { OrientationContext as ExplanationContext } from '@/services/orientation/createOrientationContext';
import { fetchSurfaceContext } from '@/services/upstream/fetchSurfaceContext';
import type { ForegroundScanResult } from '@/services/types/scan';

import type { OrientationContext } from './types';

export type DashboardData = {
  accountContext: SelectedAccountAvailability;
  aggregatePortfolioContext: AggregatePortfolioAvailability;
  scan: ForegroundScanResult;
  events: MarketEvent[];
  orientationContext: OrientationContext;
  explanationContext: ExplanationContext;
};

function cloneDashboardEvents(events: ReadonlyArray<MarketEvent>): MarketEvent[] {
  return events.map((event) => ({
    ...event,
    signalsTriggered: [...event.signalsTriggered],
    metadata: { ...event.metadata },
  }));
}

function cloneEventLedgerEntry(entry: EventLedgerEntry): EventLedgerEntry {
  if ('strategyId' in entry && 'eventType' in entry && 'signalsTriggered' in entry) {
    return {
      ...entry,
      signalsTriggered: [...entry.signalsTriggered],
      metadata: { ...entry.metadata },
    };
  }

  return {
    ...entry,
    metadata: { ...entry.metadata },
  };
}

function cloneExplanationContext(context: ExplanationContext): ExplanationContext {
  return {
    ...context,
    currentState: {
      latestRelevantEvent: context.currentState.latestRelevantEvent
        ? cloneEventLedgerEntry(context.currentState.latestRelevantEvent)
        : context.currentState.latestRelevantEvent,
      strategyAlignment: context.currentState.strategyAlignment,
      certainty: context.currentState.certainty,
    },
    historyContext: {
      eventsSinceLastViewed: context.historyContext.eventsSinceLastViewed.map(cloneEventLedgerEntry),
      sinceLastChecked: context.historyContext.sinceLastChecked
        ? {
            ...context.historyContext.sinceLastChecked,
            events: context.historyContext.sinceLastChecked.events.map(cloneEventLedgerEntry),
          }
        : context.historyContext.sinceLastChecked,
    },
  };
}

export async function fetchDashboardData(params: {
  profile: UserProfile;
  baselineScan?: ForegroundScanResult;
  nowProvider?: () => number;
}): Promise<DashboardData> {
  const upstream = await fetchSurfaceContext({
    ...params,
    accountSwitchingEnabled: true,
    aggregatePortfolioEnabled: true,
  });

  return {
    accountContext: upstream.selectedAccountContext,
    aggregatePortfolioContext: upstream.aggregatePortfolioContext,
    scan: upstream.scan,
    events: cloneDashboardEvents(upstream.marketEvents),
    orientationContext: {
      profile: params.profile,
      assets: [],
    },
    explanationContext: cloneExplanationContext(upstream.orientationContext),
  };
}
