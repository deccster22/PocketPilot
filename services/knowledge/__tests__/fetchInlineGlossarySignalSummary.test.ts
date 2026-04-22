import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';
import { createInlineGlossaryHelp } from '@/services/knowledge/createInlineGlossaryHelp';
import { fetchInlineGlossarySignalSummary } from '@/services/knowledge/fetchInlineGlossarySignalSummary';
import {
  acknowledgeInlineGlossaryTerms,
  createInMemoryInlineGlossarySeenState,
} from '@/services/knowledge/inlineGlossarySeenState';
import {
  createInMemoryInlineGlossarySignalStore,
} from '@/services/knowledge/inlineGlossarySignalStore';

describe('fetchInlineGlossarySignalSummary', () => {
  it('returns unavailable when no aggregate glossary signals were recorded', () => {
    const signalStore = createInMemoryInlineGlossarySignalStore();

    expect(fetchInlineGlossarySignalSummary({ signalStore })).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_SIGNALS_RECORDED',
    });
  });

  it('collects surfaced and acknowledged signals through service seams without a UI analytics screen', () => {
    const seenState = createInMemoryInlineGlossarySeenState();
    const signalStore = createInMemoryInlineGlossarySignalStore();
    const help = createInlineGlossaryHelp({
      profile: 'BEGINNER',
      surface: 'TRADE_HUB_SAFETY',
      text: 'ProtectionPlan context stays support-only and optional.',
      accountId: 'acct-1',
      nodes: knowledgeCatalog,
      seenState,
      signalStore,
    });

    if (help.status !== 'AVAILABLE') {
      throw new Error('Expected inline glossary help to be available for signal recording.');
    }

    acknowledgeInlineGlossaryTerms({
      acknowledgementKeys: help.block.acknowledgementKeys,
      seenState,
      signalStore,
    });

    expect(fetchInlineGlossarySignalSummary({ signalStore })).toEqual({
      status: 'AVAILABLE',
      signals: [
        {
          key: {
            topicId: 'pp-what-protection-plans-are-for',
            surface: 'TRADE_HUB',
            profileTier: 'BEGINNER',
          },
          surfacedCount: 1,
          acknowledgedCount: 1,
        },
      ],
    });
  });
});
