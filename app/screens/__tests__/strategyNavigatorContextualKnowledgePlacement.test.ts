import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('strategy navigator contextual knowledge placement', () => {
  it('keeps contextual knowledge selection in services and rollout narrow in this phase', () => {
    const strategyNavigatorScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'StrategyNavigatorScreen.tsx'),
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

    expect(strategyNavigatorScreenSource).toMatch(/fetchContextualKnowledgeAvailability/);
    expect(strategyNavigatorScreenSource).toMatch(/ContextualKnowledgeCard/);
    expect(strategyNavigatorScreenSource).toMatch(/fetchKnowledgeTopicDetailVM/);
    expect(strategyNavigatorScreenSource).toMatch(/KnowledgeTopicScreen/);
    expect(strategyNavigatorScreenSource).not.toMatch(
      /knowledgeCatalog|createContextualKnowledgeAvailability|docs\/knowledge|canonicalPath|recommendation engine|raw markdown|required reading|complete to continue/i,
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
