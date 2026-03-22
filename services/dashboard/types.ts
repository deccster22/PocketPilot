import type { UserProfile } from '@/core/profile/types';
import type { AlignmentState, Certainty, EventType } from '@/core/types/marketEvent';

export type DashboardTrendDirection = 'strengthening' | 'weakening' | 'neutral';

export type DashboardItem = {
  symbol?: string;
  accountId?: string;
  strategyId?: string;
  eventType: EventType;
  alignmentState?: AlignmentState;
  trendDirection?: DashboardTrendDirection;
  certainty?: Certainty;
  timestamp: number;
};

export type DashboardModel = {
  prime: DashboardItem[];
  secondary: DashboardItem[];
  background: DashboardItem[];
};

export type OrientationContextAsset = {
  symbol?: string;
  accountId?: string;
  strategyId?: string;
  alignmentState?: AlignmentState;
  trendDirection?: DashboardTrendDirection;
  certainty?: Certainty;
  timestamp: number;
};

export type OrientationContext = {
  profile: UserProfile;
  assets: OrientationContextAsset[];
};
