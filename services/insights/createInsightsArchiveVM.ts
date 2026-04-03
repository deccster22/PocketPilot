import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type { OrientationContext } from '@/services/orientation/createOrientationContext';

import {
  INSIGHTS_LAST_VIEWED_SECTION_ID,
  type InsightsArchiveSection,
  type InsightsArchiveVM,
  type InsightsContinuitySummary,
  type InsightsHistoryVM,
} from './types';
import {
  countSectionItems,
  createInsightsArchiveSection,
  createInsightsStorySections,
} from './historyInterpretation';

const MAX_ARCHIVE_ITEMS_PER_SECTION = 5;
const MIN_ARCHIVE_ENTRY_COUNT = 3;

function mapHistoryUnavailabilityReason(
  reason: Extract<InsightsHistoryVM['availability'], { status: 'UNAVAILABLE' }>['reason'],
): Extract<InsightsArchiveVM['availability'], { status: 'UNAVAILABLE' }>['reason'] {
  switch (reason) {
    case 'NOT_ENABLED_FOR_SURFACE':
      return 'NOT_ENABLED_FOR_SURFACE';
    case 'INSUFFICIENT_INTERPRETED_HISTORY':
      return 'INSUFFICIENT_INTERPRETED_HISTORY';
    default:
      return 'NO_ARCHIVE_HISTORY';
  }
}

function resolveSelectedSectionId(params: {
  sections: ReadonlyArray<InsightsArchiveSection>;
  selectedSectionId?: string | null;
  continuity?: InsightsContinuitySummary | null;
}): string | null {
  if (params.sections.length === 0) {
    return null;
  }

  if (
    params.selectedSectionId &&
    params.sections.some((section) => section.id === params.selectedSectionId)
  ) {
    return params.selectedSectionId;
  }

  if (
    params.continuity?.state === 'NEW_HISTORY_AVAILABLE' &&
    params.sections.some((section) => section.id === INSIGHTS_LAST_VIEWED_SECTION_ID)
  ) {
    return INSIGHTS_LAST_VIEWED_SECTION_ID;
  }

  return params.sections[0]?.id ?? null;
}

export function createInsightsArchiveVM(params: {
  generatedAt: string | null;
  history: ReadonlyArray<EventLedgerEntry>;
  historyVM?: InsightsHistoryVM | null;
  continuity?: InsightsContinuitySummary | null;
  orientationContext?: Pick<OrientationContext, 'historyContext'> | null;
  selectedSectionId?: string | null;
}): InsightsArchiveVM {
  if (params.historyVM?.availability.status === 'UNAVAILABLE') {
    return {
      generatedAt: params.generatedAt,
      availability: {
        status: 'UNAVAILABLE',
        reason: mapHistoryUnavailabilityReason(params.historyVM.availability.reason),
      },
      selectedSectionId: null,
    };
  }

  const sections = createInsightsStorySections({
    history: params.history,
    orientationContext: params.orientationContext,
  })
    .map((section) =>
      createInsightsArchiveSection({
        id: section.id,
        title: section.title,
        groups: section.groups,
        limit: MAX_ARCHIVE_ITEMS_PER_SECTION,
      }),
    )
    .filter((section): section is InsightsArchiveSection => Boolean(section));
  const itemCount = countSectionItems(sections);

  if (itemCount === 0) {
    return {
      generatedAt: params.generatedAt,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_ARCHIVE_HISTORY',
      },
      selectedSectionId: null,
    };
  }

  if (itemCount < MIN_ARCHIVE_ENTRY_COUNT) {
    return {
      generatedAt: params.generatedAt,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'INSUFFICIENT_INTERPRETED_HISTORY',
      },
      selectedSectionId: null,
    };
  }

  return {
    generatedAt: params.generatedAt,
    availability: {
      status: 'AVAILABLE',
      sections,
    },
    selectedSectionId: resolveSelectedSectionId({
      sections,
      selectedSectionId: params.selectedSectionId,
      continuity: params.continuity,
    }),
  };
}
