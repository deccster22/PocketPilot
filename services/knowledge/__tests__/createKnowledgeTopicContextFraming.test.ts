import { createKnowledgeTopicContextFraming } from '@/services/knowledge/createKnowledgeTopicContextFraming';

describe('createKnowledgeTopicContextFraming', () => {
  it('returns a calm prepared framing block for Dashboard-origin topic detail', () => {
    expect(
      createKnowledgeTopicContextFraming({
        contextualOrigin: {
          originSurface: 'DASHBOARD',
          linkageReason: 'SURFACE_CONTEXT',
        },
      }),
    ).toEqual({
      status: 'AVAILABLE',
      framing: {
        title: 'Why this topic is here',
        summary:
          'Opened from Dashboard, so the detail view keeps the same calm contextual frame rather than becoming a separate surface of its own.',
        originSurface: 'DASHBOARD',
        linkageReasons: ['SURFACE_CONTEXT'],
      },
    });
  });

  it('compresses mixed linkage into one compact Trade Hub framing block', () => {
    expect(
      createKnowledgeTopicContextFraming({
        contextualOrigin: {
          originSurface: 'TRADE_HUB',
          linkageReason: 'MIXED',
        },
      }),
    ).toEqual({
      status: 'AVAILABLE',
      framing: {
        title: 'Why this topic is here',
        summary:
          'Opened from Trade Hub, so the detail view keeps the same calm action-support frame rather than becoming a separate surface of its own.',
        originSurface: 'TRADE_HUB',
        linkageReasons: ['STRATEGY', 'SIGNAL', 'EVENT', 'SURFACE_CONTEXT'],
      },
    });
  });

  it('returns an honest unavailable state when no contextual origin exists', () => {
    expect(
      createKnowledgeTopicContextFraming({
        contextualOrigin: null,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_CONTEXTUAL_ORIGIN',
    });
  });

  it('returns an honest unavailable state for unsupported contextual surfaces', () => {
    expect(
      createKnowledgeTopicContextFraming({
        contextualOrigin: {
          originSurface: 'STRATEGY_PREVIEW',
          linkageReason: 'EVENT',
        },
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
  });

  it('remains deterministic for identical inputs', () => {
    const params = {
      contextualOrigin: {
        originSurface: 'DASHBOARD' as const,
        linkageReason: 'EVENT' as const,
      },
    };

    expect(createKnowledgeTopicContextFraming(params)).toEqual(
      createKnowledgeTopicContextFraming(params),
    );
  });
});
