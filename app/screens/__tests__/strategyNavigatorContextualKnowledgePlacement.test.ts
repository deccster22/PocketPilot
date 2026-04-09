import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('strategy navigator knowledge follow-through placement', () => {
  it('keeps preview knowledge selection in strategyNavigator services and rollout narrow in this phase', () => {
    const strategyNavigatorScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'StrategyNavigatorScreen.tsx'),
      'utf8',
    );
    const fetchStrategyNavigatorVMSource = readFileSync(
      join(process.cwd(), 'services', 'strategyNavigator', 'fetchStrategyNavigatorVM.ts'),
      'utf8',
    );
    const createStrategyNavigatorVMSource = readFileSync(
      join(process.cwd(), 'services', 'strategyNavigator', 'createStrategyNavigatorVM.ts'),
      'utf8',
    );
    const selectStrategyPreviewKnowledgeSource = readFileSync(
      join(process.cwd(), 'services', 'strategyNavigator', 'selectStrategyPreviewKnowledge.ts'),
      'utf8',
    );
    const dashboardScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'DashboardScreen.tsx'),
      'utf8',
    );
    const snapshotScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'SnapshotScreen.tsx'),
      'utf8',
    );
    const insightsScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'InsightsScreen.tsx'),
      'utf8',
    );
    const tradeHubScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'TradeHubScreen.tsx'),
      'utf8',
    );

    expect(strategyNavigatorScreenSource).toMatch(/fetchStrategyNavigatorVM/);
    expect(strategyNavigatorScreenSource).toMatch(/StrategyPreviewCard/);
    expect(strategyNavigatorScreenSource).toMatch(/fetchKnowledgeTopicDetailVM/);
    expect(strategyNavigatorScreenSource).toMatch(/KnowledgeTopicScreen/);
    expect(strategyNavigatorScreenSource).not.toMatch(
      /fetchContextualKnowledgeAvailability|ContextualKnowledgeCard|knowledgeCatalog|createContextualKnowledgeAvailability/,
    );
    expect(fetchStrategyNavigatorVMSource).toMatch(/knowledgeCatalog/);
    expect(fetchStrategyNavigatorVMSource).toMatch(/knowledgeNodes/);
    expect(createStrategyNavigatorVMSource).toMatch(/knowledgeFollowThrough/);
    expect(createStrategyNavigatorVMSource).toMatch(/selectStrategyPreviewKnowledge/);
    expect(selectStrategyPreviewKnowledgeSource).toMatch(/StrategyPreviewKnowledgeFollowThrough/);
    expect(selectStrategyPreviewKnowledgeSource).not.toMatch(
      /docs\/knowledge|README\.md|markdown browser|recommendation engine|complete to continue|required reading/i,
    );
    expect(strategyNavigatorScreenSource).not.toMatch(
      /docs\/knowledge|canonicalPath|recommendation engine|raw markdown|required reading|complete to continue/i,
    );
    expect(dashboardScreenSource).not.toMatch(
      /fetchContextualKnowledgeAvailability|ContextualKnowledgeCard|fetchKnowledgeTopicDetailVM/,
    );
    expect(snapshotScreenSource).not.toMatch(
      /fetchContextualKnowledgeAvailability|ContextualKnowledgeCard|fetchKnowledgeTopicDetailVM/,
    );
    expect(insightsScreenSource).not.toMatch(
      /fetchContextualKnowledgeAvailability|ContextualKnowledgeCard|fetchKnowledgeTopicDetailVM/,
    );
    expect(tradeHubScreenSource).not.toMatch(
      /fetchContextualKnowledgeAvailability|ContextualKnowledgeCard|fetchKnowledgeTopicDetailVM/,
    );
  });
});
