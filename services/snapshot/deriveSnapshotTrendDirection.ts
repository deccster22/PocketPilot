import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type { EventType } from '@/core/types/marketEvent';
import type { OrientationContext } from '@/services/orientation/createOrientationContext';

export type SnapshotTrendDirection = 'strengthening' | 'weakening' | 'neutral';

function normalizeAlignmentState(
  alignmentState?: string | null,
): 'aligned' | 'watchful' | 'needs_review' | null {
  if (alignmentState === null || alignmentState === undefined) {
    return null;
  }

  switch (alignmentState.trim().toLowerCase()) {
    case 'aligned':
      return 'aligned';
    case 'watchful':
      return 'watchful';
    case 'needs review':
    case 'needs_review':
      return 'needs_review';
    default:
      return null;
  }
}

function deriveTrendDirectionFromEventType(
  eventType: EventType,
): SnapshotTrendDirection | null {
  switch (eventType) {
    case 'MOMENTUM_BUILDING':
      return 'strengthening';
    case 'DATA_QUALITY':
    case 'ESTIMATED_PRICE':
      return 'weakening';
    case 'DIP_DETECTED':
    case 'PRICE_MOVEMENT':
      return 'neutral';
    default:
      return null;
  }
}

function isMarketEvent(
  event: EventLedgerEntry | OrientationContext['currentState']['latestRelevantEvent'],
): event is NonNullable<OrientationContext['currentState']['latestRelevantEvent']> & {
  eventType: EventType;
} {
  return Boolean(event && 'eventType' in event);
}

export function deriveSnapshotTrendDirection(
  orientationContext: Pick<OrientationContext, 'currentState'>,
): SnapshotTrendDirection {
  const latestRelevantEvent = orientationContext.currentState.latestRelevantEvent;

  if (isMarketEvent(latestRelevantEvent)) {
    const trendDirection = deriveTrendDirectionFromEventType(latestRelevantEvent.eventType);

    if (trendDirection !== null) {
      return trendDirection;
    }
  }

  const normalizedAlignment = normalizeAlignmentState(
    orientationContext.currentState.strategyAlignment,
  );

  if (normalizedAlignment === 'needs_review') {
    return 'weakening';
  }

  return 'neutral';
}
