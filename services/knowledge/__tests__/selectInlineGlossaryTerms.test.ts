import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';
import { selectInlineGlossaryTerms } from '@/services/knowledge/selectInlineGlossaryTerms';

describe('selectInlineGlossaryTerms', () => {
  it('selects a deterministic, narrow term set for Dashboard explanation text', () => {
    const result = selectInlineGlossaryTerms({
      surface: 'DASHBOARD_EXPLANATION',
      text:
        'BTC is in focus because momentum has continued to build while part of the supporting context remains confirmed.',
      nodes: knowledgeCatalog,
    });

    expect(result.status).toBe('AVAILABLE');

    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected deterministic dashboard term selection to be available.');
    }

    expect(result.candidates).toHaveLength(2);
    expect(result.candidates[0]).toMatchObject({
      text: 'momentum',
      topicId: 'strategy-momentum-pulse',
    });
    expect(result.candidates[1]).toMatchObject({
      text: 'confirmed',
      topicId: 'pp-estimated-vs-confirmed-context',
    });
    expect(result.candidates[1].start).toBeGreaterThan(result.candidates[0].end);
  });

  it('returns unavailable when no approved term appears on the surface text', () => {
    expect(
      selectInlineGlossaryTerms({
        surface: 'TRADE_HUB_SAFETY',
        text: 'This note stays compact and optional.',
        nodes: knowledgeCatalog,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_ELIGIBLE_TERMS',
    });
  });

  it('skips term mappings whose topic id is not in the live catalog input', () => {
    const nodesWithoutTradeHubTopic = knowledgeCatalog.filter(
      (node) => node.topicId !== 'pp-what-trade-hub-is-for',
    );

    expect(
      selectInlineGlossaryTerms({
        surface: 'TRADE_HUB_SAFETY',
        text: 'Trade Hub frames possible actions only.',
        nodes: nodesWithoutTradeHubTopic,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_ELIGIBLE_TERMS',
    });
  });
});
