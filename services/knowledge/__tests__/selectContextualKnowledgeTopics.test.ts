import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';
import {
  selectContextualKnowledgeTopics,
  type ContextualKnowledgeSelectionContext,
} from '@/services/knowledge/selectContextualKnowledgeTopics';

function createContext(
  overrides: Partial<ContextualKnowledgeSelectionContext> = {},
): ContextualKnowledgeSelectionContext {
  return {
    surface: 'DASHBOARD',
    strategyIds: [],
    eventTypes: [],
    signalCodes: [],
    messageKinds: [],
    scenarioId: null,
    tradeHub: null,
    insights: null,
    ...overrides,
  };
}

describe('selectContextualKnowledgeTopics', () => {
  it('ranks strategy-linked topics ahead of weaker generic surface context in mixed live context', () => {
    const result = selectContextualKnowledgeTopics({
      nodes: knowledgeCatalog,
      context: createContext({
        strategyIds: ['momentum_basics'],
        eventTypes: ['PRICE_MOVEMENT'],
        signalCodes: ['signal-breakout'],
        messageKinds: ['REFERRAL'],
      }),
    });

    expect(result.linkage).toEqual({
      selectedTopicIds: [
        'strategy-momentum-pulse',
        'strategy-breakout-watcher',
        'pp-what-a-marketevent-is',
      ],
      selectionReason: 'MIXED',
    });
    expect(result.items.map((item) => item.topicId)).toEqual([
      'strategy-momentum-pulse',
      'strategy-breakout-watcher',
      'pp-what-a-marketevent-is',
    ]);
    expect(result.items[0].reason).toEqual(expect.any(String));
  });

  it('returns an explicit empty linkage when the context is not yet meaningful', () => {
    const result = selectContextualKnowledgeTopics({
      nodes: knowledgeCatalog,
      context: createContext(),
    });

    expect(result).toEqual({
      linkage: {
        selectedTopicIds: [],
        selectionReason: 'SURFACE_CONTEXT',
      },
      items: [],
    });
  });

  it('stays deterministic for identical inputs', () => {
    const params = {
      nodes: knowledgeCatalog,
      context: createContext({
        surface: 'TRADE_HUB' as const,
        tradeHub: {
          primaryActionState: 'READY',
          primaryCertainty: 'LOW',
          primaryAlignment: 'MISALIGNED',
          hasPrimaryPlan: true,
          alternativePlanCount: 0,
          hasPreparedRiskBasis: true,
          hasPositionSizing: true,
          hasGuardrailEvaluation: true,
        },
        signalCodes: ['signal-price-move'],
      }),
    };

    expect(selectContextualKnowledgeTopics(params)).toEqual(
      selectContextualKnowledgeTopics(params),
    );
  });
});
