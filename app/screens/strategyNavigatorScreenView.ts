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

export type StrategyPreviewMainSectionViewData = {
  sectionId: 'DASHBOARD_FOCUS' | 'EVENT_HIGHLIGHTS' | 'ALERT_POSTURE';
  label: string;
  body: string | null;
  items: ReadonlyArray<string>;
};

export type StrategyPreviewSupportingSectionViewData = {
  sectionId: 'EXPLANATION' | 'CONTRAST';
  label: string;
  title: string;
  summary: string;
  bullets: ReadonlyArray<string>;
};

export type StrategyPreviewKnowledgeSectionViewData = {
  title: string;
  summary: string;
  items: ReadonlyArray<{
    topicId: string;
    title: string;
    reason: string;
  }>;
};

export type StrategyPreviewCardViewData = {
  strategyTitle: string;
  scenarioTitle: string;
  scenarioSummary: string;
  focus: {
    label: string;
    headline: string;
  };
  mainSections: ReadonlyArray<StrategyPreviewMainSectionViewData>;
  supportingSections: ReadonlyArray<StrategyPreviewSupportingSectionViewData>;
  knowledgeSection: StrategyPreviewKnowledgeSectionViewData | null;
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

function createPreviewMainSections(
  focus: Extract<StrategyNavigatorVM['availability'], { status: 'AVAILABLE' }>['focus'],
): StrategyPreviewCardViewData['mainSections'] {
  const sections: StrategyPreviewMainSectionViewData[] = [
    {
      sectionId: 'DASHBOARD_FOCUS',
      label: 'Dashboard shift',
      body: null,
      items: focus.dashboardFocus,
    },
    {
      sectionId: 'EVENT_HIGHLIGHTS',
      label: 'Market events that would matter',
      body: null,
      items: focus.eventHighlights,
    },
    {
      sectionId: 'ALERT_POSTURE',
      label: 'Alert posture',
      body: focus.alertPosture,
      items: [],
    },
  ];

  return sections.filter((section) => section.items.length > 0 || section.body);
}

function createPreviewSupportingSections(params: {
  explanation: StrategyPreviewCardViewData['supportingSections'][number] | null;
  contrast: StrategyPreviewCardViewData['supportingSections'][number] | null;
}): StrategyPreviewCardViewData['supportingSections'] {
  return [params.explanation, params.contrast].filter(
    (section): section is StrategyPreviewCardViewData['supportingSections'][number] => section !== null,
  );
}

function createPreviewKnowledgeSection(
  knowledgeItems: ReadonlyArray<{
    topicId: string;
    title: string;
    reason: string;
  }>,
): StrategyPreviewCardViewData['knowledgeSection'] {
  if (knowledgeItems.length === 0) {
    return null;
  }

  return {
    title: 'Helpful next reading',
    summary: 'Optional if you want a little more context without leaving the simulated lane.',
    items: knowledgeItems,
  };
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
  const contrast = vm.contrast.status === 'AVAILABLE' ? vm.contrast.content : null;
  const explanation = vm.explanation.status === 'AVAILABLE' ? vm.explanation.content : null;
  const knowledgeItems =
    vm.knowledgeFollowThrough?.status === 'AVAILABLE' ? vm.knowledgeFollowThrough.items : [];

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
      focus: {
        label: 'Main preview focus',
        headline: availability.focus.snapshotHeadline,
      },
      mainSections: createPreviewMainSections(availability.focus),
      supportingSections: createPreviewSupportingSections({
        explanation: explanation
          ? {
              sectionId: 'EXPLANATION',
              label: 'Why this strategy cares here',
              title: explanation.title,
              summary: explanation.summary,
              bullets: explanation.bullets,
            }
          : null,
        contrast: contrast
          ? {
              sectionId: 'CONTRAST',
              label: 'Scenario contrast',
              title: contrast.title,
              summary: contrast.summary,
              bullets: contrast.bullets,
            }
          : null,
      }),
      knowledgeSection: createPreviewKnowledgeSection(knowledgeItems),
    },
  };
}
