import { createTradePlanPreviewViewData } from '@/app/screens/tradePlanPreviewView';

describe('createTradePlanPreviewViewData', () => {
  it('reads the prepared trade plan preview contract without adding execution logic', () => {
    const view = createTradePlanPreviewViewData({
      planId: 'primary-plan',
      headline: {
        intentType: 'ACCUMULATE',
        symbol: 'BTC',
        actionState: 'READY',
      },
      rationale: {
        summary:
          'Accumulation setup is supported by confirmed momentum building. Focus symbol: BTC.',
        primaryEventId: 'event-1',
        supportingEventIds: ['event-1', 'event-2'],
        supportingEventCount: 2,
      },
      constraints: {
        requiresConfirmation: true,
        maxPositionSize: 0.1,
      },
      readiness: {
        alignment: 'ALIGNED',
        certainty: 'HIGH',
      },
      placeholders: {
        orderPreviewAvailable: false,
        executionPreviewAvailable: false,
      },
    });

    expect(view).toEqual({
      planId: 'primary-plan',
      intentLabel: 'Accumulate',
      symbolLabel: 'BTC',
      actionStateText: 'Ready for confirmation',
      rationaleSummary:
        'Accumulation setup is supported by confirmed momentum building. Focus symbol: BTC.',
      rationaleTraceText: '2 supporting events | primary event event-1',
      readinessText: 'aligned alignment | high certainty',
      constraintsText: 'Confirmation required | max position size 0.1',
      confirmationText:
        'This is a framed plan preview only. A future confirmation step is still required.',
      placeholderText: 'Order and execution previews are placeholder-only in this phase.',
    });
  });

  it('returns null when no prepared preview is available', () => {
    expect(createTradePlanPreviewViewData(null)).toBeNull();
  });
});
