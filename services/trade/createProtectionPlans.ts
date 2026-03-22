import type { EventType, MarketEvent } from '@/core/types/marketEvent';
import type { OrientationContext } from '@/services/orientation/createOrientationContext';
import type {
  ProtectionPlan,
  ProtectionPlanIntentType,
  ProtectionPlanRiskAlignment,
  ProtectionPlanRiskCertainty,
} from '@/services/trade/types';

type ScopedEvents = {
  accountId: string;
  strategyId: string;
  symbol: string | null;
  events: MarketEvent[];
};

const PRIMARY_EVENT_PRIORITY: Record<EventType, number> = {
  DATA_QUALITY: 0,
  ESTIMATED_PRICE: 1,
  DIP_DETECTED: 2,
  MOMENTUM_BUILDING: 3,
  PRICE_MOVEMENT: 4,
};

const EVENT_SUMMARIES: Record<EventType, string> = {
  DATA_QUALITY: 'Pause because data quality needs review before any action framing.',
  ESTIMATED_PRICE: 'Wait for confirmed pricing before framing a trading action.',
  DIP_DETECTED: 'Accumulation setup is supported by a detected dip in price action.',
  MOMENTUM_BUILDING: 'Accumulation setup is supported by confirmed momentum building.',
  PRICE_MOVEMENT: 'Hold for now while price movement is monitored without a clearer setup.',
};

function createScopeKey(event: MarketEvent): string {
  return [event.accountId, event.strategyId, event.symbol ?? 'account'].join(':');
}

function sortEvents(events: ReadonlyArray<MarketEvent>): MarketEvent[] {
  return [...events].sort((left, right) => {
    const timestampDiff = right.timestamp - left.timestamp;
    if (timestampDiff !== 0) {
      return timestampDiff;
    }

    return left.eventId.localeCompare(right.eventId);
  });
}

function groupEvents(events: ReadonlyArray<MarketEvent>): ScopedEvents[] {
  const groups = new Map<string, ScopedEvents>();

  events.forEach((event) => {
    const key = createScopeKey(event);
    const existing = groups.get(key);

    if (existing) {
      existing.events.push(event);
      return;
    }

    groups.set(key, {
      accountId: event.accountId,
      strategyId: event.strategyId,
      symbol: event.symbol,
      events: [event],
    });
  });

  return [...groups.values()]
    .map((group) => ({
      ...group,
      events: sortEvents(group.events),
    }))
    .sort((left, right) => {
      const accountDiff = left.accountId.localeCompare(right.accountId);
      if (accountDiff !== 0) {
        return accountDiff;
      }

      const strategyDiff = left.strategyId.localeCompare(right.strategyId);
      if (strategyDiff !== 0) {
        return strategyDiff;
      }

      return (left.symbol ?? '').localeCompare(right.symbol ?? '');
    });
}

function selectPrimaryEvent(events: ReadonlyArray<MarketEvent>): MarketEvent | null {
  if (events.length === 0) {
    return null;
  }

  return [...events].sort((left, right) => {
    const priorityDiff =
      PRIMARY_EVENT_PRIORITY[left.eventType] - PRIMARY_EVENT_PRIORITY[right.eventType];
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const timestampDiff = right.timestamp - left.timestamp;
    if (timestampDiff !== 0) {
      return timestampDiff;
    }

    return left.eventId.localeCompare(right.eventId);
  })[0];
}

function hasEventType(events: ReadonlyArray<MarketEvent>, eventType: EventType): boolean {
  return events.some((event) => event.eventType === eventType);
}

function resolveIntentType(events: ReadonlyArray<MarketEvent>): ProtectionPlanIntentType {
  if (hasEventType(events, 'DATA_QUALITY') || hasEventType(events, 'ESTIMATED_PRICE')) {
    return 'WAIT';
  }

  if (hasEventType(events, 'DIP_DETECTED') && hasEventType(events, 'MOMENTUM_BUILDING')) {
    return 'HOLD';
  }

  if (hasEventType(events, 'DIP_DETECTED') || hasEventType(events, 'MOMENTUM_BUILDING')) {
    return 'ACCUMULATE';
  }

  if (hasEventType(events, 'PRICE_MOVEMENT')) {
    return 'HOLD';
  }

  return 'WAIT';
}

