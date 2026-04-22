import {
  createInMemoryInlineGlossarySignalStore,
} from '@/services/knowledge/inlineGlossarySignalStore';

describe('inlineGlossarySignalStore', () => {
  it('records deterministic surfaced and acknowledged counters per canonical key', () => {
    const store = createInMemoryInlineGlossarySignalStore();

    const key = {
      topicId: 'pp-what-trade-hub-is-for',
      surface: 'TRADE_HUB' as const,
      profileTier: 'BEGINNER' as const,
    };

    store.recordSurfaced([key, key]);
    store.recordAcknowledged([key]);
    store.recordSurfaced([key]);

    expect(store.getSignals()).toEqual([
      {
        key,
        surfacedCount: 2,
        acknowledgedCount: 1,
      },
    ]);
  });

  it('keeps aggregate ordering deterministic across multiple keys', () => {
    const store = createInMemoryInlineGlossarySignalStore();

    store.recordSurfaced([
      {
        topicId: 'b-topic',
        surface: 'TRADE_HUB',
        profileTier: 'ADVANCED',
      },
      {
        topicId: 'a-topic',
        surface: 'DASHBOARD',
        profileTier: 'BEGINNER',
      },
    ]);

    expect(store.getSignals().map((signal) => signal.key)).toEqual([
      {
        topicId: 'a-topic',
        surface: 'DASHBOARD',
        profileTier: 'BEGINNER',
      },
      {
        topicId: 'b-topic',
        surface: 'TRADE_HUB',
        profileTier: 'ADVANCED',
      },
    ]);
  });
});
