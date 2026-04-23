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
        explanation: {
          status: 'AVAILABLE',
          content: {
            title: 'Why Dip Buying reacts this way',
            summary:
              'Dip Buying watches for weakness that is starting to settle into a calmer pullback when the market is dropping while volatility is expanding. This keeps the simulated read focused on interpretation priorities rather than outcomes.',
            bullets: [
              'What it is noticing: Snapshot would treat this as a dip worth watching, but only once the drop starts to settle into something interpretable.',
              'Why that matters: This lens cares about whether pressure is becoming more interpretable, because a messy drop is different from a steadier dip-watch setup.',
              'Relevant interpreted MarketEvents: Dip-detected events would matter most when they are followed by calmer price movement. Estimated-price events would matter if the backdrop is still too noisy to trust the read.',
            ],
          },
        },
        contrast: {
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
        },
        fitContrast: {
          status: 'AVAILABLE',
          contrast: {
            bestFitStrategyId: 'dip_buying',
            bestFitLabel: 'Dip Buying',
            whyItFits: [
              'Current simulated backdrop: volatility is expanding, structure is pullback under strain, and the condition is less settled than a routine dip.',
              'Dip Buying fits this context better because it keeps attention on whether weakness is stabilizing into a calmer pullback while the pullback is still stressed and trying to settle.',
              'Current prepared emphasis: The Dashboard would look for orderly weakness and early stabilisation instead of chase-the-drop framing.',
            ],
            lessSuitableAlternatives: [
              {
                strategyId: 'mean_reversion',
                label: 'Mean Reversion',
                lines: [
                  'Mean Reversion is less suitable right now because it leans on stretch-versus-baseline context and whether pressure is easing, while the dip still carries expansion stress.',
                  'In this lane, Dip Buying stays the steadier interpretation-first fit while context keeps evolving.',
                ],
              },
              {
                strategyId: 'trend_following',
                label: 'Trend Following',
                lines: [
                  'Trend Following is less suitable right now because it leans on whether the broader directional structure is still holding, while the dip still carries expansion stress.',
                  'In this lane, Dip Buying stays the steadier interpretation-first fit while context keeps evolving.',
                ],
              },
            ],
            ambiguityNote:
              'Ambiguity remains: expanding volatility can keep this dip read provisional until conditions settle.',
          },
        },
        knowledgeFollowThrough: {
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
        focus: {
          label: 'Main preview focus',
          headline:
            'Snapshot would treat this as a dip worth watching, but only once the drop starts to settle into something interpretable.',
        },
        mainSections: [
          {
            sectionId: 'DASHBOARD_FOCUS',
            label: 'Dashboard shift',
            body: null,
            items: [
              'The Dashboard would look for orderly weakness and early stabilisation instead of chase-the-drop framing.',
              'Estimated or widening moves would keep the setup in a more cautious lane until the tape calms.',
            ],
          },
          {
            sectionId: 'EVENT_HIGHLIGHTS',
            label: 'Market events that would matter',
            body: null,
            items: [
              'Dip-detected events would matter most when they are followed by calmer price movement.',
              'Estimated-price events would matter if the backdrop is still too noisy to trust the read.',
            ],
          },
          {
            sectionId: 'ALERT_POSTURE',
            label: 'Alert posture',
            body:
              'Alerts would feel patient and would describe the dip as something to monitor rather than something to chase.',
            items: [],
          },
        ],
        supportingSections: [
          {
            sectionId: 'EXPLANATION',
            label: 'Why this strategy cares here',
            title: 'Why Dip Buying reacts this way',
            summary:
              'Dip Buying watches for weakness that is starting to settle into a calmer pullback when the market is dropping while volatility is expanding. This keeps the simulated read focused on interpretation priorities rather than outcomes.',
            bullets: [
              'What it is noticing: Snapshot would treat this as a dip worth watching, but only once the drop starts to settle into something interpretable.',
              'Why that matters: This lens cares about whether pressure is becoming more interpretable, because a messy drop is different from a steadier dip-watch setup.',
              'Relevant interpreted MarketEvents: Dip-detected events would matter most when they are followed by calmer price movement. Estimated-price events would matter if the backdrop is still too noisy to trust the read.',
            ],
          },
          {
            sectionId: 'FIT_CONTRAST',
            label: 'Why this, not that',
            title: 'Dip Buying in this context',
            summary:
              'Current simulated backdrop: volatility is expanding, structure is pullback under strain, and the condition is less settled than a routine dip.',
            bullets: [
              'Dip Buying fits this context better because it keeps attention on whether weakness is stabilizing into a calmer pullback while the pullback is still stressed and trying to settle.',
              'Current prepared emphasis: The Dashboard would look for orderly weakness and early stabilisation instead of chase-the-drop framing.',
              'Mean Reversion is less suitable right now because it leans on stretch-versus-baseline context and whether pressure is easing, while the dip still carries expansion stress.',
              'In this lane, Dip Buying stays the steadier interpretation-first fit while context keeps evolving.',
              'Trend Following is less suitable right now because it leans on whether the broader directional structure is still holding, while the dip still carries expansion stress.',
              'In this lane, Dip Buying stays the steadier interpretation-first fit while context keeps evolving.',
              'Ambiguity remains: expanding volatility can keep this dip read provisional until conditions settle.',
            ],
          },
          {
            sectionId: 'CONTRAST',
            label: 'Scenario contrast',
            title: 'What changes in this scenario',
            summary:
              'Compared with a calmer pullback, Dip Buying leans more toward whether weakness is settling into a calmer pullback because volatility is expanding, structure is pullback under strain, and the condition is less settled than a routine dip.',
            bullets: [
              'More attention here: Dip-detected events would matter most when they are followed by calmer price movement.',
              'Less central here: clean continuation language or quick rebound framing, because the backdrop is still stressed rather than settled.',
              'Preview expression: The Dashboard would look for orderly weakness and early stabilisation instead of chase-the-drop framing.',
            ],
          },
        ],
        knowledgeSection: {
          title: 'Helpful next reading',
          summary: 'Optional if you want a little more context without leaving the simulated lane.',
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
        },
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
        explanation: {
          status: 'UNAVAILABLE',
          reason: 'NO_EXPLANATION_AVAILABLE',
        },
        contrast: {
          status: 'UNAVAILABLE',
          reason: 'NO_CONTRAST_AVAILABLE',
        },
        fitContrast: {
          status: 'UNAVAILABLE',
          reason: 'NO_COMPARABLE_CONTEXT',
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

  it('keeps knowledge follow-through optional when services mark it unavailable', () => {
    const result = createStrategyNavigatorScreenViewData({
      title: 'Strategy Preview',
      summary: 'A calm walkthrough of how PocketPilot would shift its read under a simulated market picture.',
      generatedAt: '2026-04-05T00:00:00.000Z',
      selectedStrategyId: 'trend_following',
      selectedScenarioId: 'TREND_CONTINUATION',
      strategyOptions: [
        {
          strategyId: 'trend_following',
          title: 'Trend Follow',
          summary: 'Tracks whether directional structure is still holding together.',
          archetype: 'MIDDLE',
        },
      ],
      scenarios: [
        {
          scenarioId: 'TREND_CONTINUATION',
          title: 'Trend continuation',
          summary:
            'An existing move keeps extending in the same direction, with enough order to ask whether the backdrop is still supporting it.',
        },
      ],
      availability: {
        status: 'AVAILABLE',
        strategyId: 'trend_following',
        scenario: {
          scenarioId: 'TREND_CONTINUATION',
          title: 'Trend continuation',
          summary:
            'An existing move keeps extending in the same direction, with enough order to ask whether the backdrop is still supporting it.',
        },
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
      },
      explanation: {
        status: 'AVAILABLE',
        content: {
          title: 'Why Trend Follow reacts this way',
          summary:
            'Trend Follow reads the move through the larger directional structure when an existing move is still extending in an orderly way. This keeps the simulated read focused on interpretation priorities rather than outcomes.',
          bullets: [
            'What it is noticing: Snapshot would read this as a continuation first and would ask whether the broader structure is still carrying it cleanly.',
            'Why that matters: This lens cares about whether the broader direction is still holding together, not just whether one move is loud.',
            'Relevant interpreted MarketEvents: Momentum-building events would matter when they reinforce an already established directional picture.',
          ],
        },
      },
      contrast: {
        status: 'AVAILABLE',
        content: {
          title: 'What changes in this scenario',
          summary:
            'Compared with a more neutral or mixed backdrop, Trend Follow leans more toward whether the broader directional structure is still holding because volatility is contained, structure is directional and orderly, and the condition is more extended than a neutral pause.',
          bullets: [
            'More attention here: Momentum-building events would matter when they reinforce an already established directional picture.',
            'Less central here: oversold or reversal language, because the backdrop is still extending rather than resetting.',
            'Preview expression: The Dashboard would bring sustained directional names forward when follow-through remains orderly.',
          ],
        },
      },
      fitContrast: {
        status: 'UNAVAILABLE',
        reason: 'NO_COMPARABLE_CONTEXT',
      },
      knowledgeFollowThrough: {
        status: 'UNAVAILABLE',
        reason: 'KNOWLEDGE_UNAVAILABLE',
      },
    });

    expect(result?.preview?.knowledgeSection).toBeNull();
  });

  it('renders no explanation section when services return explanation unavailable', () => {
    const result = createStrategyNavigatorScreenViewData({
      title: 'Strategy Preview',
      summary: 'A calm walkthrough of how PocketPilot would shift its read under a simulated market picture.',
      generatedAt: '2026-04-05T00:00:00.000Z',
      selectedStrategyId: 'trend_following',
      selectedScenarioId: 'TREND_CONTINUATION',
      strategyOptions: [
        {
          strategyId: 'trend_following',
          title: 'Trend Follow',
          summary: 'Tracks whether directional structure is still holding together.',
          archetype: 'MIDDLE',
        },
      ],
      scenarios: [
        {
          scenarioId: 'TREND_CONTINUATION',
          title: 'Trend continuation',
          summary:
            'An existing move keeps extending in the same direction, with enough order to ask whether the backdrop is still supporting it.',
        },
      ],
      availability: {
        status: 'AVAILABLE',
        strategyId: 'trend_following',
        scenario: {
          scenarioId: 'TREND_CONTINUATION',
          title: 'Trend continuation',
          summary:
            'An existing move keeps extending in the same direction, with enough order to ask whether the backdrop is still supporting it.',
        },
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
      },
      explanation: {
        status: 'UNAVAILABLE',
        reason: 'NO_EXPLANATION_AVAILABLE',
      },
      contrast: {
        status: 'AVAILABLE',
        content: {
          title: 'What changes in this scenario',
          summary:
            'Compared with a more neutral or mixed backdrop, Trend Follow leans more toward whether the broader directional structure is still holding because volatility is contained, structure is directional and orderly, and the condition is more extended than a neutral pause.',
          bullets: [
            'More attention here: Momentum-building events would matter when they reinforce an already established directional picture.',
            'Less central here: oversold or reversal language, because the backdrop is still extending rather than resetting.',
            'Preview expression: The Dashboard would bring sustained directional names forward when follow-through remains orderly.',
          ],
        },
      },
      fitContrast: {
        status: 'UNAVAILABLE',
        reason: 'NO_COMPARABLE_CONTEXT',
      },
      knowledgeFollowThrough: {
        status: 'UNAVAILABLE',
        reason: 'KNOWLEDGE_UNAVAILABLE',
      },
    });

    expect(result?.preview?.supportingSections).toEqual([
      {
        sectionId: 'CONTRAST',
        label: 'Scenario contrast',
        title: 'What changes in this scenario',
        summary:
          'Compared with a more neutral or mixed backdrop, Trend Follow leans more toward whether the broader directional structure is still holding because volatility is contained, structure is directional and orderly, and the condition is more extended than a neutral pause.',
        bullets: [
          'More attention here: Momentum-building events would matter when they reinforce an already established directional picture.',
          'Less central here: oversold or reversal language, because the backdrop is still extending rather than resetting.',
          'Preview expression: The Dashboard would bring sustained directional names forward when follow-through remains orderly.',
        ],
      },
    ]);
  });

  it('renders no contrast section when services return contrast unavailable', () => {
    const result = createStrategyNavigatorScreenViewData({
      title: 'Strategy Preview',
      summary: 'A calm walkthrough of how PocketPilot would shift its read under a simulated market picture.',
      generatedAt: '2026-04-05T00:00:00.000Z',
      selectedStrategyId: 'trend_following',
      selectedScenarioId: 'TREND_CONTINUATION',
      strategyOptions: [
        {
          strategyId: 'trend_following',
          title: 'Trend Follow',
          summary: 'Tracks whether directional structure is still holding together.',
          archetype: 'MIDDLE',
        },
      ],
      scenarios: [
        {
          scenarioId: 'TREND_CONTINUATION',
          title: 'Trend continuation',
          summary:
            'An existing move keeps extending in the same direction, with enough order to ask whether the backdrop is still supporting it.',
        },
      ],
      availability: {
        status: 'AVAILABLE',
        strategyId: 'trend_following',
        scenario: {
          scenarioId: 'TREND_CONTINUATION',
          title: 'Trend continuation',
          summary:
            'An existing move keeps extending in the same direction, with enough order to ask whether the backdrop is still supporting it.',
        },
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
      },
      explanation: {
        status: 'AVAILABLE',
        content: {
          title: 'Why Trend Follow reacts this way',
          summary:
            'Trend Follow reads the move through the larger directional structure when an existing move is still extending in an orderly way. This keeps the simulated read focused on interpretation priorities rather than outcomes.',
          bullets: [
            'What it is noticing: Snapshot would read this as a continuation first and would ask whether the broader structure is still carrying it cleanly.',
            'Why that matters: This lens cares about whether the broader direction is still holding together, not just whether one move is loud.',
            'Relevant interpreted MarketEvents: Momentum-building events would matter when they reinforce an already established directional picture.',
          ],
        },
      },
      contrast: {
        status: 'UNAVAILABLE',
        reason: 'NO_CONTRAST_AVAILABLE',
      },
      fitContrast: {
        status: 'UNAVAILABLE',
        reason: 'NO_COMPARABLE_CONTEXT',
      },
      knowledgeFollowThrough: {
        status: 'UNAVAILABLE',
        reason: 'KNOWLEDGE_UNAVAILABLE',
      },
    });

    expect(result?.preview?.supportingSections).toEqual([
      {
        sectionId: 'EXPLANATION',
        label: 'Why this strategy cares here',
        title: 'Why Trend Follow reacts this way',
        summary:
          'Trend Follow reads the move through the larger directional structure when an existing move is still extending in an orderly way. This keeps the simulated read focused on interpretation priorities rather than outcomes.',
        bullets: [
          'What it is noticing: Snapshot would read this as a continuation first and would ask whether the broader structure is still carrying it cleanly.',
          'Why that matters: This lens cares about whether the broader direction is still holding together, not just whether one move is loud.',
          'Relevant interpreted MarketEvents: Momentum-building events would matter when they reinforce an already established directional picture.',
        ],
      },
    ]);
  });

  it('orders preview hierarchy as main focus first, supporting context second, and optional reading last', () => {
    const result = createStrategyNavigatorScreenViewData({
      title: 'Strategy Preview',
      summary: 'A calm walkthrough of how PocketPilot would shift its read under a simulated market picture.',
      generatedAt: '2026-04-05T00:00:00.000Z',
      selectedStrategyId: 'trend_following',
      selectedScenarioId: 'TREND_CONTINUATION',
      strategyOptions: [
        {
          strategyId: 'trend_following',
          title: 'Trend Follow',
          summary: 'Tracks whether directional structure is still holding together.',
          archetype: 'MIDDLE',
        },
      ],
      scenarios: [
        {
          scenarioId: 'TREND_CONTINUATION',
          title: 'Trend continuation',
          summary:
            'An existing move keeps extending in the same direction, with enough order to ask whether the backdrop is still supporting it.',
        },
      ],
      availability: {
        status: 'AVAILABLE',
        strategyId: 'trend_following',
        scenario: {
          scenarioId: 'TREND_CONTINUATION',
          title: 'Trend continuation',
          summary:
            'An existing move keeps extending in the same direction, with enough order to ask whether the backdrop is still supporting it.',
        },
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
      },
      explanation: {
        status: 'AVAILABLE',
        content: {
          title: 'Why Trend Follow reacts this way',
          summary:
            'Trend Follow reads the move through the larger directional structure when an existing move is still extending in an orderly way. This keeps the simulated read focused on interpretation priorities rather than outcomes.',
          bullets: [
            'What it is noticing: Snapshot would read this as a continuation first and would ask whether the broader structure is still carrying it cleanly.',
          ],
        },
      },
      contrast: {
        status: 'AVAILABLE',
        content: {
          title: 'What changes in this scenario',
          summary:
            'Compared with a more neutral or mixed backdrop, Trend Follow leans more toward whether the broader directional structure is still holding because volatility is contained, structure is directional and orderly, and the condition is more extended than a neutral pause.',
          bullets: [
            'More attention here: Momentum-building events would matter when they reinforce an already established directional picture.',
          ],
        },
      },
      fitContrast: {
        status: 'AVAILABLE',
        contrast: {
          bestFitStrategyId: 'trend_following',
          bestFitLabel: 'Trend Follow',
          whyItFits: [
            'Current simulated backdrop: volatility is contained, structure is directional and orderly, and the condition is more extended than a neutral pause.',
            'Trend Follow fits this context better because it keeps attention on whether broader directional structure is still holding while continuation remains orderly.',
          ],
          lessSuitableAlternatives: [
            {
              strategyId: 'momentum_basics',
              label: 'Momentum Basics',
              lines: [
                'Momentum Basics is less suitable right now because it leans on immediate pace language while this continuation already reads structurally mature.',
              ],
            },
          ],
          ambiguityNote: null,
        },
      },
      knowledgeFollowThrough: {
        status: 'AVAILABLE',
        items: [
          {
            topicId: 'strategy-trend-follow',
            title: 'Trend Follow',
            reason:
              'This preview stays focused on directional structure, so this topic is the clearest optional next read.',
          },
        ],
      },
    });

    expect(result?.preview?.focus.label).toBe('Main preview focus');
    expect(result?.preview?.mainSections.map((section) => section.sectionId)).toEqual([
      'DASHBOARD_FOCUS',
      'EVENT_HIGHLIGHTS',
      'ALERT_POSTURE',
    ]);
    expect(result?.preview?.supportingSections.map((section) => section.sectionId)).toEqual([
      'EXPLANATION',
      'FIT_CONTRAST',
      'CONTRAST',
    ]);
    expect(result?.preview?.knowledgeSection).toEqual({
      title: 'Helpful next reading',
      summary: 'Optional if you want a little more context without leaving the simulated lane.',
      items: [
        {
          topicId: 'strategy-trend-follow',
          title: 'Trend Follow',
          reason:
            'This preview stays focused on directional structure, so this topic is the clearest optional next read.',
        },
      ],
    });
  });

  it('keeps the screen helper on the prepared Strategy Preview VM only', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'strategyNavigatorScreenView.ts'),
      'utf8',
    );

    expect(source).toMatch(/availability\.status === 'UNAVAILABLE'/);
    expect(source).toMatch(/vm\.strategyOptions\.map/);
    expect(source).toMatch(/vm\.contrast\.status === 'AVAILABLE'/);
    expect(source).toMatch(/vm\.explanation\.status === 'AVAILABLE'/);
    expect(source).toMatch(/vm\.fitContrast\.status === 'AVAILABLE'/);
    expect(source).toMatch(/vm\.knowledgeFollowThrough\?\.status === 'AVAILABLE'/);
    expect(source).toMatch(/createPreviewMainSections/);
    expect(source).toMatch(/createPreviewFitContrastSection/);
    expect(source).toMatch(/sectionId: 'FIT_CONTRAST'/);
    expect(source).toMatch(/supportingSections/);
    expect(source).toMatch(/knowledgeSection/);
    expect(source).not.toMatch(
      /createStrategyNavigatorVM|fetchStrategyNavigatorVM|createStrategyFitContrast|createStrategyPreviewContrast|createStrategyPreviewExplanation|selectStrategyPreviewKnowledge|fetchContextualKnowledgeAvailability|knowledgeCatalog|listCatalog|strategyPreviewScenarios|signalCode|signalsTriggered|providerId|metadata|runtime|\border\b|\bbroker\b/,
    );
    expect(source).not.toMatch(/top 10|leaderboard|best strategy|winner|prediction score/i);
  });

  it('returns null when the prepared Strategy Preview VM is unavailable', () => {
    expect(createStrategyNavigatorScreenViewData(null)).toBeNull();
  });
});
