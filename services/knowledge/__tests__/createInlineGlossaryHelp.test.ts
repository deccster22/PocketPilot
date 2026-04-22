import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';
import {
  acknowledgeInlineGlossaryTerms,
  createInMemoryInlineGlossarySeenState,
} from '@/services/knowledge/inlineGlossarySeenState';
import { createInlineGlossaryHelp } from '@/services/knowledge/createInlineGlossaryHelp';

describe('createInlineGlossaryHelp', () => {
  it('gives beginner users linked inline glossary help on first encounter', () => {
    const seenState = createInMemoryInlineGlossarySeenState();
    const result = createInlineGlossaryHelp({
      profile: 'BEGINNER',
      surface: 'TRADE_HUB_SAFETY',
      text: 'Trade Hub frames possible actions only. Nothing here executes a trade.',
      accountId: 'acct-1',
      seenState,
      nodes: knowledgeCatalog,
    });

    expect(result.status).toBe('AVAILABLE');

    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected inline glossary help to be available for beginner profile.');
    }

    expect(result.block.acknowledgementKeys).toEqual([
      'acct:acct-1|profile:BEGINNER|surface:TRADE_HUB_SAFETY|topic:pp-what-trade-hub-is-for',
    ]);
    expect(result.block.segments[0]).toMatchObject({
      kind: 'GLOSSARY_TERM',
      text: 'Trade Hub',
      topicId: 'pp-what-trade-hub-is-for',
      renderMode: 'LINKED',
    });
  });

  it('keeps advanced profile treatment minimal by default', () => {
    expect(
      createInlineGlossaryHelp({
        profile: 'ADVANCED',
        surface: 'TRADE_HUB_SAFETY',
        text: 'Trade Hub frames possible actions only. Nothing here executes a trade.',
        accountId: 'acct-1',
        nodes: knowledgeCatalog,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_PROFILE',
    });
  });

  it('keeps middle profile lighter than beginner on the same text', () => {
    const beginner = createInlineGlossaryHelp({
      profile: 'BEGINNER',
      surface: 'DASHBOARD_EXPLANATION',
      text: 'Momentum is still building while part of the context is confirmed.',
      accountId: 'acct-1',
      nodes: knowledgeCatalog,
    });
    const middle = createInlineGlossaryHelp({
      profile: 'MIDDLE',
      surface: 'DASHBOARD_EXPLANATION',
      text: 'Momentum is still building while part of the context is confirmed.',
      accountId: 'acct-1',
      nodes: knowledgeCatalog,
    });

    if (beginner.status !== 'AVAILABLE' || middle.status !== 'AVAILABLE') {
      throw new Error('Expected inline glossary help to be available for this comparison.');
    }

    const beginnerLinkedCount = beginner.block.segments.filter(
      (segment) => segment.kind === 'GLOSSARY_TERM' && segment.renderMode === 'LINKED',
    ).length;
    const middleLinkedCount = middle.block.segments.filter(
      (segment) => segment.kind === 'GLOSSARY_TERM' && segment.renderMode === 'LINKED',
    ).length;

    expect(beginnerLinkedCount).toBe(2);
    expect(middleLinkedCount).toBe(1);
  });

  it('downgrades repeat exposure after service-owned acknowledgement updates', () => {
    const seenState = createInMemoryInlineGlossarySeenState();
    const first = createInlineGlossaryHelp({
      profile: 'BEGINNER',
      surface: 'TRADE_HUB_SAFETY',
      text: 'Trade Hub frames possible actions only. Nothing here executes a trade.',
      accountId: 'acct-1',
      seenState,
      nodes: knowledgeCatalog,
    });

    if (first.status !== 'AVAILABLE') {
      throw new Error('Expected first inline glossary pass to be available.');
    }

    acknowledgeInlineGlossaryTerms({
      acknowledgementKeys: first.block.acknowledgementKeys,
      seenState,
    });

    const second = createInlineGlossaryHelp({
      profile: 'BEGINNER',
      surface: 'TRADE_HUB_SAFETY',
      text: 'Trade Hub frames possible actions only. Nothing here executes a trade.',
      accountId: 'acct-1',
      seenState,
      nodes: knowledgeCatalog,
    });

    expect(second.status).toBe('AVAILABLE');

    if (second.status !== 'AVAILABLE') {
      throw new Error('Expected second inline glossary pass to stay available.');
    }

    expect(second.block.acknowledgementKeys).toEqual([]);
    expect(second.block.segments[0]).toMatchObject({
      kind: 'GLOSSARY_TERM',
      text: 'Trade Hub',
      topicId: 'pp-what-trade-hub-is-for',
      renderMode: 'PLAIN',
    });
  });

  it('keeps seen-term suppression stable when a later encounter uses an alias variant', () => {
    const seenState = createInMemoryInlineGlossarySeenState();
    const first = createInlineGlossaryHelp({
      profile: 'BEGINNER',
      surface: 'TRADE_HUB_SAFETY',
      text: 'Protection plan framing stays optional and support-only.',
      accountId: 'acct-1',
      seenState,
      nodes: knowledgeCatalog,
    });

    if (first.status !== 'AVAILABLE') {
      throw new Error('Expected first inline glossary pass to be available.');
    }

    acknowledgeInlineGlossaryTerms({
      acknowledgementKeys: first.block.acknowledgementKeys,
      seenState,
    });

    const second = createInlineGlossaryHelp({
      profile: 'BEGINNER',
      surface: 'TRADE_HUB_SAFETY',
      text: 'ProtectionPlan framing stays optional and support-only.',
      accountId: 'acct-1',
      seenState,
      nodes: knowledgeCatalog,
    });

    expect(second.status).toBe('AVAILABLE');

    if (second.status !== 'AVAILABLE') {
      throw new Error('Expected second inline glossary pass to stay available.');
    }

    expect(second.block.acknowledgementKeys).toEqual([]);
    expect(second.block.segments[0]).toMatchObject({
      kind: 'GLOSSARY_TERM',
      topicId: 'pp-what-protection-plans-are-for',
      renderMode: 'PLAIN',
    });
  });
});
