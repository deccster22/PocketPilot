import type { UserProfile } from '@/core/profile/types';

import type { DashboardModel } from '@/services/dashboard/types';

function sliceModel(model: DashboardModel, limits: Record<keyof DashboardModel, number>): DashboardModel {
  return {
    prime: model.prime.slice(0, limits.prime),
    secondary: model.secondary.slice(0, limits.secondary),
    background: model.background.slice(0, limits.background),
  };
}

export function shapeDashboardForProfile(params: {
  model: DashboardModel;
  profile: UserProfile;
}): DashboardModel {
  switch (params.profile) {
    case 'BEGINNER':
      if (params.model.prime.length > 0) {
        return {
          prime: params.model.prime.slice(0, 1),
          secondary: [],
          background: [],
        };
      }

      if (params.model.secondary.length > 0) {
        return {
          prime: [],
          secondary: params.model.secondary.slice(0, 1),
          background: [],
        };
      }

      return {
        prime: [],
        secondary: [],
        background: [],
      };
    case 'MIDDLE':
      return sliceModel(params.model, {
        prime: 2,
        secondary: 2,
        background: 1,
      });
    case 'ADVANCED':
    default:
      return {
        prime: [...params.model.prime],
        secondary: [...params.model.secondary],
        background: [...params.model.background],
      };
  }
}
