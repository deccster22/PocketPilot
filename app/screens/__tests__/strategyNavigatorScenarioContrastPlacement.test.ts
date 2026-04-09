import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('strategy navigator scenario contrast placement', () => {
  it('keeps preview contrast shaping in services and app rendering on prepared contracts only', () => {
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
    const createStrategyPreviewContrastSource = readFileSync(
      join(process.cwd(), 'services', 'strategyNavigator', 'createStrategyPreviewContrast.ts'),
      'utf8',
    );

    expect(strategyNavigatorScreenSource).toMatch(/fetchStrategyNavigatorVM/);
    expect(strategyNavigatorScreenSource).toMatch(/createStrategyNavigatorScreenViewData/);
    expect(strategyNavigatorScreenSource).not.toMatch(
      /createStrategyPreviewContrast|createStrategyNavigatorVM|strategyPreviewScenarios|signalCode|signalsTriggered|providerId|metadata|runtime/,
    );
    expect(strategyNavigatorScreenViewSource).toMatch(/vm\.contrast\.status === 'AVAILABLE'/);
    expect(strategyPreviewCardSource).toMatch(/props\.preview\.contrast/);
    expect(strategyPreviewCardSource).not.toMatch(
      /createStrategyPreviewContrast|fetchStrategyNavigatorVM|createStrategyNavigatorVM|signalCode|signalsTriggered|providerId|metadata|runtime/,
    );
    expect(createStrategyNavigatorVMSource).toMatch(/createStrategyPreviewContrast/);
    expect(createStrategyNavigatorVMSource).toMatch(/contrast:/);
    expect(createStrategyPreviewContrastSource).not.toMatch(
      /signalCode|signalsTriggered|providerId|metadata|runtime|accountId|broker|execute|dispatch|profit|forecast|prediction/i,
    );
  });
});
