import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createStrategyNavigatorScreenViewData } from '@/app/screens/strategyNavigatorScreenView';

describe('createStrategyNavigatorScreenViewData', () => {
  it('reads the prepared Strategy Preview VM without deriving preview interpretation in app', () => {
    expect(
      createStrategyNavigatorScreenViewData({
        title: 'Strategy Preview',
        summary:
          'A calm walkthrough of how PocketPilot would shift its read under a simulated market picture.',
        generatedAt: '2026-04-05T00:00:00.000Z',
        selectedStrategyId: 'dip_buying',
        selectedScenarioId: 'DIP_VOLATILITY',
        strategyOptions: [
          {
            strategyId: 'data_quality',
            title: 'Data Quality',
            summary: 'Highlights when quote coverage may be incomplete or estimated.',
            archetype: 'BEGINNER',
          },
          {
            strategyId: 'dip_buying',
            title: 'Dip Buying',
            summary: 'Flags symbols down >=4% versus baseline for calm dip monitoring.',
            archetype: 'BEGINNER',
          },
        ],
        scenarios: [
          {
            scenarioId: 'DIP_VOLATILITY',
            title: 'Dip with expanding volatility',
            summary:
              'A quick drop lands alongside wider price swings, so the move looks less settled than a routine pullback.',
          },
        ],
        availability: {
          status: 'AVAILABLE',
          strategyId: 'dip_buying',
          scenario: {
            scenarioId: 'DIP_VOLATILITY',
            title: 'Dip with expanding volatility',
            summary:
              'A quick drop lands alongside wider price swings, so the move looks less settled than a routine pullback.',
          },
          focus: {
            snapshotHeadline:
              'Snapshot would treat this as a dip worth watching, but only once the drop starts to settle into something interpretable.',
            dashboardFocus: [
              'The Dashboard would look for orderly weakness and early stabilisation instead of chase-the-drop framing.',
              'Estimated or widening moves would keep the setup in a more cautious lane until the tape calms.',
            ],
            eventHighlights: [
              'Dip-detected events would matter most when they are followed by calmer price movement.',
              'Estimated-price events would matter if the backdrop is still too noisy to trust the read.',
            ],
            alertPosture:
              'Alerts would feel patient and would describe the dip as something to monitor rather than something to chase.',
          },
        },
      }),
    ).toEqual({
      title: 'Strategy Preview',
      summary:
        'A calm walkthrough of how PocketPilot would shift its read under a simulated market picture.',
      guidanceText:
        'This mode stays simulated, descriptive, and exploratory. It does not open an execution path.',
      generatedAtText: '2026-04-05 00:00 UTC',
      availabilityMessage: null,
      strategyOptions: [
        {
          strategyId: 'data_quality',
          title: 'Data Quality',
          summary: 'Highlights when quote coverage may be incomplete or estimated.',
          archetypeText: 'Beginner',
          selected: false,
        },
        {
          strategyId: 'dip_buying',
          title: 'Dip Buying',
          summary: 'Flags symbols down >=4% versus baseline for calm dip monitoring.',
          archetypeText: 'Beginner',
          selected: true,
        },
      ],
      scenarioOptions: [
        {
          scenarioId: 'DIP_VOLATILITY',
          title: 'Dip with expanding volatility',
          summary:
            'A quick drop lands alongside wider price swings, so the move looks less settled than a routine pullback.',
          selected: true,
        },
      ],
      preview: {
        strategyTitle: 'Dip Buying',
        scenarioTitle: 'Dip with expanding volatility',
        scenarioSummary:
          'A quick drop lands alongside wider price swings, so the move looks less settled than a routine pullback.',
        snapshotHeadline:
          'Snapshot would treat this as a dip worth watching, but only once the drop starts to settle into something interpretable.',
        dashboardFocus: [
          'The Dashboard would look for orderly weakness and early stabilisation instead of chase-the-drop framing.',
          'Estimated or widening moves would keep the setup in a more cautious lane until the tape calms.',
        ],
        eventHighlights: [
          'Dip-detected events would matter most when they are followed by calmer price movement.',
          'Estimated-price events would matter if the backdrop is still too noisy to trust the read.',
        ],
        alertPosture:
          'Alerts would feel patient and would describe the dip as something to monitor rather than something to chase.',
      },
    });
  });

  it('shows a minimal honest unavailable state when the preview inputs are incomplete', () => {
    expect(
      createStrategyNavigatorScreenViewData({
        title: 'Strategy Preview',
        summary:
          'A calm walkthrough of how PocketPilot would shift its read under a simulated market picture.',
        generatedAt: '2026-04-05T00:00:00.000Z',
        selectedStrategyId: null,
        selectedScenarioId: 'DIP_VOLATILITY',
        strategyOptions: [],
        scenarios: [
          {
            scenarioId: 'DIP_VOLATILITY',
            title: 'Dip with expanding volatility',
            summary:
              'A quick drop lands alongside wider price swings, so the move looks less settled than a routine pullback.',
          },
        ],
        availability: {
          status: 'UNAVAILABLE',
          reason: 'NO_STRATEGY_SELECTED',
        },
      }),
    ).toEqual({
      title: 'Strategy Preview',
      summary:
        'A calm walkthrough of how PocketPilot would shift its read under a simulated market picture.',
      guidanceText:
        'This mode stays simulated, descriptive, and exploratory. It does not open an execution path.',
      generatedAtText: '2026-04-05 00:00 UTC',
      availabilityMessage:
        'Choose one strategy to see how PocketPilot would frame the simulated scenario.',
      strategyOptions: [],
      scenarioOptions: [
        {
          scenarioId: 'DIP_VOLATILITY',
          title: 'Dip with expanding volatility',
          summary:
            'A quick drop lands alongside wider price swings, so the move looks less settled than a routine pullback.',
          selected: true,
        },
      ],
      preview: null,
    });
  });

  it('keeps the screen helper on the prepared Strategy Preview VM only', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'strategyNavigatorScreenView.ts'),
      'utf8',
    );

    expect(source).toMatch(/availability\.status === 'UNAVAILABLE'/);
    expect(source).toMatch(/vm\.strategyOptions\.map/);
    expect(source).not.toMatch(
      /createStrategyNavigatorVM|fetchStrategyNavigatorVM|listCatalog|strategyPreviewScenarios|signalCode|signalsTriggered|providerId|metadata|runtime|\border\b|\bbroker\b/,
    );
  });

  it('returns null when the prepared Strategy Preview VM is unavailable', () => {
    expect(createStrategyNavigatorScreenViewData(null)).toBeNull();
  });
});
