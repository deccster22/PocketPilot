import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('strategy navigator placement', () => {
  it('keeps Strategy Preview as one top-level simulated surface with service-owned shaping', () => {
    const appSource = readFileSync(join(process.cwd(), 'app', 'App.tsx'), 'utf8');
    const strategyNavigatorScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'StrategyNavigatorScreen.tsx'),
      'utf8',
    );
    const dashboardScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'DashboardScreen.tsx'),
      'utf8',
    );
    const tradeHubScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'TradeHubScreen.tsx'),
      'utf8',
    );
    const knowledgeLibraryScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'KnowledgeLibraryScreen.tsx'),
      'utf8',
    );

    expect(appSource).toMatch(/StrategyNavigatorScreen/);
    expect(appSource).toMatch(/Preview/);
    expect(appSource).toMatch(/activeTab/);
    expect(strategyNavigatorScreenSource).toMatch(/fetchStrategyNavigatorVM/);
    expect(strategyNavigatorScreenSource).toMatch(/createStrategyNavigatorScreenViewData/);
    expect(strategyNavigatorScreenSource).toMatch(/StrategyPreviewCard/);
    expect(strategyNavigatorScreenSource).toMatch(/fetchKnowledgeTopicDetailVM/);
    expect(strategyNavigatorScreenSource).not.toMatch(
      /createStrategyNavigatorVM|selectStrategyPreviewKnowledge|fetchContextualKnowledgeAvailability|ContextualKnowledgeCard|knowledgeCatalog|listCatalog|strategyPreviewScenarios|signalCode|signalsTriggered|providerId|metadata|runtime|\border\b|\bbroker\b/,
    );
    expect(dashboardScreenSource).not.toMatch(/StrategyPreviewCard|fetchStrategyNavigatorVM/);
    expect(tradeHubScreenSource).not.toMatch(/StrategyPreviewCard|fetchStrategyNavigatorVM/);
    expect(knowledgeLibraryScreenSource).not.toMatch(/StrategyPreviewCard|fetchStrategyNavigatorVM/);
  });
});
