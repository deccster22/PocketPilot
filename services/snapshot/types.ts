import type { UserProfile } from '@/core/profile/types';

export type SnapshotTrendDirection = 'UP' | 'DOWN' | 'FLAT';

export type SnapshotCoreField<TValue> = {
  label: string;
  value: TValue;
};

export type SnapshotCoreModel = {
  currentState: SnapshotCoreField<string> & {
    trendDirection: SnapshotTrendDirection;
  };
  change24h: SnapshotCoreField<number>;
  strategyStatus: SnapshotCoreField<string>;
};

export type SnapshotSecondaryModel = {
  bundleName?: string;
  portfolioValue?: number;
};

export type SnapshotHistoryModel = {
  hasNewSinceLastCheck?: boolean;
};

export type SnapshotModel = {
  profile: UserProfile;
  core: SnapshotCoreModel;
  secondary?: SnapshotSecondaryModel;
  history?: SnapshotHistoryModel;
};
