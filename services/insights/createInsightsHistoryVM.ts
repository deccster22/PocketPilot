import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type { OrientationContext } from '@/services/orientation/createOrientationContext';

import {
  countSectionItems,
  createEventHistorySection,
  createInsightsStorySections,
} from './historyInterpretation';
import type { EventHistorySection, InsightsHistoryVM } from './types';

const MAX_ITEMS_PER_SECTION = 3;
const MIN_INTERPRETED_ENTRY_COUNT = 2;

export function createInsightsHistoryVM(params: {
  generatedAt: string | null;
  history: ReadonlyArray<EventLedgerEntry>;
  orientationContext?: Pick<OrientationContext, 'historyContext'> | null;
}): InsightsHistoryVM {
  const sections = createInsightsStorySections({
    history: params.history,
    orientationContext: params.orientationContext,
  })
    .map((section) =>
      createEventHistorySection({
        id: section.id,
        title: section.title,
        groups: section.groups,
        limit: MAX_ITEMS_PER_SECTION,
      }),
    )
    .filter((section): section is EventHistorySection => Boolean(section));

  if (sections.length === 0) {
    return {
      generatedAt: params.generatedAt,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_EVENT_HISTORY',
      },
    };
  }

  if (countSectionItems(sections) < MIN_INTERPRETED_ENTRY_COUNT) {
    return {
      generatedAt: params.generatedAt,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'INSUFFICIENT_INTERPRETED_HISTORY',
      },
    };
  }

  return {
    generatedAt: params.generatedAt,
    availability: {
      status: 'AVAILABLE',
      sections,
    },
  };
}
