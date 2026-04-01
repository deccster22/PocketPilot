import { createReorientationSummaryViewData } from '@/app/screens/reorientationSummaryView';

describe('createReorientationSummaryViewData', () => {
  it('renders the prepared available contract without rebuilding meaning in app', () => {
    expect(
      createReorientationSummaryViewData({
        status: 'AVAILABLE',
        profileId: 'BEGINNER',
        inactiveDays: 32,
        headline: 'Welcome back. Here is a quick briefing to help you get your bearings.',
        summaryItems: [
          {
            kind: 'PRICE_CHANGE',
            label: 'BTC movement',
            detail: 'Price context for BTC shifted by 4.00% since your last active session.',
          },
        ],
        generatedFrom: {
          lastActiveAt: '2026-02-28T00:00:00.000Z',
          now: '2026-04-01T00:00:00.000Z',
        },
        maxItems: 3,
      }),
    ).toEqual({
      visible: true,
      headline: 'Welcome back. Here is a quick briefing to help you get your bearings.',
      inactiveDaysText: '32 days since your last active session',
      summaryItems: [
        {
          label: 'BTC movement',
          detail: 'Price context for BTC shifted by 4.00% since your last active session.',
        },
      ],
    });
  });

  it('keeps the card hidden when the service says reorientation is not needed', () => {
    expect(
      createReorientationSummaryViewData({
        status: 'NOT_NEEDED',
        reason: 'BELOW_THRESHOLD',
      }),
    ).toEqual({
      visible: false,
    });
  });
});
