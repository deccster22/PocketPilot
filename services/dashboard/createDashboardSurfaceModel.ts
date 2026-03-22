import type { UserProfile } from '@/core/profile/types';

import type { DashboardModel, DashboardSurfaceModel } from '@/services/dashboard/types';

function cloneItems(items: DashboardModel[keyof DashboardModel]) {
  return items.map((item) => ({ ...item }));
}

export function createDashboardSurfaceModel(params: {
  model: DashboardModel;
  profile: UserProfile;
}): DashboardSurfaceModel {
  const primeItems = cloneItems(params.model.prime);
  const secondaryItems = cloneItems(params.model.secondary);
  const deepItems = cloneItems(params.model.background);

  return {
    primeZone: {
      items: primeItems,
    },
    secondaryZone: {
      items: secondaryItems,
    },
    deepZone: {
      items: deepItems,
    },
    meta: {
      profile: params.profile,
      hasPrimeItems: primeItems.length > 0,
      hasSecondaryItems: secondaryItems.length > 0,
      hasDeepItems: deepItems.length > 0,
    },
  };
}
