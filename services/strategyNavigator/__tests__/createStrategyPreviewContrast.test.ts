import { createStrategyPreviewContrast } from '@/services/strategyNavigator/createStrategyPreviewContrast';
import { listStrategyPreviewScenarios } from '@/services/strategyNavigator/strategyPreviewScenarios';

const DIP_VOLATILITY_SCENARIO = listStrategyPreviewScenarios()[0];

const DIP_FOCUS = {
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
} as const;

describe('createStrategyPreviewContrast', () => {
  it('builds one calm worldview-level contrast from prepared strategy and scenario context', () => {
    expect(
      createStrategyPreviewContrast({
        strategy: {
          id: 'dip_buying',
          name: 'Dip Buying',
        },
        scenario: DIP_VOLATILITY_SCENARIO,
        focus: DIP_FOCUS,
      }),
    ).toEqual({
      status: 'AVAILABLE',
      content: {
        title: 'What changes in this scenario',
        summary:
          'Compared with a calmer pullback, Dip Buying leans more toward whether weakness is settling into a calmer pullback because volatility is expanding, structure is pullback under strain, and the condition is less settled than a routine dip.',
        bullets: [
          'More attention here: Dip-detected events would matter most when they are followed by calmer price movement.',
          'Less central here: clean continuation language or quick rebound framing, because the backdrop is still stressed rather than settled.',
          'Preview expression: The Dashboard would look for orderly weakness and early stabilisation instead of chase-the-drop framing.',
        ],
      },
    });
  });

  it('returns unavailable honestly when contrast inputs are incomplete', () => {
    expect(
      createStrategyPreviewContrast({
        strategy: {
          id: 'dip_buying',
          name: 'Dip Buying',
        },
        scenario: {
          scenarioId: 'DIP_VOLATILITY',
          title: 'Dip with expanding volatility',
          summary:
            'A quick drop lands alongside wider price swings, so the move looks less settled than a routine pullback.',
        },
        focus: DIP_FOCUS,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_CONTRAST_AVAILABLE',
    });
  });

  it('returns unavailable on surfaces where Strategy Preview is not enabled', () => {
    expect(
      createStrategyPreviewContrast({
        surface: 'DASHBOARD',
        strategy: {
          id: 'dip_buying',
          name: 'Dip Buying',
        },
        scenario: DIP_VOLATILITY_SCENARIO,
        focus: DIP_FOCUS,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
  });

  it('keeps contrast copy descriptive and free of raw runtime or execution leakage', () => {
    const result = createStrategyPreviewContrast({
      strategy: {
        id: 'trend_following',
        name: 'Trend Follow',
      },
      scenario: listStrategyPreviewScenarios()[1],
      focus: {
        snapshotHeadline:
          'Snapshot would read this as a continuation first and would ask whether the broader structure is still carrying it cleanly.',
        dashboardFocus: [
          'The Dashboard would bring sustained directional names forward when follow-through remains orderly.',
        ],
        eventHighlights: [
          'Momentum-building events would matter when they reinforce an already established directional picture.',
        ],
        alertPosture:
          'Alerts would feel steady and would mostly describe whether the trend still has structure behind it.',
      },
    });

    expect(JSON.stringify(result)).not.toMatch(
      /buy|sell|execute|execution|dispatch|broker|profit|forecast|prediction|urgent|act now/i,
    );
    expect(JSON.stringify(result)).not.toMatch(
      /eventId|signalsTriggered|signalCode|providerId|metadata|runtime|accountId|confidenceScore/i,
    );
  });

  it('stays deterministic for identical inputs', () => {
    const params = {
      strategy: {
        id: 'mean_reversion' as const,
        name: 'Mean Reversion',
      },
      scenario: listStrategyPreviewScenarios()[2],
      focus: {
        snapshotHeadline:
          'Snapshot would see this as the cleanest mean-reversion setup of the four scenarios because the prior stretch is already trying to unwind.',
        dashboardFocus: [
          'The Dashboard would bring forward names where the reversal is easing a prior overshoot instead of simply creating fresh noise.',
        ],
        eventHighlights: [
          'Price-movement events would matter when they confirm the overshoot is beginning to ease.',
        ],
        alertPosture:
          'Alerts would describe the reversal as a baseline-rebalancing move when that read is supported, while still staying modest.',
      },
    };

    expect(createStrategyPreviewContrast(params)).toEqual(createStrategyPreviewContrast(params));
  });
});
