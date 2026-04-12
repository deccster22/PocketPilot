import { createContextualKnowledgeAvailability } from '@/services/knowledge/createContextualKnowledgeAvailability';
import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';
import type { TradeHubSurfaceModel } from '@/services/trade/types';

function createTradeHubSurface(): TradeHubSurfaceModel {
  return {
    primaryPlan: {
      actionState: 'READY',
      certainty: 'LOW',
      alignment: 'MISALIGNED',
    },
    alternativePlans: [],
    riskLane: {
      preparedRiskLane: {
        basisAvailability: {
          status: 'AVAILABLE',
        },
      },
      positionSizingAvailability: {
        status: 'AVAILABLE',
      },
        guardrailEvaluationAvailability: {
          status: 'AVAILABLE',
        },
      },
    meta: {
      hasPrimaryPlan: true,
      profile: 'BEGINNER',
      requiresConfirmation: true,
    },
  } as unknown as TradeHubSurfaceModel;
}

describe('createContextualKnowledgeAvailability', () => {
  it('returns a small ordered set of strategy-preview candidates from interpreted strategy context', () => {
    const result = createContextualKnowledgeAvailability({
      nodes: knowledgeCatalog,
      input: {
        surface: 'STRATEGY_PREVIEW',
        strategyIds: ['dip_buying'],
        scenarioId: 'DIP_VOLATILITY',
      },
    });

    expect(result).toEqual({
      status: 'AVAILABLE',
      surface: 'STRATEGY_PREVIEW',
      items: [
        {
          topicId: 'strategy-buy-the-dip',
          title: 'Buy the Dip',
          reason:
            'This selected lens is focused on pullbacks, stabilisation, and whether weakness still fits the broader picture.',
        },
        {
          topicId: 'pp-estimated-vs-confirmed-context',
          title: 'Estimated vs Confirmed Context',
          reason:
            'This scenario is intentionally unsettled, so certainty boundaries matter before the move itself.',
        },
        {
          topicId: 'pp-what-strategy-preview-strategy-navigator-is-for',
          title: 'What Strategy Preview / Strategy Navigator Is For',
          reason:
            'This surface is an exploratory bridge between learning and commitment, so the preview explainer is the cleanest baseline context.',
        },
      ],
    });
  });

  it('builds contextual Trade Hub candidates from prepared Trade Hub context', () => {
    const result = createContextualKnowledgeAvailability({
      nodes: knowledgeCatalog,
      input: {
        surface: 'TRADE_HUB',
        tradeHubSurface: createTradeHubSurface(),
      },
    });

    expect(result).toMatchObject({
      status: 'AVAILABLE',
      surface: 'TRADE_HUB',
    });

    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected Trade Hub contextual knowledge to be available.');
    }

    expect(result.items).toHaveLength(3);
    expect(result.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          topicId: 'pp-risk-reward-basics',
        }),
        expect.objectContaining({
          topicId: 'pp-what-protection-plans-are-for',
        }),
        expect.objectContaining({
          topicId: 'pp-estimated-vs-confirmed-context',
        }),
      ]),
    );
  });

  it('returns honest unavailable when a supported surface still has too little interpreted context', () => {
    expect(
      createContextualKnowledgeAvailability({
        nodes: knowledgeCatalog,
        input: {
          surface: 'DASHBOARD',
        },
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'INSUFFICIENT_INTERPRETED_CONTEXT',
    });
  });

  it('keeps unsupported surfaces explicit instead of forcing contextual rollout early', () => {
    expect(
      createContextualKnowledgeAvailability({
        nodes: knowledgeCatalog,
        input: {
          surface: 'SNAPSHOT',
          eventTypes: ['ESTIMATED_PRICE'],
        },
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
  });

  it('returns NO_RELEVANT_TOPIC honestly when the canonical tree lacks matching topics', () => {
    const nodes = knowledgeCatalog.filter(
      (node) =>
        ![
          'strategy-buy-the-dip',
          'pp-estimated-vs-confirmed-context',
          'pp-what-strategy-preview-strategy-navigator-is-for',
        ].includes(node.topicId),
    );

    expect(
      createContextualKnowledgeAvailability({
        nodes,
        input: {
          surface: 'STRATEGY_PREVIEW',
          strategyIds: ['dip_buying'],
          scenarioId: 'DIP_VOLATILITY',
        },
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_RELEVANT_TOPIC',
    });
  });

  it('keeps raw docs paths and source metadata out of the prepared availability contract', () => {
    const result = createContextualKnowledgeAvailability({
      nodes: knowledgeCatalog,
      input: {
        surface: 'STRATEGY_PREVIEW',
        strategyIds: ['mean_reversion'],
        scenarioId: 'MIXED_REVERSAL',
      },
    });

    expect(JSON.stringify(result)).not.toMatch(
      /docs\/knowledge|canonicalPath|README\.md|CONTENT_REGISTER|markdown|sourcePath/i,
    );
  });

  it('stays deterministic for identical inputs', () => {
    const params = {
      nodes: knowledgeCatalog,
      input: {
        surface: 'INSIGHTS' as const,
        insights: {
          hasHistory: true,
          hasArchive: true,
          hasReflection: false,
          hasNewItems: true,
        },
      },
    };

    expect(createContextualKnowledgeAvailability(params)).toEqual(
      createContextualKnowledgeAvailability(params),
    );
  });
});
