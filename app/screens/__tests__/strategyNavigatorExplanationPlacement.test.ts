import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('strategy navigator explanation placement', () => {
  it('keeps preview explanation shaping in services and app rendering on prepared contracts only', () => {
    const strategyNavigatorScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'StrategyNavigatorScreen.tsx'),
      'utf8',
    );
    const strategyNavigatorScreenViewSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'strategyNavigatorScreenView.ts'),
      'utf8',
    );
    const strategyPreviewCardSource = readFileSync(
      join(process.cwd(), 'app', 'components', 'StrategyPreviewCard.tsx'),
      'utf8',
    );
    const createStrategyNavigatorVMSource = readFileSync(
      join(process.cwd(), 'services', 'strategyNavigator', 'createStrategyNavigatorVM.ts'),
      'utf8',
    );
    const createStrategyPreviewExplanationSource = readFileSync(
      join(process.cwd(), 'services', 'strategyNavigator', 'createStrategyPreviewExplanation.ts'),
      'utf8',
    );

    expect(strategyNavigatorScreenSource).toMatch(/fetchStrategyNavigatorVM/);
    expect(strategyNavigatorScreenSource).toMatch(/createStrategyNavigatorScreenViewData/);
    expect(strategyNavigatorScreenSource).not.toMatch(
      /createStrategyPreviewExplanation|createStrategyNavigatorVM|selectStrategyPreviewKnowledge|strategyPreviewScenarios|signalCode|signalsTriggered|providerId|metadata|runtime/,
    );
    expect(strategyNavigatorScreenViewSource).toMatch(/vm\.explanation\.status === 'AVAILABLE'/);
    expect(strategyNavigatorScreenViewSource).toMatch(/sectionId: 'EXPLANATION'/);
    expect(strategyPreviewCardSource).toMatch(/props\.preview\.supportingSections/);
    expect(strategyPreviewCardSource).not.toMatch(
      /createStrategyPreviewExplanation|fetchStrategyNavigatorVM|createStrategyNavigatorVM|signalCode|signalsTriggered|providerId|metadata|runtime/,
    );
    expect(createStrategyNavigatorVMSource).toMatch(/createStrategyPreviewExplanation/);
    expect(createStrategyNavigatorVMSource).toMatch(/explanation:/);
    expect(createStrategyPreviewExplanationSource).not.toMatch(
      /signalCode|signalsTriggered|providerId|metadata|runtime|accountId|broker|execute|dispatch|profit|forecast|prediction/i,
    );
  });
});
