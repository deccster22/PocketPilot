import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type { Certainty, MarketEvent } from '@/core/types/marketEvent';
import type { SinceLastCheckedPayload } from '@/services/events/createSinceLastChecked';
import { selectLatestRelevantEvent } from '@/services/orientation/selectLatestRelevantEvent';

export type OrientationContext = {
  accountId?: string;
  symbol?: string;
  strategyId?: string;
  currentState: {
    latestRelevantEvent?: EventLedgerEntry | MarketEvent | null;
    strategyAlignment?: string | null;
    certainty?: Certainty | null;
  };
  historyContext: {
    eventsSinceLastViewed: EventLedgerEntry[];
    sinceLastChecked?: SinceLastCheckedPayload | null;
  };
};

function cloneEvents(entries: ReadonlyArray<EventLedgerEntry>): EventLedgerEntry[] {
  return [...entries];
}

function cloneSinceLastCheckedPayload(
  payload: SinceLastCheckedPayload,
): SinceLastCheckedPayload {
  return {
    ...payload,
    events: cloneEvents(payload.events),
  };
}

export function createOrientationContext(params: {
  accountId?: string;
  symbol?: string;
  strategyId?: string;
  currentEvents?: ReadonlyArray<MarketEvent>;
  strategyAlignment?: string | null;
  sinceLastChecked?: SinceLastCheckedPayload | null;
}): OrientationContext {
  const latestRelevantEvent = selectLatestRelevantEvent(params.currentEvents ?? []);
  const sinceLastChecked = params.sinceLastChecked
    ? cloneSinceLastCheckedPayload(params.sinceLastChecked)
    : null;
  const eventsSinceLastViewed = sinceLastChecked ? cloneEvents(sinceLastChecked.events) : [];

  return {
    accountId: params.accountId ?? latestRelevantEvent?.accountId,
    symbol: params.symbol ?? latestRelevantEvent?.symbol ?? undefined,
    strategyId: params.strategyId ?? latestRelevantEvent?.strategyId,
    currentState: {
      latestRelevantEvent,
      strategyAlignment: params.strategyAlignment ?? null,
      certainty: latestRelevantEvent?.certainty ?? null,
    },
    historyContext: {
      eventsSinceLastViewed,
      sinceLastChecked,
    },
  };
}
