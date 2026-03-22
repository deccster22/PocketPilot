import type { DashboardItem, DashboardSurfaceModel } from '@/services/dashboard/types';

export type DashboardScreenZoneItemViewData = {
  title: string;
  subtitle: string;
  certaintyText: string;
};

export type DashboardScreenZoneViewData = {
  title: string;
  items: DashboardScreenZoneItemViewData[];
};

export type DashboardScreenViewData = {
  profileLabel: string;
  primeZone: DashboardScreenZoneViewData;
  secondaryZone: DashboardScreenZoneViewData;
  deepZone: DashboardScreenZoneViewData;
};

function formatEventTypeLabel(item: DashboardItem): string {
  switch (item.eventType) {
    case 'DATA_QUALITY':
      return 'Data quality';
    case 'ESTIMATED_PRICE':
      return 'Estimated price';
    case 'MOMENTUM_BUILDING':
      return 'Momentum building';
    case 'DIP_DETECTED':
      return 'Dip detected';
    default:
      return 'Price movement';
  }
}

function formatTrendLabel(item: DashboardItem): string {
  switch (item.trendDirection) {
    case 'strengthening':
      return 'Strengthening';
    case 'weakening':
      return 'Weakening';
    default:
      return 'Neutral';
  }
}

function formatZoneItems(items: DashboardItem[]): DashboardScreenZoneItemViewData[] {
  return items.map((item) => ({
    title: item.symbol ? `${item.symbol} - ${formatEventTypeLabel(item)}` : formatEventTypeLabel(item),
    subtitle: [formatTrendLabel(item), item.alignmentState?.replace('_', ' ').toLowerCase()]
      .filter(Boolean)
      .join(' | '),
    certaintyText: item.certainty === 'estimated' ? 'Estimated' : 'Confirmed',
  }));
}

export function createDashboardScreenViewData(
  surface: DashboardSurfaceModel | null,
): DashboardScreenViewData | null {
  if (!surface) {
    return null;
  }

  return {
    profileLabel: surface.meta.profile,
    primeZone: {
      title: 'Prime Zone',
      items: formatZoneItems(surface.primeZone.items),
    },
    secondaryZone: {
      title: 'Secondary Zone',
      items: formatZoneItems(surface.secondaryZone.items),
    },
    deepZone: {
      title: 'Deep Zone',
      items: formatZoneItems(surface.deepZone.items),
    },
  };
}
