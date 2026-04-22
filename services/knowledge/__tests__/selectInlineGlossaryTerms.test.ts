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
      canonicalTerm: 'Momentum',
    });
    expect(result.candidates[1]).toMatchObject({
      text: 'confirmed',
      topicId: 'pp-estimated-vs-confirmed-context',
      canonicalTerm: 'Estimated vs Confirmed',
    });
    expect(result.candidates[1].start).toBeGreaterThan(result.candidates[0].end);
  });

  it('resolves canonical and alias variants to the same topic deterministically', () => {
    const canonical = selectInlineGlossaryTerms({
      surface: 'TRADE_HUB_SAFETY',
      text: 'Protection plan context stays support-only.',
      nodes: knowledgeCatalog,
    });
    const alias = selectInlineGlossaryTerms({
      surface: 'TRADE_HUB_SAFETY',
      text: 'ProtectionPlan context stays support-only.',
      nodes: knowledgeCatalog,
    });

    expect(canonical.status).toBe('AVAILABLE');
    expect(alias.status).toBe('AVAILABLE');

    if (canonical.status !== 'AVAILABLE' || alias.status !== 'AVAILABLE') {
      throw new Error('Expected canonical and alias variants to resolve.');
    }

    expect(canonical.candidates[0]).toMatchObject({
      topicId: 'pp-what-protection-plans-are-for',
      canonicalTerm: 'Protection Plans',
    });
    expect(alias.candidates[0]).toMatchObject({
      topicId: 'pp-what-protection-plans-are-for',
      canonicalTerm: 'Protection Plans',
    });
  });

  it('suppresses generic words that are too noisy for inline linking', () => {
    expect(
      selectInlineGlossaryTerms({
        surface: 'TRADE_HUB_SAFETY',
        text: 'Confirmation is still required before moving forward.',
        nodes: knowledgeCatalog,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_ELIGIBLE_TERMS',
    });
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
    const nodesWithoutProtectionPlans = knowledgeCatalog.filter(
      (node) => node.topicId !== 'pp-what-protection-plans-are-for',
    );

    expect(
      selectInlineGlossaryTerms({
        surface: 'TRADE_HUB_SAFETY',
        text: 'Protection plan framing remains support-only.',
        nodes: nodesWithoutProtectionPlans,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_ELIGIBLE_TERMS',
    });
  });
});
