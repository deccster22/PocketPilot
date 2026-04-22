import type { UserProfile } from '@/core/profile/types';
import {
  defaultInlineGlossarySignalStore,
  type InlineGlossarySignalStore,
} from '@/services/knowledge/inlineGlossarySignalStore';
import type {
  InlineGlossarySignalKey,
  InlineGlossarySignalProfileTier,
  InlineGlossarySignalSurface,
  InlineGlossarySurface,
} from '@/services/knowledge/types';

type ParsedInlineGlossaryAcknowledgementSignal = {
  topicId: string;
  profile: UserProfile;
  surface: InlineGlossarySurface;
};

function toSignalSurface(
  surface: InlineGlossarySurface,
): InlineGlossarySignalSurface | null {
  switch (surface) {
    case 'DASHBOARD_EXPLANATION':
      return 'DASHBOARD';
    case 'TRADE_HUB_SAFETY':
      return 'TRADE_HUB';
    default:
      return null;
  }
}

function toSignalProfileTier(profile: UserProfile): InlineGlossarySignalProfileTier {
  switch (profile) {
    case 'BEGINNER':
      return 'BEGINNER';
    case 'MIDDLE':
      return 'INTERMEDIATE';
    case 'ADVANCED':
      return 'ADVANCED';
    default:
      return 'INTERMEDIATE';
  }
}

function parseAcknowledgementSignal(
  acknowledgementKey: string,
): ParsedInlineGlossaryAcknowledgementSignal | null {
  const parts = acknowledgementKey.trim().split('|');

  if (parts.length !== 4) {
    return null;
  }

  const profilePart = parts[1];
  const surfacePart = parts[2];
  const topicPart = parts[3];

  if (!profilePart.startsWith('profile:') || !surfacePart.startsWith('surface:')) {
    return null;
  }

  const profile = profilePart.replace(/^profile:/, '') as UserProfile;
  const surface = surfacePart.replace(/^surface:/, '') as InlineGlossarySurface;
  const topicId = topicPart.replace(/^topic:/, '').trim();

  if (
    (profile !== 'BEGINNER' && profile !== 'MIDDLE' && profile !== 'ADVANCED') ||
    (surface !== 'DASHBOARD_EXPLANATION' && surface !== 'TRADE_HUB_SAFETY') ||
    topicId.length === 0
  ) {
    return null;
  }

  return {
    topicId,
    profile,
    surface,
  };
}

function createSignalKey(params: {
  topicId: string;
  profile: UserProfile;
  surface: InlineGlossarySurface;
}): InlineGlossarySignalKey | null {
  const topicId = params.topicId.trim();
  const surface = toSignalSurface(params.surface);

  if (!surface || topicId.length === 0) {
    return null;
  }

  return {
    topicId,
    surface,
    profileTier: toSignalProfileTier(params.profile),
  };
}

export function recordInlineGlossarySurfacedSignals(params: {
  profile: UserProfile;
  surface: InlineGlossarySurface;
  topicIds: ReadonlyArray<string>;
  signalStore?: InlineGlossarySignalStore;
}): void {
  const signalStore = params.signalStore ?? defaultInlineGlossarySignalStore;
  const keys = params.topicIds
    .map((topicId) =>
      createSignalKey({
        topicId,
        profile: params.profile,
        surface: params.surface,
      }),
    )
    .filter((key): key is InlineGlossarySignalKey => key !== null);

  if (keys.length === 0) {
    return;
  }

  signalStore.recordSurfaced(keys);
}

export function recordInlineGlossaryAcknowledgedSignals(params: {
  acknowledgementKeys: ReadonlyArray<string>;
  signalStore?: InlineGlossarySignalStore;
}): void {
  const signalStore = params.signalStore ?? defaultInlineGlossarySignalStore;
  const keys = params.acknowledgementKeys
    .map((acknowledgementKey) => parseAcknowledgementSignal(acknowledgementKey))
    .filter((signal): signal is ParsedInlineGlossaryAcknowledgementSignal => signal !== null)
    .map((signal) =>
      createSignalKey({
        topicId: signal.topicId,
        profile: signal.profile,
        surface: signal.surface,
      }),
    )
    .filter((key): key is InlineGlossarySignalKey => key !== null);

  if (keys.length === 0) {
    return;
  }

  signalStore.recordAcknowledged(keys);
}
