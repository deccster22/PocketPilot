import type { UserProfile } from '@/core/profile/types';

import type { SnapshotModel } from '@/services/snapshot/types';

function compact<T extends object>(value: T): T | undefined {
  const entries = Object.entries(value).filter(([, item]) => item !== undefined);

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries) as T;
}

function selectSecondaryFields(model: SnapshotModel, profile: UserProfile) {
  switch (profile) {
    case 'BEGINNER':
      return undefined;
    case 'MIDDLE':
      return compact({
        portfolioValue: model.secondary?.portfolioValue,
      });
    case 'ADVANCED':
      return compact({
        bundleName: model.secondary?.bundleName,
        portfolioValue: model.secondary?.portfolioValue,
      });
    default:
      return undefined;
  }
}

function selectHistoryFields(model: SnapshotModel, profile: UserProfile) {
  if (profile !== 'ADVANCED') {
    return undefined;
  }

  return compact({
    hasNewSinceLastCheck: model.history?.hasNewSinceLastCheck,
  });
}

export function createProfileAwareSnapshotModel(params: {
  model: SnapshotModel;
  profile: UserProfile;
}): SnapshotModel {
  return {
    profile: params.profile,
    core: params.model.core,
    secondary: selectSecondaryFields(params.model, params.profile),
    history: selectHistoryFields(params.model, params.profile),
  };
}
