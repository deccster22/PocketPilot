import type { UserProfile } from '@/core/profile/types';
import type { StrategyBundleId } from '@/core/strategy/bundles';

// P1J switches profile defaults from direct strategy IDs to bundle IDs.
// Each profile maps to one deterministic core bundle that expands to a
// three-strategy sequence during active strategy resolution.
const PROFILE_DEFAULTS: Record<UserProfile, readonly StrategyBundleId[]> = {
  BEGINNER: ['beginner_core'],
  MIDDLE: ['middle_core'],
  ADVANCED: ['advanced_core'],
};

export function defaultBundleIdsForProfile(profile: UserProfile): StrategyBundleId[] {
  return [...PROFILE_DEFAULTS[profile]];
}
