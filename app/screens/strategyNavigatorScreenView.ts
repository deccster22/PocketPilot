import type {
  StrategyNavigatorVM,
  StrategyPreviewScenarioId,
} from '@/services/strategyNavigator/types';

export type StrategyNavigatorStrategyOptionViewData = {
  strategyId: string;
  title: string;
  summary: string;
  archetypeText: string;
  selected: boolean;
};

export type StrategyNavigatorScenarioOptionViewData = {
  scenarioId: StrategyPreviewScenarioId;
  title: string;
  summary: string;
  selected: boolean;
};

export type StrategyPreviewCardViewData = {
  strategyTitle: string;
  scenarioTitle: string;
  scenarioSummary: string;
  snapshotHeadline: string;
  dashboardFocus: ReadonlyArray<string>;
  eventHighlights: ReadonlyArray<string>;
  alertPosture: string;
};

export type StrategyNavigatorScreenViewData = {
  title: string;
  summary: string;
  guidanceText: string;
  generatedAtText: string | null;
  availabilityMessage: string | null;
  strategyOptions: ReadonlyArray<StrategyNavigatorStrategyOptionViewData>;
  scenarioOptions: ReadonlyArray<StrategyNavigatorScenarioOptionViewData>;
  preview: StrategyPreviewCardViewData | null;
};

function formatGeneratedAt(timestamp: string | null): string | null {
  if (!timestamp || timestamp.length < 16) {
    return timestamp;
  }

  return `${timestamp.slice(0, 10)} ${timestamp.slice(11, 16)} UTC`;
}

function formatArchetype(archetype: StrategyNavigatorVM['strategyOptions'][number]['archetype']): string {
  switch (archetype) {
    case 'BEGINNER':
      return 'Beginner';
    case 'MIDDLE':
      return 'Middle';
    default:
      return 'Advanced';
  }
}

function formatAvailabilityMessage(
  reason: Extract<StrategyNavigatorVM['availability'], { status: 'UNAVAILABLE' }>['reason'],
): string {
  switch (reason) {
    case 'NOT_ENABLED_FOR_SURFACE':
      return 'Strategy Preview is not enabled on this surface.';
    case 'NO_SCENARIO_AVAILABLE':
      return 'Choose one scenario to prepare a simulated walkthrough.';
    default:
      return 'Choose one strategy to see how PocketPilot would frame the simulated scenario.';
  }
}

export function createStrategyNavigatorScreenViewData(
  vm: StrategyNavigatorVM | null,
): StrategyNavigatorScreenViewData | null {
  if (!vm) {
    return null;
  }

  const availability = vm.availability;
  const strategyOptions = vm.strategyOptions.map((strategy) => ({
    strategyId: strategy.strategyId,
    title: strategy.title,
    summary: strategy.summary,
    archetypeText: formatArchetype(strategy.archetype),
    selected: strategy.strategyId === vm.selectedStrategyId,
  }));
  const scenarioOptions = vm.scenarios.map((scenario) => ({
    scenarioId: scenario.scenarioId,
    title: scenario.title,
    summary: scenario.summary,
    selected: scenario.scenarioId === vm.selectedScenarioId,
  }));

  if (availability.status === 'UNAVAILABLE') {
    return {
      title: vm.title,
      summary: vm.summary,
      guidanceText:
        'This mode stays simulated, descriptive, and exploratory. It does not open an execution path.',
      generatedAtText: formatGeneratedAt(vm.generatedAt),
      availabilityMessage: formatAvailabilityMessage(availability.reason),
      strategyOptions,
      scenarioOptions,
      preview: null,
    };
  }

  const selectedStrategy = strategyOptions.find((strategy) => strategy.strategyId === availability.strategyId);

  return {
    title: vm.title,
    summary: vm.summary,
    guidanceText:
      'This mode stays simulated, descriptive, and exploratory. It does not open an execution path.',
      generatedAtText: formatGeneratedAt(vm.generatedAt),
      availabilityMessage: null,
      strategyOptions,
      scenarioOptions,
      preview: {
        strategyTitle: selectedStrategy?.title ?? 'Selected strategy',
        scenarioTitle: availability.scenario.title,
        scenarioSummary: availability.scenario.summary,
        snapshotHeadline: availability.focus.snapshotHeadline,
        dashboardFocus: availability.focus.dashboardFocus,
        eventHighlights: availability.focus.eventHighlights,
        alertPosture: availability.focus.alertPosture,
      },
    };
}
