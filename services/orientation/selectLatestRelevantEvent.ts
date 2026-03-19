import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type { MarketEvent } from '@/core/types/marketEvent';

function isMarketEvent(entry: EventLedgerEntry | MarketEvent): entry is MarketEvent {
  return 'strategyId' in entry && 'eventType' in entry && 'signalsTriggered' in entry;
}

function shouldReplaceLatest(current: MarketEvent, latest: MarketEvent | null): boolean {
  if (latest === null) {
    return true;
  }

  if (current.timestamp !== latest.timestamp) {
    return current.timestamp > latest.timestamp;
  }

  return current.eventId.localeCompare(latest.eventId) >= 0;
}

export function selectLatestRelevantEvent(
  entries: ReadonlyArray<EventLedgerEntry | MarketEvent>,
): MarketEvent | null {
  let latest: MarketEvent | null = null;

  for (const entry of entries) {
    if (!isMarketEvent(entry)) {
      continue;
    }

    if (shouldReplaceLatest(entry, latest)) {
      latest = entry;
    }
  }

  return latest;
}