function resolveRiskAlignment(
  events: ReadonlyArray<MarketEvent>,
  orientationContext: OrientationContext,
): ProtectionPlanRiskAlignment {
  if (events.some((event) => event.alignmentState === 'NEEDS_REVIEW')) {
    return 'MISALIGNED';
  }

  if (events.some((event) => event.alignmentState === 'WATCHFUL')) {
    return 'NEUTRAL';
  }

  const latestRelevantEvent = orientationContext.currentState.latestRelevantEvent;
  if (latestRelevantEvent && 'alignmentState' in latestRelevantEvent) {
    if (latestRelevantEvent.alignmentState === 'NEEDS_REVIEW') {
      return 'MISALIGNED';
    }

    if (latestRelevantEvent.alignmentState === 'WATCHFUL') {
      return 'NEUTRAL';
    }
  }

  return 'ALIGNED';
}

function resolveRiskCertainty(
  intentType: ProtectionPlanIntentType,
  alignment: ProtectionPlanRiskAlignment,
  events: ReadonlyArray<MarketEvent>,
): ProtectionPlanRiskCertainty {
  if (
    intentType === 'WAIT' ||
    events.some((event) => event.certainty === 'estimated') ||
    alignment === 'MISALIGNED'
  ) {
    return 'LOW';
  }

  if (intentType === 'HOLD' || alignment === 'NEUTRAL') {
    return 'MEDIUM';
  }

  if (events.some((event) => event.eventType === 'MOMENTUM_BUILDING')) {
    return 'HIGH';
  }

  return 'MEDIUM';
}

function resolveConstraints(
  intentType: ProtectionPlanIntentType,
  riskCertainty: ProtectionPlanRiskCertainty,
): ProtectionPlan['constraints'] {
  if (intentType === 'WAIT') {
    return {
      cooldownActive: true,
    };
  }

  if (intentType === 'ACCUMULATE' && riskCertainty !== 'LOW') {
    return {
      maxPositionSize: riskCertainty === 'HIGH' ? 0.1 : 0.05,
    };
  }

  return {};
}

function createSummary(
  intentType: ProtectionPlanIntentType,
  primaryEvent: MarketEvent | null,
  symbol: string | null,
): string {
  const baseSummary = primaryEvent
    ? EVENT_SUMMARIES[primaryEvent.eventType]
    : 'Wait until a clearer market event is available.';

  if (!symbol) {
    return baseSummary;
  }

  switch (intentType) {
    case 'ACCUMULATE':
      return `${baseSummary} Focus symbol: ${symbol}.`;
    case 'HOLD':
      return `${baseSummary} Keep ${symbol} in view without escalating action.`;
    case 'WAIT':
      return `${baseSummary} Do not frame an action for ${symbol} yet.`;
    case 'REDUCE':
      return `${baseSummary} Use caution before reducing ${symbol}.`;
    default:
      return baseSummary;
  }
}

function createPlanId(params: {
  accountId: string;
  strategyId: string;
  symbol: string | null;
  intentType: ProtectionPlanIntentType;
  primaryEventId: string | null;
}): string {
  return [
    params.accountId,
    params.strategyId,
    params.symbol ?? 'account',
    params.intentType,
    params.primaryEventId ?? 'no-event',
  ].join(':');
}

export function createProtectionPlans(params: {
  orientationContext: OrientationContext;
  marketEvents: ReadonlyArray<MarketEvent>;
}): ProtectionPlan[] {
  const groupedEvents = groupEvents(params.marketEvents);

  return groupedEvents.map((group) => {
    const primaryEvent = selectPrimaryEvent(group.events);
    const intentType = resolveIntentType(group.events);
    const alignment = resolveRiskAlignment(group.events, params.orientationContext);
    const certainty = resolveRiskCertainty(intentType, alignment, group.events);
    const supportingEventIds = [...group.events]
      .sort((left, right) => left.eventId.localeCompare(right.eventId))
      .map((event) => event.eventId);
    const createdAt = primaryEvent?.timestamp ?? 0;

    return {
      planId: createPlanId({
        accountId: group.accountId,
        strategyId: group.strategyId,
        symbol: group.symbol,
        intentType,
        primaryEventId: primaryEvent?.eventId ?? null,
      }),
      accountId: group.accountId,
      strategyId: group.strategyId,
      symbol: group.symbol,
      intentType,
      rationale: {
        primaryEventId: primaryEvent?.eventId ?? null,
        supportingEventIds,
        summary: createSummary(intentType, primaryEvent, group.symbol),
      },
      riskProfile: {
        certainty,
        alignment,
      },
      constraints: resolveConstraints(intentType, certainty),
      createdAt,
    };
  });
}
