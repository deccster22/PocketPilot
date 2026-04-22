import type {
  InlineGlossaryAggregateSignal,
  InlineGlossarySignalKey,
} from '@/services/knowledge/types';

export type InlineGlossarySignalStore = {
  recordSurfaced(keys: ReadonlyArray<InlineGlossarySignalKey>): void;
  recordAcknowledged(keys: ReadonlyArray<InlineGlossarySignalKey>): void;
  getSignals(): ReadonlyArray<InlineGlossaryAggregateSignal>;
};

function normaliseSignalTopicId(topicId: string): string | null {
  const trimmed = topicId.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toSignalMapKey(key: InlineGlossarySignalKey): string | null {
  const topicId = normaliseSignalTopicId(key.topicId);

  if (!topicId) {
    return null;
  }

  return `${topicId}|${key.surface}|${key.profileTier}`;
}

function sortSignals(
  signals: ReadonlyArray<InlineGlossaryAggregateSignal>,
): ReadonlyArray<InlineGlossaryAggregateSignal> {
  return [...signals].sort((left, right) => {
    if (left.key.surface !== right.key.surface) {
      return left.key.surface.localeCompare(right.key.surface);
    }

    if (left.key.profileTier !== right.key.profileTier) {
      return left.key.profileTier.localeCompare(right.key.profileTier);
    }

    return left.key.topicId.localeCompare(right.key.topicId);
  });
}

function incrementSignals(params: {
  signalMap: Map<string, InlineGlossaryAggregateSignal>;
  keys: ReadonlyArray<InlineGlossarySignalKey>;
  field: 'surfacedCount' | 'acknowledgedCount';
}): void {
  const uniqueKeys = new Set(
    params.keys
      .map((key) => toSignalMapKey(key))
      .filter((value): value is string => value !== null),
  );

  uniqueKeys.forEach((mapKey) => {
    const current = params.signalMap.get(mapKey);

    if (current) {
      current[params.field] += 1;
      return;
    }

    const [topicId, surface, profileTier] = mapKey.split('|');

    params.signalMap.set(mapKey, {
      key: {
        topicId,
        surface: surface as InlineGlossarySignalKey['surface'],
        profileTier: profileTier as InlineGlossarySignalKey['profileTier'],
      },
      surfacedCount: params.field === 'surfacedCount' ? 1 : 0,
      acknowledgedCount: params.field === 'acknowledgedCount' ? 1 : 0,
    });
  });
}

export function createInMemoryInlineGlossarySignalStore(
  initialSignals: ReadonlyArray<InlineGlossaryAggregateSignal> = [],
): InlineGlossarySignalStore & { reset(): void } {
  const signalMap = new Map<string, InlineGlossaryAggregateSignal>();

  initialSignals.forEach((signal) => {
    const mapKey = toSignalMapKey(signal.key);

    if (!mapKey) {
      return;
    }

    signalMap.set(mapKey, {
      key: {
        ...signal.key,
      },
      surfacedCount: Math.max(0, Math.trunc(signal.surfacedCount)),
      acknowledgedCount: Math.max(0, Math.trunc(signal.acknowledgedCount)),
    });
  });

  return {
    recordSurfaced(keys) {
      incrementSignals({
        signalMap,
        keys,
        field: 'surfacedCount',
      });
    },
    recordAcknowledged(keys) {
      incrementSignals({
        signalMap,
        keys,
        field: 'acknowledgedCount',
      });
    },
    getSignals() {
      return sortSignals([...signalMap.values()].map((signal) => ({ ...signal })));
    },
    reset() {
      signalMap.clear();
    },
  };
}

export const defaultInlineGlossarySignalStore = createInMemoryInlineGlossarySignalStore();
