import type { UserProfile } from '@/core/profile/types';
import type { StrategyId } from '@/core/strategy/types';

const PROFILE_DEFAULTS: Record<UserProfile, readonly StrategyId[]> = {
  BEGINNER: ['data_quality', 'momentum_basics', 'noop'],
  MIDDLE: ['trend_following', 'snapshot_change', 'mean_reversion'],
  ADVANCED: ['fib_levels', 'mean_reversion', 'noop'],
};

export function defaultStrategyIdsForProfile(profile: UserProfile): StrategyId[] {
  return [...PROFILE_DEFAULTS[profile]];
}
