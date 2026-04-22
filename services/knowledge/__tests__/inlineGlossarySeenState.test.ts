import {
  acknowledgeInlineGlossaryTerms,
  createInMemoryInlineGlossarySeenState,
  createInlineGlossaryAcknowledgementKey,
} from '@/services/knowledge/inlineGlossarySeenState';

describe('inlineGlossarySeenState', () => {
  it('builds a deterministic acknowledgement key across account/profile/surface/topic scope', () => {
    expect(
      createInlineGlossaryAcknowledgementKey({
        accountId: 'acct-1',
        profile: 'BEGINNER',
        surface: 'DASHBOARD_EXPLANATION',
        topicId: 'strategy-momentum-pulse',
      }),
    ).toBe(
      'acct:acct-1|profile:BEGINNER|surface:DASHBOARD_EXPLANATION|topic:strategy-momentum-pulse',
    );
  });

  it('marks terms as acknowledged through the canonical update seam', () => {
    const seenState = createInMemoryInlineGlossarySeenState();
    const acknowledgementKey =
      'acct:acct-1|profile:BEGINNER|surface:TRADE_HUB_SAFETY|topic:pp-what-trade-hub-is-for';

    expect(seenState.hasAcknowledged(acknowledgementKey)).toBe(false);

    acknowledgeInlineGlossaryTerms({
      acknowledgementKeys: [acknowledgementKey],
      seenState,
    });

    expect(seenState.hasAcknowledged(acknowledgementKey)).toBe(true);
  });

  it('keeps acknowledgement state scoped so one account profile does not silence another', () => {
    const seenState = createInMemoryInlineGlossarySeenState();
    const beginnerKey = createInlineGlossaryAcknowledgementKey({
      accountId: 'acct-1',
      profile: 'BEGINNER',
      surface: 'TRADE_HUB_SAFETY',
      topicId: 'pp-what-trade-hub-is-for',
    });
    const middleKey = createInlineGlossaryAcknowledgementKey({
      accountId: 'acct-2',
      profile: 'MIDDLE',
      surface: 'TRADE_HUB_SAFETY',
      topicId: 'pp-what-trade-hub-is-for',
    });

    seenState.acknowledge(beginnerKey);

    expect(seenState.hasAcknowledged(beginnerKey)).toBe(true);
    expect(seenState.hasAcknowledged(middleKey)).toBe(false);
  });
});
