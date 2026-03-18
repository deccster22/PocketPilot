import type { AlignmentState, MarketEvent } from '@/core/types/marketEvent';

export type EventStream = {
  accountId: string;
  timestamp: number;
  events: MarketEvent[];
};

export function createEventStream(params: {
  accountId: string;
  timestamp: number;
  events: MarketEvent[];
}): EventStream {
  const events = [...params.events].sort((left, right) => {
    const timestampDiff = left.timestamp - right.timestamp;
    if (timestampDiff !== 0) {
      return timestampDiff;
    }

    return left.eventId.localeCompare(right.eventId);
  });

  return {
    accountId: params.accountId,
    timestamp: params.timestamp,
    events,
  };
}

export function summarizeAlignment(events: MarketEvent[]): AlignmentState {
  if (events.some((event) => event.alignmentState === 'NEEDS_REVIEW')) {
    return 'NEEDS_REVIEW';
  }

  if (events.some((event) => event.alignmentState === 'WATCHFUL')) {
    return 'WATCHFUL';
  }

  return 'ALIGNED';
}
