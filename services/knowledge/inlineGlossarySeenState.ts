import type { UserProfile } from '@/core/profile/types';
import type { InlineGlossarySurface } from '@/services/knowledge/types';

export type InlineGlossaryAcknowledgementScope = {
  accountId?: string | null;
  profile: UserProfile;
  surface: InlineGlossarySurface;
  topicId: string;
};

export type InlineGlossarySeenState = {
  hasAcknowledged(acknowledgementKey: string): boolean;
  acknowledge(acknowledgementKey: string): void;
  acknowledgeMany(acknowledgementKeys: ReadonlyArray<string>): void;
};

function normaliseOptionalText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function createInlineGlossaryAcknowledgementKey(
  scope: InlineGlossaryAcknowledgementScope,
): string {
  const accountId = normaliseOptionalText(scope.accountId) ?? 'all';
  return `acct:${accountId}|profile:${scope.profile}|surface:${scope.surface}|topic:${scope.topicId}`;
}

export function createInMemoryInlineGlossarySeenState(
  initialAcknowledgementKeys: ReadonlyArray<string> = [],
): InlineGlossarySeenState & { reset(): void } {
  const seenAcknowledgementKeys = new Set(
    initialAcknowledgementKeys
      .map((value) => normaliseOptionalText(value))
      .filter((value): value is string => Boolean(value)),
  );

  return {
    hasAcknowledged(acknowledgementKey) {
      const normalisedKey = normaliseOptionalText(acknowledgementKey);
      return normalisedKey ? seenAcknowledgementKeys.has(normalisedKey) : false;
    },
    acknowledge(acknowledgementKey) {
      const normalisedKey = normaliseOptionalText(acknowledgementKey);

      if (!normalisedKey) {
        return;
      }

      seenAcknowledgementKeys.add(normalisedKey);
    },
    acknowledgeMany(acknowledgementKeys) {
      acknowledgementKeys.forEach((acknowledgementKey) => {
        const normalisedKey = normaliseOptionalText(acknowledgementKey);

        if (!normalisedKey) {
          return;
        }

        seenAcknowledgementKeys.add(normalisedKey);
      });
    },
    reset() {
      seenAcknowledgementKeys.clear();
    },
  };
}

export function acknowledgeInlineGlossaryTerms(params: {
  acknowledgementKeys: ReadonlyArray<string>;
  seenState?: InlineGlossarySeenState;
}): void {
  const seenState = params.seenState ?? defaultInlineGlossarySeenState;
  seenState.acknowledgeMany(params.acknowledgementKeys);
}

export const defaultInlineGlossarySeenState = createInMemoryInlineGlossarySeenState();
