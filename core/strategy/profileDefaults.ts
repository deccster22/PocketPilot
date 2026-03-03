import type { UserProfile } from '@/core/profile/types';
import type { StrategyId } from '@/core/strategy/types';

const PROFILE_DEFAULTS: Record<UserProfile, readonly StrategyId[]> = {
  BEGINNER: ['momentum_basics', 'dip_buying', 'noop'],
  MIDDLE: ['trend_following', 'mean_reversion', 'momentum_basics'],
  ADVANCED: ['fib_levels', 'mean_reversion', 'noop'],
};

export function defaultStrategyIdsForProfile(profile: UserProfile): StrategyId[] {
  return [...PROFILE_DEFAULTS[profile]];
}
