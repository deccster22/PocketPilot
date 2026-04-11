import { createStrategyPreviewExplanation } from '@/services/strategyNavigator/createStrategyPreviewExplanation';

describe('createStrategyPreviewExplanation', () => {
  it('builds one calm preview explanation from the selected strategy, scenario, and prepared focus', () => {
    expect(
      createStrategyPreviewExplanation({
        surface: 'STRATEGY_NAVIGATOR',
        strategy: {
          id: 'trend_following',
          name: 'Trend Following',
        },
        scenario: {
          scenarioId: 'MIXED_REVERSAL',
          title: 'Mixed reversal attempt',
          summary:
            'A prior move starts to unwind, but the picture is still divided rather than cleanly flipped into a new regime.',
        },
        focus: {
          snapshotHeadline:
            'Snapshot would describe a possible turn by testing whether the prior trend is weakening or simply pausing.',
          dashboardFocus: [
            'The Dashboard would compare names still holding the old trend against names where structure is starting to flip.',
          ],
          eventHighlights: [
            'Price-movement events would matter when repeated reversals begin to challenge the prior direction.',
            'Momentum-building events would matter only if the new direction starts showing repeated support.',
          ],
          alertPosture:
            'Alerts would describe the reversal attempt as a structural test rather than a completed change of state.',
        },
      }),
    ).toEqual({
      status: 'AVAILABLE',
      content: {
        title: 'Why Trend Following reacts this way',
        summary:
          'Trend Following reads the move through the larger directional structure when a prior move is unwinding but the read is still mixed. This keeps the simulated read focused on interpretation priorities rather than outcomes.',
        bullets: [
          'What it is noticing: Snapshot would describe a possible turn by testing whether the prior trend is weakening or simply pausing.',
          'Why that matters: This lens cares about whether the broader direction is still holding together, not just whether one move is loud.',
          'Relevant interpreted MarketEvents: Price-movement events would matter when repeated reversals begin to challenge the prior direction. Momentum-building events would matter only if the new direction starts showing repeated support.',
        ],
      },
    });
  });

  it('returns unavailable honestly when explanation inputs are incomplete', () => {
    expect(
      createStrategyPreviewExplanation({
        surface: 'STRATEGY_NAVIGATOR',
        strategy: {
          id: 'mean_reversion',
          name: 'Mean Reversion',
        },
        scenario: {
          scenarioId: 'RANGE_COMPRESSION',
          title: 'Range compression',
          summary:
            'Price movement tightens and activity quiets down, leaving the next move unresolved instead of obvious.',
        },
        focus: null,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_EXPLANATION_AVAILABLE',
    });
  });

  it('returns unavailable when the surface is not enabled for this explanation seam', () => {
    expect(
      createStrategyPreviewExplanation({
        surface: 'DASHBOARD',
        strategy: {
          id: 'data_quality',
          name: 'Data Quality',
        },
        scenario: {
          scenarioId: 'DIP_VOLATILITY',
          title: 'Dip with expanding volatility',
          summary:
            'A quick drop lands alongside wider price swings, so the move looks less settled than a routine pullback.',
        },
        focus: {
          snapshotHeadline:
            'Snapshot would talk about unsettled certainty first, because a volatile dip can look louder than the underlying read deserves.',
          dashboardFocus: [
            'Estimated-price and coverage caveats would stay near the top of the Dashboard before directional interpretation widened.',
          ],
          eventHighlights: [
            'Estimated-price events would matter because they explain why the move may still read as provisional.',
          ],
          alertPosture:
            'Alerts would stay restrained and mostly frame certainty limits before framing the move itself.',
        },
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
  });

  it('keeps explanation copy descriptive and free of execution, prediction, and runtime leakage', () => {
    const result = createStrategyPreviewExplanation({
      surface: 'STRATEGY_NAVIGATOR',
      strategy: {
        id: 'fib_levels',
        name: 'Fibonacci Levels',
      },
      scenario: {
        scenarioId: 'TREND_CONTINUATION',
        title: 'Trend continuation',
        summary:
          'An existing move keeps extending in the same direction, with enough order to ask whether the backdrop is still supporting it.',
      },
      focus: {
        snapshotHeadline:
          'Snapshot would read the continuation by asking whether price is stepping through levels cleanly or running ahead of its structure.',
        dashboardFocus: [
          'The Dashboard would keep attention on level-by-level progression rather than on the headline move alone.',
        ],
        eventHighlights: [
          'Momentum-building events would matter as context when level progression still looks orderly.',
          'Price-movement events would matter when price starts clustering around a specific reference area.',
        ],
        alertPosture:
          'Alerts would stay calm and would mostly note whether price is still respecting the next structural reference.',
      },
    });

    expect(result.status).toBe('AVAILABLE');
    expect(JSON.stringify(result)).not.toMatch(
      /execute|execution|broker|profit|forecast|prediction|guarantee|urgent|act now/i,
    );
    expect(JSON.stringify(result)).not.toMatch(
      /eventId|signalsTriggered|signalCode|providerId|metadata|runtime|accountId|confidenceScore|canonicalPath|markdown/i,
    );
  });

  it('stays deterministic for identical inputs', () => {
    const params = {
      surface: 'STRATEGY_NAVIGATOR' as const,
      strategy: {
        id: 'dip_buying' as const,
        name: 'Dip Buying',
      },
      scenario: {
        scenarioId: 'DIP_VOLATILITY' as const,
        title: 'Dip with expanding volatility',
        summary:
          'A quick drop lands alongside wider price swings, so the move looks less settled than a routine pullback.',
      },
      focus: {
        snapshotHeadline:
          'Snapshot would treat this as a dip worth watching, but only once the drop starts to settle into something interpretable.',
        dashboardFocus: [
          'The Dashboard would look for orderly weakness and early stabilisation instead of chase-the-drop framing.',
        ],
        eventHighlights: [
          'Dip-detected events would matter most when they are followed by calmer price movement.',
          'Estimated-price events would matter if the backdrop is still too noisy to trust the read.',
        ],
        alertPosture:
          'Alerts would feel patient and would describe the dip as something to monitor rather than something to chase.',
      },
    };

    expect(createStrategyPreviewExplanation(params)).toEqual(createStrategyPreviewExplanation(params));
  });
});
