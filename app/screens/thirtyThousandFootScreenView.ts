import type { StrategyFitState, ThirtyThousandFootVM } from '@/services/context/types';

export type ThirtyThousandFootScreenViewData = {
  title: string;
  summary: string;
  generatedAtText: string | null;
  availabilityMessage: string | null;
  contextTitle: string | null;
  contextSummary: string | null;
  fitLabel: string;
  fitStateText: string;
  fitSummary: string;
  details: ReadonlyArray<string>;
};

function formatGeneratedAt(timestamp: string | null): string | null {
  if (!timestamp || timestamp.length < 16) {
    return timestamp;
  }

  return `${timestamp.slice(0, 10)} ${timestamp.slice(11, 16)} UTC`;
}

function formatAvailabilityMessage(
  reason: Extract<ThirtyThousandFootVM['availability'], { status: 'UNAVAILABLE' }>['reason'],
): string {
  switch (reason) {
    case 'NOT_ENABLED_FOR_SURFACE':
      return 'This broader context view is not enabled on this surface.';
    case 'NO_MEANINGFUL_CONTEXT':
      return 'There is no broader context note worth surfacing right now.';
    default:
      return 'There is not enough interpreted context yet to prepare a broader read.';
  }
}

function formatFitState(state: StrategyFitState): string {
  switch (state) {
    case 'FAVOURABLE':
      return 'Favourable';
    case 'MIXED':
      return 'Mixed';
    case 'UNFAVOURABLE':
      return 'Unfavourable';
    default:
      return 'Unknown';
  }
}

export function createThirtyThousandFootScreenViewData(
  vm: ThirtyThousandFootVM | null,
): ThirtyThousandFootScreenViewData | null {
  if (!vm) {
    return null;
  }

  if (vm.availability.status === 'UNAVAILABLE') {
    return {
      title: '30,000 ft view',
      summary:
        'A broader context note that stays calm, descriptive, and optional.',
      generatedAtText: formatGeneratedAt(vm.generatedAt),
      availabilityMessage: formatAvailabilityMessage(vm.availability.reason),
      contextTitle: null,
      contextSummary: null,
      fitLabel: 'Strategy fit',
      fitStateText: formatFitState(vm.fit.state),
      fitSummary: vm.fit.summary,
      details: [],
    };
  }

  return {
    title: '30,000 ft view',
    summary: 'A broader context note that stays calm, descriptive, and optional.',
    generatedAtText: formatGeneratedAt(vm.generatedAt),
    availabilityMessage: null,
    contextTitle: vm.availability.title,
    contextSummary: vm.availability.summary,
    fitLabel: 'Strategy fit',
    fitStateText: formatFitState(vm.fit.state),
    fitSummary: vm.fit.summary,
    details: vm.availability.details,
  };
}
