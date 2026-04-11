import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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
      risk: {
        activeBasis: 'ACCOUNT_PERCENT',
        activeBasisLabel: 'Account %',
        basisAvailability: {
          status: 'AVAILABLE',
          selectedBasis: 'ACCOUNT_PERCENT',
          options: [
            {
              basis: 'ACCOUNT_PERCENT',
              label: 'Account %',
              isSelected: true,
            },
            {
              basis: 'FIXED_CURRENCY',
              label: 'Fixed currency',
              isSelected: false,
            },
            {
              basis: 'POSITION_PERCENT',
              label: 'Position %',
              isSelected: false,
            },
          ],
        },
        context: {
          status: 'AVAILABLE',
          basis: 'ACCOUNT_PERCENT',
          headline: 'Account % risk frame',
          summary:
            'Shows the capped loss from this prepared plan as a share of current account value using prepared references only.',
          items: [
            {
              label: 'Risk per trade',
              value: '0.50%',
            },
            {
              label: 'Max loss at cap',
              value: '$50.00',
            },
          ],
        },
      },
      positionSizing: {
        status: 'AVAILABLE',
        output: {
          sizeLabel: 'Position size (Account %)',
          sizeValue: '10 units at $1,000.00 cap',
          maxLossLabel: 'Max loss at stop',
          maxLossValue: '$50.00',
          notes: [
            'Prepared entry $100.00 to stop $95.00.',
            'Support-only readout; no order path is opened here.',
          ],
        },
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
      riskBasisText: 'Risk basis: Account %',
      riskStatusText: 'Prepared risk context available',
      riskHeadline: 'Account % risk frame',
      riskSummary:
        'Shows the capped loss from this prepared plan as a share of current account value using prepared references only.',
      riskItems: [
        {
          label: 'Risk per trade',
          value: '0.50%',
        },
        {
          label: 'Max loss at cap',
          value: '$50.00',
        },
      ],
      positionSizing: {
        statusText: 'Prepared sizing available',
        headline: 'Position size (Account %)',
        summary: 'Shows the prepared position size and stop-based max loss from this selected plan.',
        details: [
          {
            label: 'Position size',
            value: '10 units at $1,000.00 cap',
          },
          {
            label: 'Max loss at stop',
            value: '$50.00',
          },
        ],
        notes: [
          'Prepared entry $100.00 to stop $95.00.',
          'Support-only readout; no order path is opened here.',
        ],
      },
      confirmationText:
        'This is a framed plan preview only. A future confirmation step is still required.',
      placeholderText: 'Order and execution previews are placeholder-only in this phase.',
    });
  });

  it('returns null when no prepared preview is available', () => {
    expect(createTradePlanPreviewViewData(null)).toBeNull();
  });

  it('keeps position-sizing math out of the app view helper', () => {
    const source = readFileSync(join(process.cwd(), 'app', 'screens', 'tradePlanPreviewView.ts'), 'utf8');

    expect(source).not.toMatch(/Math\.abs/);
    expect(source).not.toMatch(/positionValue\s*\/\s*entryPrice/);
    expect(source).not.toMatch(/maxLoss\s*\/\s*accountValue/);
    expect(source).toMatch(/createPositionSizingViewData/);
  });
});
