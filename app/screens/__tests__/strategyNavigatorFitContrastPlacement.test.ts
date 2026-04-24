import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('strategy navigator fit-contrast placement', () => {
  it('keeps fit-contrast shaping in services and app rendering on prepared contracts only', () => {
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
    const createStrategyFitContrastSource = readFileSync(
      join(process.cwd(), 'services', 'strategyNavigator', 'createStrategyFitContrast.ts'),
      'utf8',
    );
    const selectNearbyAlternativeStrategiesSource = readFileSync(
      join(
        process.cwd(),
        'services',
        'strategyNavigator',
        'selectNearbyAlternativeStrategies.ts',
      ),
      'utf8',
    );

    expect(strategyNavigatorScreenSource).toMatch(/fetchStrategyNavigatorVM/);
    expect(strategyNavigatorScreenSource).toMatch(/createStrategyNavigatorScreenViewData/);
    expect(strategyNavigatorScreenSource).not.toMatch(
      /createStrategyFitContrast|selectNearbyAlternativeStrategies|createStrategyNavigatorVM|strategyPreviewScenarios|signalCode|signalsTriggered|providerId|metadata|runtime/,
    );

    expect(strategyNavigatorScreenViewSource).toMatch(/vm\.fitContrast\.status === 'AVAILABLE'/);
    expect(strategyNavigatorScreenViewSource).toMatch(/createPreviewFitContrastSection/);
    expect(strategyNavigatorScreenViewSource).toMatch(/sectionId: 'FIT_CONTRAST'/);
    expect(strategyNavigatorScreenViewSource).not.toMatch(
      /createStrategyFitContrast|selectNearbyAlternativeStrategies|fetchStrategyNavigatorVM|createStrategyNavigatorVM|signalCode|signalsTriggered|providerId|metadata|runtime|score|rank|leaderboard/,
    );
    expect(strategyPreviewCardSource).toMatch(/section\.items\.map\(\(item, index\)/);
    expect(strategyPreviewCardSource).toMatch(/section\.bullets\.map\(\(item, index\)/);
    expect(strategyPreviewCardSource).not.toMatch(/key=\{item\}/);
    expect(strategyPreviewCardSource).not.toMatch(/key=\{`?\$\{item\}`?\}/);

    expect(createStrategyNavigatorVMSource).toMatch(/createStrategyFitContrast/);
    expect(createStrategyNavigatorVMSource).toMatch(/selectNearbyAlternativeStrategies/);
    expect(createStrategyNavigatorVMSource).toMatch(/fitContrast:/);
    expect(createStrategyFitContrastSource).not.toMatch(
      /execute|execution|dispatch|broker|profit|forecast|prediction|trade now|top 10|leaderboard|winner/i,
    );
    expect(selectNearbyAlternativeStrategiesSource).not.toMatch(
      /execute|execution|dispatch|broker|profit|forecast|prediction|trade now|top 10|leaderboard|winner|confidenceScore/i,
    );
  });
});
