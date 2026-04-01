import {
  createReorientationDismissState,
  createReorientationVisibilityInput,
  EMPTY_REORIENTATION_DISMISS_STATE,
  shouldClearPersistedReorientationDismissState,
  shouldHonorPersistedReorientationDismissal,
} from '@/services/orientation/reorientationPersistence';
import type { ReorientationEligibility } from '@/services/orientation/types';

const availableSummary: ReorientationEligibility = {
  status: 'AVAILABLE',
  profileId: 'BEGINNER',
  inactiveDays: 32,
  headline: 'A few meaningful shifts were prepared while you were away.',
  summaryItems: [
    {
      kind: 'ACCOUNT_CONTEXT',
      label: 'Data context',
      detail: 'Some recent market context was captured with data quality limits in view.',
    },
  ],
  generatedFrom: {
    lastActiveAt: '2026-02-28T00:00:00.000Z',
    now: '2026-04-01T00:00:00.000Z',
  },
  maxItems: 3,
};

describe('reorientationPersistence', () => {
  it('creates a minimal persisted dismiss state from the prepared summary boundary', () => {
    expect(createReorientationDismissState(availableSummary)).toEqual({
      dismissedAt: '2026-04-01T00:00:00.000Z',
    });
  });

  it('returns an empty dismiss state when no summary is available', () => {
    expect(
      createReorientationDismissState({
        status: 'NOT_NEEDED',
        reason: 'NO_MEANINGFUL_CHANGE',
      }),
    ).toEqual(EMPTY_REORIENTATION_DISMISS_STATE);
  });

  it('honors persisted dismissal for the same reorientation cycle across reloads', () => {
    expect(
      shouldHonorPersistedReorientationDismissal({
        summary: availableSummary,
        dismissState: {
          dismissedAt: '2026-04-01T00:00:00.000Z',
        },
      }),
    ).toBe(true);
  });

  it('stops honoring persisted dismissal when a newer reorientation cycle appears', () => {
    const newerSummary: ReorientationEligibility = {
      ...availableSummary,
      generatedFrom: {
        lastActiveAt: '2026-04-05T00:00:00.000Z',
        now: '2026-05-10T00:00:00.000Z',
      },
      inactiveDays: 35,
    };

    expect(
      shouldHonorPersistedReorientationDismissal({
        summary: newerSummary,
        dismissState: {
          dismissedAt: '2026-04-01T00:00:00.000Z',
        },
      }),
    ).toBe(false);
    expect(
      shouldClearPersistedReorientationDismissState({
        summary: newerSummary,
        dismissState: {
          dismissedAt: '2026-04-01T00:00:00.000Z',
        },
      }),
    ).toBe(true);
  });

  it('creates explicit visibility input without adding hidden notification mechanics', () => {
    expect(
      createReorientationVisibilityInput({
        summary: availableSummary,
        dismissState: {
          dismissedAt: '2026-04-01T00:00:00.000Z',
        },
      }),
    ).toEqual({
      dismissedAt: '2026-04-01T00:00:00.000Z',
      currentSessionDismissed: undefined,
    });
  });

  it('remains deterministic for identical summary and persisted state inputs', () => {
    const params = {
      summary: availableSummary,
      dismissState: {
        dismissedAt: '2026-04-01T00:00:00.000Z',
      },
      currentSessionDismissed: true,
    };

    expect(createReorientationVisibilityInput(params)).toEqual(
      createReorientationVisibilityInput(params),
    );
  });
});
