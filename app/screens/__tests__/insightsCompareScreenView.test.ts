import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createInsightsCompareScreenViewData } from '@/app/screens/insightsCompareScreenView';

describe('createInsightsCompareScreenViewData', () => {
  it('reads the prepared comparison VM without deriving compare items in app', () => {
    expect(
      createInsightsCompareScreenViewData(
        {
          generatedAt: '2026-05-15T00:00:00.000Z',
          availability: {
            status: 'AVAILABLE',
            window: 'LAST_QUARTER_VS_PREVIOUS_QUARTER',
            title: 'Q1 2026 compared with Q4 2025',
            summary:
              'Compared with Q4 2025, Q1 2026 leaned more on price shifts than on building momentum.',
            items: [
              {
                label: 'Most visible pattern',
                value:
                  'Q1 2026 leaned more on price shifts, while Q4 2025 leaned more on building momentum.',
                emphasis: 'SHIFT',
              },
              {
                label: 'Recurring symbol',
                value: 'BTC appeared more often in Q1 2026, while ETH appeared more often in Q4 2025.',
                emphasis: 'SHIFT',
              },
            ],
            limitations: [
              'At least one side of this comparison comes from a lighter stretch of interpreted history, so the read stays brief.',
            ],
          },
        },
        {
          selectedWindow: 'LAST_QUARTER_VS_PREVIOUS_QUARTER',
        },
      ),
    ).toEqual({
      title: 'Compare windows',
      summary:
        'A calm look at one bounded window beside the prior matching window. It stays descriptive, selective, and non-judgmental.',
      availabilityMessage: null,
      windowOptions: [
        {
          id: 'LAST_90_DAYS_VS_PREVIOUS_90_DAYS',
          label: 'Last 90 days',
          isSelected: false,
        },
        {
          id: 'LAST_QUARTER_VS_PREVIOUS_QUARTER',
          label: 'Last quarter',
          isSelected: true,
        },
        {
          id: 'LAST_YEAR_VS_PREVIOUS_YEAR',
          label: 'Last year',
          isSelected: false,
        },
        {
          id: 'BEFORE_STRATEGY_CHANGE_VS_AFTER_STRATEGY_CHANGE',
          label: 'Strategy change',
          isSelected: false,
        },
      ],
      comparisonTitle: 'Q1 2026 compared with Q4 2025',
      comparisonSummary:
        'Compared with Q4 2025, Q1 2026 leaned more on price shifts than on building momentum.',
      items: [
        {
          emphasisText: 'Change',
          label: 'Most visible pattern',
          value: 'Q1 2026 leaned more on price shifts, while Q4 2025 leaned more on building momentum.',
        },
        {
          emphasisText: 'Change',
          label: 'Recurring symbol',
          value: 'BTC appeared more often in Q1 2026, while ETH appeared more often in Q4 2025.',
        },
      ],
      limitations: [
        'At least one side of this comparison comes from a lighter stretch of interpreted history, so the read stays brief.',
      ],
    });
  });

  it('shows a minimal honest unavailable state when the selected compare window is not supported yet', () => {
    expect(
      createInsightsCompareScreenViewData(
        {
          generatedAt: '2026-05-15T00:00:00.000Z',
          availability: {
            status: 'UNAVAILABLE',
            reason: 'UNSUPPORTED_WINDOW',
          },
        },
        {
          selectedWindow: 'BEFORE_STRATEGY_CHANGE_VS_AFTER_STRATEGY_CHANGE',
        },
      ),
    ).toEqual({
      title: 'Compare windows',
      summary:
        'A calm look at one bounded window beside the prior matching window. It stays descriptive, selective, and non-judgmental.',
      availabilityMessage:
        'This window is not supported yet because the interpreted history spine does not record that boundary honestly.',
      windowOptions: [
        {
          id: 'LAST_90_DAYS_VS_PREVIOUS_90_DAYS',
          label: 'Last 90 days',
          isSelected: false,
        },
        {
          id: 'LAST_QUARTER_VS_PREVIOUS_QUARTER',
          label: 'Last quarter',
          isSelected: false,
        },
        {
          id: 'LAST_YEAR_VS_PREVIOUS_YEAR',
          label: 'Last year',
          isSelected: false,
        },
        {
          id: 'BEFORE_STRATEGY_CHANGE_VS_AFTER_STRATEGY_CHANGE',
          label: 'Strategy change',
          isSelected: true,
        },
      ],
      comparisonTitle: null,
      comparisonSummary: null,
      items: [],
      limitations: [],
    });
  });

  it('keeps the compare helper on the prepared comparison VM only', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'insightsCompareScreenView.ts'),
      'utf8',
    );

    expect(source).toMatch(/vm\.availability\.status === 'UNAVAILABLE'/);
    expect(source).toMatch(/selectedWindow/);
    expect(source).toMatch(/windowOptions/);
    expect(source).not.toMatch(
      /createComparisonWindowVM|fetchComparisonWindowVM|createInsightsHistoryVM|eventLedger|eventId|strategyId|signalsTriggered|providerId|metadata|score|unread|inbox|badge/,
    );
  });

  it('returns null when the prepared compare VM is unavailable', () => {
    expect(
      createInsightsCompareScreenViewData(null, {
        selectedWindow: 'LAST_90_DAYS_VS_PREVIOUS_90_DAYS',
      }),
    ).toBeNull();
  });
});
