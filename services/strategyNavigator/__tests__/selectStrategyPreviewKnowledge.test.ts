import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';
import { selectStrategyPreviewKnowledge } from '@/services/strategyNavigator/selectStrategyPreviewKnowledge';

describe('selectStrategyPreviewKnowledge', () => {
  it('returns one small deterministic follow-through set for a simulated preview', () => {
    const result = selectStrategyPreviewKnowledge({
      surface: 'STRATEGY_NAVIGATOR',
      strategyId: 'dip_buying',
      scenarioId: 'DIP_VOLATILITY',
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
      nodes: knowledgeCatalog,
    });

    expect(result).toEqual({
      status: 'AVAILABLE',
      items: [
        {
          topicId: 'strategy-buy-the-dip',
          title: 'Buy the Dip',
          reason:
            'This preview is about pullbacks and stabilisation, so this is the clearest strategy follow-through if you want more context.',
        },
        {
          topicId: 'pp-estimated-vs-confirmed-context',
          title: 'Estimated vs Confirmed Context',
          reason:
            'This simulated dip stays unsettled, so certainty boundaries matter before the move sounds cleaner than it is.',
        },
      ],
    });
  });

  it('returns unavailable honestly when this follow-through is not enabled for the surface', () => {
    expect(
      selectStrategyPreviewKnowledge({
        surface: 'DASHBOARD',
        strategyId: 'trend_following',
        scenarioId: 'TREND_CONTINUATION',
        focus: {
          snapshotHeadline: 'Snapshot would keep the broader structure in view.',
          dashboardFocus: ['The Dashboard would stay anchored to the broader backdrop.'],
          eventHighlights: ['Momentum-building events would matter when the trend stays orderly.'],
          alertPosture: 'Alerts would stay observational.',
        },
        nodes: knowledgeCatalog,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
  });

  it('returns unavailable honestly when knowledge inputs are missing', () => {
    expect(
      selectStrategyPreviewKnowledge({
        strategyId: 'mean_reversion',
        scenarioId: 'MIXED_REVERSAL',
        focus: {
          snapshotHeadline: 'Snapshot would describe a possible turn without overstating it.',
          dashboardFocus: ['The Dashboard would compare an unwind against the broader backdrop.'],
          eventHighlights: ['Price-movement events would matter when the unwind starts looking repeatable.'],
          alertPosture: 'Alerts would stay modest.',
        },
        nodes: null,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'KNOWLEDGE_UNAVAILABLE',
    });
  });

  it('returns unavailable honestly when no relevant knowledge topics exist in the supplied catalog', () => {
    const nodes = knowledgeCatalog.filter(
      (node) =>
        ![
          'strategy-trend-follow',
          'pp-what-market-regime-means',
          'pp-what-a-marketevent-is',
        ].includes(node.topicId),
    );

    expect(
      selectStrategyPreviewKnowledge({
        strategyId: 'trend_following',
        scenarioId: 'TREND_CONTINUATION',
        focus: {
          snapshotHeadline:
            'Snapshot would read this as a continuation first and would ask whether the broader structure is still carrying it cleanly.',
          dashboardFocus: [
            'The Dashboard would bring sustained directional names forward when follow-through remains orderly.',
          ],
          eventHighlights: [
            'Momentum-building events would matter when they reinforce an already established directional picture.',
          ],
          alertPosture: 'Alerts would mostly describe whether the trend still has structure behind it.',
        },
        nodes,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_RELEVANT_KNOWLEDGE',
    });
  });

  it('keeps prepared follow-through free of execution semantics, urgency, and raw docs paths', () => {
    const result = selectStrategyPreviewKnowledge({
      strategyId: 'fib_levels',
      scenarioId: 'RANGE_COMPRESSION',
      focus: {
        snapshotHeadline:
          'Snapshot would read the compression as a tightening zone and would ask which reference area is quietly taking shape.',
        dashboardFocus: [
          'The Dashboard would bring forward names where the range is tightening around a clear structural band.',
        ],
        eventHighlights: [
          'Price-movement events would matter when repeated touches keep defining the same zone.',
        ],
        alertPosture:
          'Alerts would stay sparse and would mostly note whether the range is organising around a meaningful level.',
      },
      nodes: knowledgeCatalog,
    });

    expect(JSON.stringify(result)).not.toMatch(
      /sell|execute|execution|dispatch|broker|profit|forecast|prediction|guarantee|urgent|act now|docs\/knowledge|README\.md|markdown|canonicalPath/i,
    );
  });

  it('stays deterministic for identical inputs', () => {
    const params = {
      strategyId: 'data_quality' as const,
      scenarioId: 'DIP_VOLATILITY' as const,
      focus: {
        snapshotHeadline:
          'Snapshot would describe certainty boundaries first before leaning into the move itself.',
        dashboardFocus: [
          'Estimated context would stay visible while the picture remains unsettled.',
        ],
        eventHighlights: [
          'Data-quality events would matter when quote freshness starts to thin out.',
        ],
        alertPosture:
          'Alerts would stay restrained and mostly frame certainty limits before framing the move itself.',
      },
      nodes: knowledgeCatalog,
    };

    expect(selectStrategyPreviewKnowledge(params)).toEqual(selectStrategyPreviewKnowledge(params));
  });
});
