import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';
import { createGlossaryTermIndex } from '@/services/knowledge/createGlossaryTermIndex';

describe('createGlossaryTermIndex', () => {
  it('builds a deterministic, surface-scoped alias index from canonical topic rules', () => {
    const result = createGlossaryTermIndex({
      surface: 'TRADE_HUB_SAFETY',
      nodes: knowledgeCatalog,
    });

    expect(result.status).toBe('AVAILABLE');

    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected glossary index to be available for Trade Hub safety surface.');
    }

    const protectionVariant = result.index.variants.find(
      (variant) => variant.topicId === 'pp-what-protection-plans-are-for',
    );

    expect(protectionVariant?.canonicalTerm).toBe('Protection Plans');
    expect(protectionVariant?.matchTerms).toEqual(
      expect.arrayContaining(['protection plan', 'protection plans']),
    );

    const allMatchTerms = result.index.variants.flatMap((variant) => variant.matchTerms);
    expect(allMatchTerms).not.toContain('confirmation');
  });

  it('normalises case and punctuation variants for matcher regexes', () => {
    const result = createGlossaryTermIndex({
      surface: 'DASHBOARD_EXPLANATION',
      nodes: knowledgeCatalog,
    });

    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected glossary index to be available for dashboard explanation surface.');
    }

    const marketEventMatcher = result.index.matchers.find(
      (matcher) =>
        matcher.topicId === 'pp-what-a-marketevent-is' && matcher.matchTerm === 'market event',
    );

    expect(marketEventMatcher).toBeDefined();
    expect(marketEventMatcher?.regex.test('MarketEvent')).toBe(true);
    expect(marketEventMatcher?.regex.test('market-event')).toBe(true);
    expect(marketEventMatcher?.regex.test('market event')).toBe(true);
  });

  it('returns unavailable when no configured surface topics exist in the provided nodes', () => {
    const nodesWithoutTradeHubTopics = knowledgeCatalog.filter(
      (node) =>
        node.topicId !== 'pp-what-trade-hub-is-for' &&
        node.topicId !== 'pp-what-protection-plans-are-for',
    );

    expect(
      createGlossaryTermIndex({
        surface: 'TRADE_HUB_SAFETY',
        nodes: nodesWithoutTradeHubTopics,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_ELIGIBLE_TERMS',
    });
  });
});
