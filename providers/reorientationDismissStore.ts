import { Directory, File, Paths } from 'expo-file-system';

import {
  EMPTY_REORIENTATION_DISMISS_STATE,
  type ReorientationDismissState,
  type ReorientationDismissStore,
} from '@/services/orientation/reorientationPersistence';

type PersistedTextStore = {
  load(): Promise<string | null>;
  save(value: string): Promise<void>;
  clear(): Promise<void>;
};

function normaliseDismissState(
  state: Partial<ReorientationDismissState> | null | undefined,
): ReorientationDismissState {
  return {
    dismissedAt: typeof state?.dismissedAt === 'string' ? state.dismissedAt : null,
  };
}

export function createReorientationDismissStore(
  persistedTextStore: PersistedTextStore,
): ReorientationDismissStore {
  return {
    async load() {
      const rawValue = await persistedTextStore.load();

      if (!rawValue) {
        return EMPTY_REORIENTATION_DISMISS_STATE;
      }

      try {
        return normaliseDismissState(JSON.parse(rawValue) as ReorientationDismissState);
      } catch {
        return EMPTY_REORIENTATION_DISMISS_STATE;
      }
    },
    async save(state) {
      await persistedTextStore.save(JSON.stringify(normaliseDismissState(state)));
    },
    async clear() {
      await persistedTextStore.clear();
    },
  };
}

function createFileSystemPersistedTextStore(): PersistedTextStore {
  const directory = new Directory(Paths.document, 'pocketpilot');
  const file = new File(directory, 'reorientation-dismiss-state.json');

  return {
    async load() {
      if (!file.exists) {
        return null;
      }

      return file.text();
    },
    async save(value) {
      directory.create({
        idempotent: true,
        intermediates: true,
      });
      file.create({
        intermediates: true,
        overwrite: true,
      });
      file.write(value, {
        encoding: 'utf8',
      });
    },
    async clear() {
      if (!file.exists) {
        return;
      }

      file.delete();
    },
  };
}

export const defaultReorientationDismissStore = createReorientationDismissStore(
  createFileSystemPersistedTextStore(),
);
