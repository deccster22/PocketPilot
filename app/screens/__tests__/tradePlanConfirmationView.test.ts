import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createTradePlanConfirmationViewData } from '@/app/screens/tradePlanConfirmationView';

describe('createTradePlanConfirmationViewData', () => {
  it('reads the prepared confirmation shell without adding capability logic', () => {
    const view = createTradePlanConfirmationViewData({
      planId: 'primary-plan',
      headline: {
        intentType: 'ACCUMULATE',
        symbol: 'BTC',
        actionState: 'READY',
      },
      readiness: {
        alignment: 'ALIGNED',
        certainty: 'HIGH',
      },
      confirmation: {
        requiresConfirmation: true,
        pathType: 'BRACKET',
        stepsLabel: 'Single confirmation flow',
        executionAvailable: false,
      },
      constraints: {
        maxPositionSize: 0.1,
      },
      placeholders: {
        orderPayloadAvailable: false,
        executionPreviewAvailable: false,
      },
    });

    expect(view).toEqual({
      planId: 'primary-plan',
      intentLabel: 'Accumulate',
      symbolLabel: 'BTC',
      actionStateText: 'Ready for confirmation',
      readinessText: 'aligned alignment | high certainty',
      confirmationText:
        'BRACKET path | Single confirmation flow | Execution remains unavailable in this phase.',
      constraintsText: 'Confirmation required | max position size 0.1',
      placeholderText: 'Order payload and execution preview remain placeholders in this phase.',
    });
  });

  it('returns null when no prepared confirmation shell is available', () => {
    expect(createTradePlanConfirmationViewData(null)).toBeNull();
  });

  it('keeps capability and execution logic out of the app screen', () => {
    const screenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'TradeHubScreen.tsx'),
      'utf8',
    );

    expect(screenSource).not.toMatch(/supportsBracketOrders/);
    expect(screenSource).not.toMatch(/supportsOCO/);
    expect(screenSource).not.toMatch(/requiresSeparateOrders/);
    expect(screenSource).not.toMatch(/executionAvailable\s*=\s*true/);
  });
});
