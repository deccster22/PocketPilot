import type { UserProfile } from '@/core/profile/types';
import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type { EventType, MarketEvent } from '@/core/types/marketEvent';
import { createReorientationSummary } from '@/services/orientation/createReorientationSummary';
import type {
  ReorientationEligibility,
  ReorientationPreference,
  ReorientationSummaryItem,
} from '@/services/orientation/types';
import type { SnapshotVM } from '@/services/snapshot/snapshotService';

function isMarketEvent(
  entry: EventLedgerEntry,
): entry is MarketEvent {
  return 'strategyId' in entry && 'eventType' in entry && 'signalsTriggered' in entry;
}

function formatPctChange(pctChange: number | null): string | null {
  if (pctChange === null) {
    return null;
  }

  const value = Math.abs(pctChange * 100).toFixed(2);

  return `${value}%`;
}

function createEventSummaryItem(event: MarketEvent): ReorientationSummaryItem {
  switch (event.eventType) {
    case 'ESTIMATED_PRICE':
      return {
        kind: 'ACCOUNT_CONTEXT',
        label: event.symbol ? `${event.symbol} price context` : 'Price context',
        detail: event.symbol
          ? `Recent pricing context for ${event.symbol} remains estimated.`
          : 'Recent pricing context remains estimated.',
      };
    case 'DATA_QUALITY':
      return {
        kind: 'ACCOUNT_CONTEXT',
        label: 'Data context',
        detail: 'Some recent market context was captured with data quality limits in view.',
      };
    case 'MOMENTUM_BUILDING':
      return {
        kind: 'STRATEGY_SHIFT',
        label: event.symbol ? `${event.symbol} strategy context` : 'Strategy context',
        detail: event.symbol
          ? `Momentum around ${event.symbol} has been building since your last active session.`
          : 'Momentum context has strengthened since your last active session.',
      };
    case 'DIP_DETECTED':
      return {
        kind: 'VOLATILITY_CHANGE',
        label: event.symbol ? `${event.symbol} pullback` : 'Market pullback',
        detail: event.symbol
          ? `A measured pullback was recorded for ${event.symbol} while you were away.`
          : 'A measured pullback was recorded while you were away.',
      };
    default:
      return {
        kind: 'PRICE_CHANGE',
        label: event.symbol ? `${event.symbol} movement` : 'Price movement',
        detail: event.symbol
          ? `Price context for ${event.symbol} shifted by ${formatPctChange(event.pctChange) ?? 'a modest amount'} since your last active session.`
          : 'Price context shifted since your last active session.',
      };
  }
}

function createSnapshotSummaryItem(params: {
  strategyStatus: string;
  currentState: string;
}): ReorientationSummaryItem {
  return {
    kind: 'MARKET_EVENT',
    label: 'Current orientation',
    detail: `Snapshot reads ${params.currentState.toLowerCase()} with strategy status at ${params.strategyStatus.toLowerCase()}.`,
  };
}

function prioritiseEventType(eventType: EventType): number {
  switch (eventType) {
    case 'DATA_QUALITY':
      return 0;
    case 'ESTIMATED_PRICE':
      return 1;
    case 'DIP_DETECTED':
      return 2;
    case 'MOMENTUM_BUILDING':
      return 3;
    default:
      return 4;
  }
}

function buildSummaryItems(params: {
  eventsSinceLastViewed: ReadonlyArray<EventLedgerEntry>;
  snapshotState: {
    currentState: string;
    strategyStatus: string;
  };
}): ReorientationSummaryItem[] {
  const marketEvents = params.eventsSinceLastViewed
    .filter(isMarketEvent)
    .sort((left, right) => {
      const priorityDiff = prioritiseEventType(left.eventType) - prioritiseEventType(right.eventType);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return right.timestamp - left.timestamp;
    });
  const items: ReorientationSummaryItem[] = [];
  const seenKinds = new Set<string>();

  for (const event of marketEvents) {
    const item = createEventSummaryItem(event);
    const dedupeKey = `${item.kind}:${item.label}`;

    if (seenKinds.has(dedupeKey)) {
      continue;
    }

    seenKinds.add(dedupeKey);
    items.push(item);
  }

  if (items.length === 0) {
    return [];
  }

  items.push(
    createSnapshotSummaryItem({
      currentState: params.snapshotState.currentState,
      strategyStatus: params.snapshotState.strategyStatus,
    }),
  );

  return items;
}

export function createReorientationSummaryFromSnapshot(params: {
  snapshot: Pick<SnapshotVM, 'model' | 'orientationContext' | 'scan'>;
  profile: UserProfile;
  now: string;
  preference?: ReorientationPreference;
}): ReorientationEligibility {
  const sinceLastChecked = params.snapshot.orientationContext.historyContext.sinceLastChecked;

  if (!sinceLastChecked) {
    return {
      status: 'NOT_NEEDED',
      reason: 'NO_MEANINGFUL_CHANGE',
    };
  }

  const summaryItems = buildSummaryItems({
    eventsSinceLastViewed: params.snapshot.orientationContext.historyContext.eventsSinceLastViewed,
    snapshotState: {
      currentState: params.snapshot.model.core.currentState.value,
      strategyStatus: params.snapshot.model.core.strategyStatus.value,
    },
  });

  return createReorientationSummary({
    now: params.now,
    lastActiveAt: new Date(sinceLastChecked.sinceTimestamp).toISOString(),
    profileId: params.profile,
    preference: params.preference,
    summarySource: {
      snapshotModel: params.snapshot.model,
      orientationContext: params.snapshot.orientationContext,
      accountId: params.snapshot.scan.accountId,
    },
    summaryItems,
  });
}
