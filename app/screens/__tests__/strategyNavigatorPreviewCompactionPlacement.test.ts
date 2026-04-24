import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('strategy navigator preview compaction placement', () => {
  it('keeps compaction inside app rendering without expanding preview logic or pressure language', () => {
    const strategyNavigatorScreenViewSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'strategyNavigatorScreenView.ts'),
      'utf8',
    );
    const strategyPreviewCardSource = readFileSync(
      join(process.cwd(), 'app', 'components', 'StrategyPreviewCard.tsx'),
      'utf8',
    );

    expect(strategyNavigatorScreenViewSource).toMatch(/createPreviewMainSections/);
    expect(strategyNavigatorScreenViewSource).toMatch(/createPreviewSupportingSections/);
    expect(strategyNavigatorScreenViewSource).toMatch(/createPreviewKnowledgeSection/);
    expect(strategyNavigatorScreenViewSource).toMatch(/label: 'Main preview focus'/);
    expect(strategyNavigatorScreenViewSource).toMatch(/title: 'Helpful next reading'/);
    expect(strategyNavigatorScreenViewSource).not.toMatch(
      /createStrategyNavigatorVM|fetchStrategyNavigatorVM|signalCode|signalsTriggered|providerId|metadata|runtime|execute|dispatch|broker|profit|forecast|prediction/i,
    );

    expect(strategyPreviewCardSource).toMatch(/props\.preview\.mainSections/);
    expect(strategyPreviewCardSource).toMatch(/props\.preview\.supportingSections/);
    expect(strategyPreviewCardSource).toMatch(/props\.preview\.knowledgeSection/);
    expect(strategyPreviewCardSource).toMatch(/createCollapsedSupportingBullets/);
    expect(strategyPreviewCardSource).toMatch(/useState\(false\)/);
    expect(strategyPreviewCardSource).toMatch(/Show more preview detail/);
    expect(strategyPreviewCardSource).toMatch(/Show more context/);
    expect(strategyPreviewCardSource).toMatch(/Show more reading/);
    expect(strategyPreviewCardSource).toMatch(/AMBIGUITY_PREFIX = 'Ambiguity remains:'/);
    expect(strategyPreviewCardSource).toMatch(/onOpenKnowledgeTopic\?\.\(item\.topicId\)/);
    expect(strategyPreviewCardSource).toMatch(/Supporting context/);
    expect(strategyPreviewCardSource).not.toMatch(
      /trade now|act now|best setup|strategy battle|prediction|forecast|profit|execute|dispatch|broker|top 10|leaderboard|winner/i,
    );
  });
});
