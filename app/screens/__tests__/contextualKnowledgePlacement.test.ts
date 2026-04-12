import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('contextual knowledge placement', () => {
  it('keeps density shaping in services and app rendering on prepared presentation only', () => {
    const contextualKnowledgeViewSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'contextualKnowledgeView.ts'),
      'utf8',
    );
    const contextualKnowledgeCardSource = readFileSync(
      join(process.cwd(), 'app', 'components', 'ContextualKnowledgeCard.tsx'),
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

    expect(contextualKnowledgeViewSource).toMatch(/shouldRenderShelf/);
    expect(contextualKnowledgeViewSource).toMatch(/maxVisibleTopics/);
    expect(contextualKnowledgeViewSource).toMatch(/presentation\.shouldRenderShelf/);
    expect(contextualKnowledgeViewSource).not.toMatch(
      /createContextualKnowledgeLane|fetchContextualKnowledgeAvailability|knowledgeCatalog|strategyIds|eventTypes|messageKinds|tradeHubSurface|dashboardSurface/,
    );
    expect(contextualKnowledgeCardSource).toMatch(/presentation\.emphasis/);
    expect(contextualKnowledgeCardSource).toMatch(/contextualKnowledge\.title/);
    expect(contextualKnowledgeCardSource).not.toMatch(
      /createContextualKnowledgeLane|fetchContextualKnowledgeAvailability|knowledgeCatalog|strategyIds|eventTypes|messageKinds|tradeHubSurface|dashboardSurface/,
    );
    expect(dashboardScreenSource).toMatch(/contextualKnowledge\s*=\s*\{screenView\.contextualKnowledge\}/);
    expect(tradeHubScreenSource).toMatch(/contextualKnowledge\s*=\s*\{screenView\.contextualKnowledge\}/);
    expect(dashboardScreenSource).not.toMatch(/knowledgeCatalog|createContextualKnowledgeLane|fetchContextualKnowledgeAvailability/);
    expect(tradeHubScreenSource).not.toMatch(/knowledgeCatalog|createContextualKnowledgeLane|fetchContextualKnowledgeAvailability/);
  });
});
