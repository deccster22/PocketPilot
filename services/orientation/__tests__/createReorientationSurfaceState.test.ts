import { createReorientationSurfaceState } from '@/services/orientation/createReorientationSurfaceState';
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

describe('createReorientationSurfaceState', () => {
  it('keeps the card visible when the prepared summary is available and not dismissed', () => {
    expect(
      createReorientationSurfaceState({
        summary: availableSummary,
      }),
    ).toEqual({
      status: 'VISIBLE',
      reason: 'AVAILABLE',
      summary: availableSummary,
      dismissible: true,
    });
  });

  it('hides the card when the prepared summary is not needed', () => {
    expect(
      createReorientationSurfaceState({
        summary: {
          status: 'NOT_NEEDED',
          reason: 'NO_MEANINGFUL_CHANGE',
        },
      }),
    ).toEqual({
      status: 'HIDDEN',
      reason: 'NOT_NEEDED',
      summary: null,
      dismissible: false,
    });
  });

  it('hides the card when visibility input marks the summary dismissed', () => {
    expect(
      createReorientationSurfaceState({
        summary: availableSummary,
        visibility: {
          dismissedAt: '2026-04-01T00:00:00.000Z',
        },
      }),
    ).toEqual({
      status: 'HIDDEN',
      reason: 'DISMISSED',
      summary: availableSummary,
      dismissible: true,
    });
  });

  it('is deterministic for identical summary and visibility inputs', () => {
    const params = {
      summary: availableSummary,
      visibility: {
        dismissedAt: '2026-04-01T00:00:00.000Z',
      },
    };

    expect(createReorientationSurfaceState(params)).toEqual(createReorientationSurfaceState(params));
  });
});
