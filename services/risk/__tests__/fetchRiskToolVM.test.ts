import { fetchRiskToolVM } from '@/services/risk/fetchRiskToolVM';
import type { ConfirmationSession } from '@/services/trade/types';

function createConfirmationSession(
  overrides: Partial<ConfirmationSession> = {},
): ConfirmationSession {
  return {
    planId: 'plan-btc',
    accountId: 'acct-live',
    executionCapability: {
      accountId: 'acct-live',
      path: 'BRACKET',
      confirmationPath: 'BRACKET',
      supported: true,
      unavailableReason: null,
    },
    preview: {
      planId: 'plan-btc',
      headline: {
        intentType: 'ACCUMULATE',
        symbol: 'BTC',
        actionState: 'READY',
      },
      rationale: {
        summary: 'Accumulation setup is supported by confirmed momentum building. Focus symbol: BTC.',
        primaryEventId: 'event-1',
        supportingEventIds: ['event-1'],
        supportingEventCount: 1,
      },
      constraints: {
        requiresConfirmation: true,
      },
      readiness: {
        alignment: 'ALIGNED',
        certainty: 'HIGH',
      },
      placeholders: {
        orderPreviewAvailable: false,
        executionPreviewAvailable: false,
      },
    },
    shell: {
      planId: 'plan-btc',
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
      constraints: {},
      placeholders: {
        orderPayloadAvailable: false,
        executionPreviewAvailable: false,
      },
    },
    flow: null,
    ...overrides,
  };
}

describe('fetchRiskToolVM', () => {
  it('combines prepared confirmation context with explicit user inputs', async () => {
    const result = await fetchRiskToolVM({
      confirmationSession: createConfirmationSession(),
      input: {
        accountSize: 10_000,
        riskAmount: 100,
        riskPercent: null,
        entryPrice: 20,
        stopPrice: 18,
        targetPrice: 26,
        symbol: null,
      },
      nowProvider: () => 1_700_000_000_000,
    });

    expect(result).toEqual({
      generatedAt: '2023-11-14T22:13:20.000Z',
      summary: {
        state: 'READY',
        symbol: 'BTC',
        entryPrice: 20,
        stopPrice: 18,
        targetPrice: 26,
        stopDistance: 2,
        riskAmount: 100,
        riskPercent: 1,
        positionSize: 50,
        rewardRiskRatio: 3,
        notes: [],
      },
    });
    expect(JSON.stringify(result)).not.toContain('acct-live');
    expect(JSON.stringify(result)).not.toContain('BRACKET');
  });

  it('returns a calm non-result when neither prepared context nor explicit inputs exist', async () => {
    const result = await fetchRiskToolVM({
      confirmationSession: null,
      input: {
        accountSize: null,
        riskAmount: null,
        riskPercent: null,
        entryPrice: null,
        stopPrice: null,
        targetPrice: null,
        symbol: null,
      },
    });

    expect(result.summary.state).toBe('UNAVAILABLE');
    expect(result.generatedAt).toBeNull();
  });

  it('treats selected-plan context as enough to show an incomplete but honest result', async () => {
    const result = await fetchRiskToolVM({
      confirmationSession: createConfirmationSession({
        preview: {
          ...createConfirmationSession().preview!,
          headline: {
            ...createConfirmationSession().preview!.headline,
            symbol: null,
          },
        },
        shell: {
          ...createConfirmationSession().shell!,
          headline: {
            ...createConfirmationSession().shell!.headline,
            symbol: null,
          },
        },
      }),
      input: {
        accountSize: null,
        riskAmount: null,
        riskPercent: null,
        entryPrice: null,
        stopPrice: null,
        targetPrice: null,
        symbol: null,
      },
    });

    expect(result.summary.state).toBe('INCOMPLETE');
    expect(result.summary.notes).toEqual([
      'Add distinct entry and stop prices to frame stop distance.',
      'Add a risk amount, or combine account size with risk percent.',
    ]);
  });
});
