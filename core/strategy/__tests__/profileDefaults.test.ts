import { defaultBundleIdsForProfile } from '@/core/strategy/profileDefaults';

describe('defaultBundleIdsForProfile', () => {
  it('returns exactly 1 default bundle id per profile in P1J', () => {
    expect(defaultBundleIdsForProfile('BEGINNER')).toHaveLength(1);
    expect(defaultBundleIdsForProfile('MIDDLE')).toHaveLength(1);
    expect(defaultBundleIdsForProfile('ADVANCED')).toHaveLength(1);
  });

  it('returns deterministic ordering for each profile bundle list', () => {
    expect(defaultBundleIdsForProfile('BEGINNER')).toEqual(['beginner_core']);
    expect(defaultBundleIdsForProfile('MIDDLE')).toEqual(['middle_core']);
    expect(defaultBundleIdsForProfile('ADVANCED')).toEqual(['advanced_core']);
  });
});
