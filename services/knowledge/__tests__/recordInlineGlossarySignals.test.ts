import {
  createInMemoryInlineGlossarySignalStore,
} from '@/services/knowledge/inlineGlossarySignalStore';
import {
  recordInlineGlossaryAcknowledgedSignals,
  recordInlineGlossarySurfacedSignals,
} from '@/services/knowledge/recordInlineGlossarySignals';

describe('recordInlineGlossarySignals', () => {
  it('records surfaced counts with canonical profile-tier and surface normalization', () => {
    const signalStore = createInMemoryInlineGlossarySignalStore();

    recordInlineGlossarySurfacedSignals({
      profile: 'MIDDLE',
      surface: 'TRADE_HUB_SAFETY',
      topicIds: ['pp-what-protection-plans-are-for', 'pp-what-protection-plans-are-for'],
      signalStore,
    });

    expect(signalStore.getSignals()).toEqual([
      {
        key: {
          topicId: 'pp-what-protection-plans-are-for',
          surface: 'TRADE_HUB',
          profileTier: 'INTERMEDIATE',
        },
        surfacedCount: 1,
        acknowledgedCount: 0,
      },
    ]);
  });

  it('records acknowledged counts through acknowledgement keys while ignoring malformed keys', () => {
    const signalStore = createInMemoryInlineGlossarySignalStore();

    recordInlineGlossaryAcknowledgedSignals({
      acknowledgementKeys: [
        'acct:acct-1|profile:BEGINNER|surface:DASHBOARD_EXPLANATION|topic:strategy-momentum-pulse',
        'invalid-key',
      ],
      signalStore,
    });

    expect(signalStore.getSignals()).toEqual([
      {
        key: {
          topicId: 'strategy-momentum-pulse',
          surface: 'DASHBOARD',
          profileTier: 'BEGINNER',
        },
        surfacedCount: 0,
        acknowledgedCount: 1,
      },
    ]);
  });
});
