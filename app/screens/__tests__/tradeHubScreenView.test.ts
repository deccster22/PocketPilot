import { createTradeHubScreenViewData } from '@/app/screens/tradeHubScreenView';

describe('createTradeHubScreenViewData', () => {
  it('reads the prepared Trade Hub surface contract without re-prioritising it', () => {
    const view = createTradeHubScreenViewData({
      primaryPlan: {
        planId: 'primary-plan',
        intentType: 'ACCUMULATE',
        symbol: 'BTC',
        alignment: 'ALIGNED',
        certainty: 'HIGH',
        summary: 'Accumulation setup is supported by confirmed momentum building. Focus symbol: BTC.',
        supportingEventCount: 2,
        actionState: 'READY',
      },
      alternativePlans: [
        {
          planId: 'alt-plan',
          intentType: 'HOLD',
          symbol: 'ETH',
          alignment: 'NEUTRAL',
          certainty: 'MEDIUM',
          summary: 'Hold for now while price movement is monitored without a clearer setup.',
          supportingEventCount: 1,
          actionState: 'CAUTION',
        },
      ],
      meta: {
        hasPrimaryPlan: true,
        profile: 'ADVANCED',
        requiresConfirmation: true,
      },
    });

    expect(view).toEqual({
      profileLabel: 'ADVANCED',
      safetyText: 'Trade Hub frames possible actions only. Nothing here executes a trade.',
      confirmationText: 'Every action remains confirmation-safe and non-executing in this phase.',
      primaryPlan: {
        planId: 'primary-plan',
        intentLabel: 'Accumulate',
        symbolLabel: 'BTC',
        summary:
          'Accumulation setup is supported by confirmed momentum building. Focus symbol: BTC.',
        alignmentText: 'aligned',
        certaintyText: 'high',
        actionStateText: 'Ready for confirmation',
        supportingEventsText: '2 supporting events',
      },
      alternativePlans: [
        {
          planId: 'alt-plan',
          intentLabel: 'Hold',
          symbolLabel: 'ETH',
          summary: 'Hold for now while price movement is monitored without a clearer setup.',
          alignmentText: 'neutral',
          certaintyText: 'medium',
          actionStateText: 'Caution before confirmation',
          supportingEventsText: '1 supporting event',
        },
      ],
    });
  });

  it('returns null when the prepared trade hub surface is unavailable', () => {
    expect(createTradeHubScreenViewData(null)).toBeNull();
  });
});
