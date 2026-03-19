import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type { Certainty } from '@/core/types/marketEvent';
import type { OrientationContext } from '@/services/orientation/createOrientationContext';
import {
  deriveSnapshotTrendDirection,
  type SnapshotTrendDirection,
} from '@/services/snapshot/deriveSnapshotTrendDirection';

export type SnapshotCertainty = Certainty | null;

export type SnapshotModel = {
  core: {
    currentState: {
      price: number | null;
      pctChange24h: number | null;
      certainty: SnapshotCertainty;
    };
    strategyStatus: {
      alignmentState: string | null;
      latestEventType: string | null;
      trendDirection: SnapshotTrendDirection;
    };
  };
  secondary: {
    volatilityContext?: null;
    strategyFit?: null;
    contributingEventCount?: null;
  };
  history: {
    hasMeaningfulChanges: boolean;
    eventsSinceLastViewedCount: number;
    sinceLastCheckedSummaryCount: number | null;
  };
};

function isMarketEvent(
  event: EventLedgerEntry | OrientationContext['currentState']['latestRelevantEvent'],
): event is NonNullable<OrientationContext['currentState']['latestRelevantEvent']> & {
  eventType: string;
  price: number | null;
  pctChange: number | null;
} {
  return Boolean(event && 'eventType' in event);
}

function createCurrentState(
  orientationContext: OrientationContext,
): SnapshotModel['core']['currentState'] {
  const latestRelevantEvent = orientationContext.currentState.latestRelevantEvent;

  return {
    price: isMarketEvent(latestRelevantEvent) ? latestRelevantEvent.price : null,
    pctChange24h: isMarketEvent(latestRelevantEvent) ? latestRelevantEvent.pctChange : null,
    certainty: orientationContext.currentState.certainty ?? null,
  };
}

function createStrategyStatus(
  orientationContext: OrientationContext,
): SnapshotModel['core']['strategyStatus'] {
  const latestRelevantEvent = orientationContext.currentState.latestRelevantEvent;

  return {
    alignmentState: orientationContext.currentState.strategyAlignment ?? null,
    latestEventType: isMarketEvent(latestRelevantEvent) ? latestRelevantEvent.eventType : null,
    trendDirection: deriveSnapshotTrendDirection(orientationContext),
  };
}

function createHistory(
  orientationContext: OrientationContext,
): SnapshotModel['history'] {
  const eventsSinceLastViewedCount =
    orientationContext.historyContext.eventsSinceLastViewed.length;
  const sinceLastCheckedSummaryCount =
    orientationContext.historyContext.sinceLastChecked?.summaryCount ?? null;

  return {
    hasMeaningfulChanges: eventsSinceLastViewedCount > 0,
    eventsSinceLastViewedCount,
    sinceLastCheckedSummaryCount,
  };
}

export function createSnapshotModel(
  orientationContext: OrientationContext,
): SnapshotModel {
  return {
    core: {
      currentState: createCurrentState(orientationContext),
      strategyStatus: createStrategyStatus(orientationContext),
    },
    secondary: {},
    history: createHistory(orientationContext),
  };
}
