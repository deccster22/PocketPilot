import type { DashboardSurfaceVM } from '@/services/dashboard/dashboardSurfaceService';
import type { DashboardItem } from '@/services/dashboard/types';
import type { ExplanationConfidence, ExplanationLineageItem } from '@/services/explanation/types';

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
  explanation:
    | {
        visible: false;
      }
    | {
        visible: true;
        title: string;
        summary: string;
        confidenceText: string;
        confidenceNote: string;
        lineage: ReadonlyArray<Pick<ExplanationLineageItem, 'label' | 'detail'>>;
        limitations: ReadonlyArray<string>;
      };
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

function formatConfidenceText(confidence: ExplanationConfidence): string {
  switch (confidence) {
    case 'HIGH':
      return 'Support: High';
    case 'MODERATE':
      return 'Support: Moderate';
    default:
      return 'Support: Low';
  }
}

export function createDashboardScreenViewData(
  surface: DashboardSurfaceVM | null,
): DashboardScreenViewData | null {
  if (!surface) {
    return null;
  }

  return {
    profileLabel: surface.model.meta.profile,
    primeZone: {
      title: 'Prime Zone',
      items: formatZoneItems(surface.model.primeZone.items),
    },
    secondaryZone: {
      title: 'Secondary Zone',
      items: formatZoneItems(surface.model.secondaryZone.items),
    },
    deepZone: {
      title: 'Deep Zone',
      items: formatZoneItems(surface.model.deepZone.items),
    },
    explanation:
      surface.explanation.status === 'AVAILABLE'
        ? {
            visible: true,
            title: surface.explanation.explanation.title,
            summary: surface.explanation.explanation.summary,
            confidenceText: formatConfidenceText(surface.explanation.explanation.confidence),
            confidenceNote: surface.explanation.explanation.confidenceNote,
            lineage: surface.explanation.explanation.lineage.map((item) => ({
              label: item.label,
              detail: item.detail,
            })),
            limitations: surface.explanation.explanation.limitations,
          }
        : {
            visible: false,
          },
  };
}
