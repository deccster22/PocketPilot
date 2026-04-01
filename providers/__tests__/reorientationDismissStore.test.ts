jest.mock('expo-file-system', () => ({
  Directory: class MockDirectory {
    constructor(...uris: unknown[]) {
      void uris;
    }
    create() {}
  },
  File: class MockFile {
    exists = false;

    constructor(...uris: unknown[]) {
      void uris;
    }

    async text() {
      return null;
    }

    create() {}
    write() {}
    delete() {}
  },
  Paths: {
    document: {},
  },
}));

import { createReorientationDismissStore } from '@/providers/reorientationDismissStore';

describe('createReorientationDismissStore', () => {
  it('loads empty state when nothing has been persisted yet', async () => {
    const store = createReorientationDismissStore({
      load: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
      clear: jest.fn(),
    });

    await expect(store.load()).resolves.toEqual({
      dismissedAt: null,
    });
  });

  it('round-trips a minimal persisted dismiss state', async () => {
    let persistedValue: string | null = null;
    const store = createReorientationDismissStore({
      load: jest.fn().mockImplementation(async () => persistedValue),
      save: jest.fn().mockImplementation(async (value: string) => {
        persistedValue = value;
      }),
      clear: jest.fn().mockImplementation(async () => {
        persistedValue = null;
      }),
    });

    await store.save({
      dismissedAt: '2026-04-01T00:00:00.000Z',
    });

    await expect(store.load()).resolves.toEqual({
      dismissedAt: '2026-04-01T00:00:00.000Z',
    });
  });

  it('clears persisted dismissal state when asked', async () => {
    let persistedValue: string | null = JSON.stringify({
      dismissedAt: '2026-04-01T00:00:00.000Z',
    });
    const store = createReorientationDismissStore({
      load: jest.fn().mockImplementation(async () => persistedValue),
      save: jest.fn(),
      clear: jest.fn().mockImplementation(async () => {
        persistedValue = null;
      }),
    });

    await store.clear();

    await expect(store.load()).resolves.toEqual({
      dismissedAt: null,
    });
  });

  it('normalises malformed persisted payloads back to the empty state', async () => {
    const store = createReorientationDismissStore({
      load: jest.fn().mockResolvedValue('{bad json'),
      save: jest.fn(),
      clear: jest.fn(),
    });

    await expect(store.load()).resolves.toEqual({
      dismissedAt: null,
    });
  });
});
