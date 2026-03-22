import type { EventType } from '@/core/types/marketEvent';

import type { DashboardItem, DashboardModel } from '@/services/dashboard/types';

const EXPLICIT_EVENT_TYPE_PRIORITY: Record<EventType, number> = {
  DATA_QUALITY: 0,
  ESTIMATED_PRICE: 1,
  MOMENTUM_BUILDING: 2,
  DIP_DETECTED: 3,
  PRICE_MOVEMENT: 4,
};

function trendPriority(item: DashboardItem): number {
  switch (item.trendDirection) {
    case 'strengthening':
    case 'weakening':
      return 0;
    default:
      return 1;
  }
}

function certaintyPriority(item: DashboardItem): number {
  return item.certainty === 'confirmed' ? 0 : 1;
}

function eventTypePriority(item: DashboardItem): number {
  return EXPLICIT_EVENT_TYPE_PRIORITY[item.eventType];
}

function alignmentPriority(item: DashboardItem): number {
  switch (item.alignmentState) {
    case 'NEEDS_REVIEW':
      return 0;
    case 'WATCHFUL':
      return 1;
    case 'ALIGNED':
      return 2;
    default:
      return 3;
  }
}

function compareText(left?: string, right?: string): number {
  return (left ?? '').localeCompare(right ?? '');
}

export function compareDashboardItems(left: DashboardItem, right: DashboardItem): number {
  const timestampDiff = right.timestamp - left.timestamp;
  if (timestampDiff !== 0) {
    return timestampDiff;
  }

  const trendDiff = trendPriority(left) - trendPriority(right);
  if (trendDiff !== 0) {
    return trendDiff;
  }

  const certaintyDiff = certaintyPriority(left) - certaintyPriority(right);
  if (certaintyDiff !== 0) {
    return certaintyDiff;
  }

  const eventTypeDiff = eventTypePriority(left) - eventTypePriority(right);
  if (eventTypeDiff !== 0) {
    return eventTypeDiff;
  }

  const alignmentDiff = alignmentPriority(left) - alignmentPriority(right);
  if (alignmentDiff !== 0) {
    return alignmentDiff;
  }

  return (
    compareText(left.symbol, right.symbol) ||
    compareText(left.accountId, right.accountId) ||
    compareText(left.strategyId, right.strategyId)
  );
}

export function classifyDashboardItem(item: DashboardItem): keyof DashboardModel {
  if (item.trendDirection !== 'neutral' && item.certainty === 'confirmed') {
    return 'prime';
  }

  if (
    item.trendDirection !== 'neutral' ||
    item.certainty === 'confirmed' ||
    item.eventType !== 'PRICE_MOVEMENT'
  ) {
    return 'secondary';
  }

  return 'background';
}

export function prioritiseDashboardEvents(items: DashboardItem[]): DashboardModel {
  return items
    .slice()
    .sort(compareDashboardItems)
    .reduce<DashboardModel>(
      (model, item) => {
        model[classifyDashboardItem(item)].push(item);
        return model;
      },
      {
        prime: [],
        secondary: [],
        background: [],
      },
    );
}
