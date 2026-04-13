import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';
import { createContextualKnowledgeLane } from '@/services/knowledge/createContextualKnowledgeLane';
import { createContextualKnowledgePresentation } from '@/services/knowledge/createContextualKnowledgePresentation';
import type { ContextualKnowledgeAvailability } from '@/services/knowledge/types';
import type { TradeHubSurfaceModel } from '@/services/trade/types';

function createSparseTradeHubSurface(): TradeHubSurfaceModel {
  return {
    primaryPlan: {
      actionState: 'READY',
      certainty: 'HIGH',
      alignment: 'ALIGNED',
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

function createAvailableKnowledgeAvailability(params: {
  surface: 'DASHBOARD' | 'TRADE_HUB';
  itemCount: number;
}): ContextualKnowledgeAvailability {
  return {
    status: 'AVAILABLE',
    surface: params.surface,
    items: Array.from({ length: params.itemCount }, (_, index) => ({
      topicId: `topic-${index + 1}`,
      title: `Topic ${index + 1}`,
      reason: `Prepared reason ${index + 1}.`,
    })),
  };
}

describe('createContextualKnowledgePresentation', () => {
  it('keeps density and placement explicit for the live surfaces', () => {
    expect(
      createContextualKnowledgePresentation({
        profile: 'BEGINNER',
        surface: 'DASHBOARD',
        availability: createAvailableKnowledgeAvailability({
          surface: 'DASHBOARD',
          itemCount: 3,
        }),
      }),
    ).toEqual({
      maxVisibleTopics: 3,
      emphasis: 'STANDARD',
      shouldRenderShelf: true,
    });

    expect(
      createContextualKnowledgePresentation({
        profile: 'ADVANCED',
        surface: 'TRADE_HUB',
        availability: createAvailableKnowledgeAvailability({
          surface: 'TRADE_HUB',
          itemCount: 1,
        }),
      }),
    ).toEqual({
      maxVisibleTopics: 1,
      emphasis: 'SUBORDINATE',
      shouldRenderShelf: false,
    });
  });

  it('stays deterministic for identical presentation inputs', () => {
    const params = {
      profile: 'MIDDLE' as const,
      surface: 'DASHBOARD' as const,
      availability: createAvailableKnowledgeAvailability({
        surface: 'DASHBOARD',
        itemCount: 2,
      }),
    };

    expect(createContextualKnowledgePresentation(params)).toEqual(
      createContextualKnowledgePresentation(params),
    );
  });
});

describe('createContextualKnowledgeLane', () => {
  it('threads the prepared presentation through the contextual lane without rebuilding the density rules in the app', () => {
    const sparseNodes = knowledgeCatalog.filter(
      (node) => node.topicId === 'pp-what-protection-plans-are-for',
    );
    const params = {
      profile: 'BEGINNER' as const,
      surface: 'TRADE_HUB' as const,
      tradeHubSurface: createSparseTradeHubSurface(),
      nodes: sparseNodes,
    };

    const beginnerLane = createContextualKnowledgeLane(params);
    const advancedLane = createContextualKnowledgeLane({
      ...params,
      profile: 'ADVANCED' as const,
    });

    expect(beginnerLane.availability).toMatchObject({
      status: 'AVAILABLE',
      surface: 'TRADE_HUB',
    });
    expect(beginnerLane.linkage).toEqual({
      selectedTopicIds: ['pp-what-protection-plans-are-for'],
      selectionReason: 'EVENT',
    });
    expect(beginnerLane.presentation).toEqual({
      maxVisibleTopics: 1,
      emphasis: 'LIGHT',
      shouldRenderShelf: true,
    });
    expect(beginnerLane.topics).toHaveLength(1);
    expect(beginnerLane.topics[0]).toMatchObject({
      topicId: 'pp-what-protection-plans-are-for',
    });

    expect(advancedLane.presentation).toEqual({
      maxVisibleTopics: 1,
      emphasis: 'SUBORDINATE',
      shouldRenderShelf: false,
    });
    expect(advancedLane.linkage).toEqual(beginnerLane.linkage);
    expect(advancedLane.topics).toHaveLength(1);
    expect(advancedLane.topics[0]).toMatchObject({
      topicId: 'pp-what-protection-plans-are-for',
    });
    expect(advancedLane).toEqual(createContextualKnowledgeLane({
      ...params,
      profile: 'ADVANCED' as const,
    }));
  });
});
