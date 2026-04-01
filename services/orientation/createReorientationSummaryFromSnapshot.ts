import type { UserProfile } from '@/core/profile/types';
import { createOrientationBriefingItems } from '@/services/orientation/createOrientationBriefingItems';
import { createReorientationSummary } from '@/services/orientation/createReorientationSummary';
import type {
  ReorientationEligibility,
  ReorientationPreference,
} from '@/services/orientation/types';
import type { SnapshotVM } from '@/services/snapshot/snapshotService';

export function createReorientationSummaryFromSnapshot(params: {
  snapshot: Pick<SnapshotVM, 'model' | 'orientationContext' | 'scan'>;
  profile: UserProfile;
  now: string;
  preference?: ReorientationPreference;
}): ReorientationEligibility {
  const sinceLastChecked = params.snapshot.orientationContext.historyContext.sinceLastChecked;

  if (!sinceLastChecked) {
    return {
      status: 'NOT_NEEDED',
      reason: 'NO_MEANINGFUL_CHANGE',
    };
  }

  const summaryItems = createOrientationBriefingItems({
    eventsSinceLastViewed: params.snapshot.orientationContext.historyContext.eventsSinceLastViewed,
    snapshotState: {
      currentState: params.snapshot.model.core.currentState.value,
      strategyStatus: params.snapshot.model.core.strategyStatus.value,
    },
  });

  return createReorientationSummary({
    now: params.now,
    lastActiveAt: new Date(sinceLastChecked.sinceTimestamp).toISOString(),
    profileId: params.profile,
    preference: params.preference,
    summarySource: {
      snapshotModel: params.snapshot.model,
      orientationContext: params.snapshot.orientationContext,
      accountId: params.snapshot.scan.accountId,
    },
    summaryItems,
  });
}
