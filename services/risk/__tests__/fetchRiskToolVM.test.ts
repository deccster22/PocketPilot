import { fetchRiskToolVM } from '@/services/risk/fetchRiskToolVM';
import type { ConfirmationSession } from '@/services/trade/types';
import type { ForegroundScanResult } from '@/services/types/scan';

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
        summary:
          'Accumulation setup is supported by confirmed momentum building. Focus symbol: BTC.',
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

function createPreparedQuoteScan(
  overrides: Partial<ForegroundScanResult> = {},
): Pick<ForegroundScanResult, 'quotes'> {
  return {
    quotes: {
      BTC: {
        symbol: 'BTC',
        price: 21.5,
        estimated: false,
        source: 'execution-feed',
        timestampMs: 1_700_000_000_000,
      },
    },
    ...overrides,
  };
}

describe('fetchRiskToolVM', () => {
  it('keeps explicit user prices authoritative over prepared quote references', async () => {
    const result = await fetchRiskToolVM({
      confirmationSession: createConfirmationSession(),
      preparedQuoteScan: createPreparedQuoteScan(),
      input: {
        accountSize: 10_000,
        riskAmount: 100,
        riskPercent: null,
        entryPrice: 20,
        stopPrice: 18,
        targetPrice: 26,
        symbol: null,
        allowPreparedReferences: true,
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
        entryReference: {
          value: 20,
          source: 'USER_INPUT',
        },
        stopReference: {
          value: 18,
          source: 'USER_INPUT',
        },
        targetReference: {
          value: 26,
          source: 'USER_INPUT',
        },
        stopDistance: 2,
        riskAmount: 100,
        riskPercent: 1,
        positionSize: 50,
        rewardRiskRatio: 3,
        notes: [],
      },
    });
    expect(JSON.stringify(result)).not.toContain('execution-feed');
    expect(JSON.stringify(result)).not.toContain('BRACKET');
    expect(JSON.stringify(result)).not.toContain('acct-live');
  });

  it('uses a prepared quote entry reference when user entry is absent', async () => {
    const result = await fetchRiskToolVM({
      confirmationSession: createConfirmationSession(),
      preparedQuoteScan: createPreparedQuoteScan(),
      input: {
        accountSize: null,
        riskAmount: 100,
        riskPercent: null,
        entryPrice: null,
        stopPrice: 19,
        targetPrice: null,
        symbol: null,
        allowPreparedReferences: true,
      },
    });

    expect(result.summary).toEqual({
      state: 'READY',
      symbol: 'BTC',
      entryPrice: 21.5,
      stopPrice: 19,
      targetPrice: null,
      entryReference: {
        value: 21.5,
        source: 'PREPARED_QUOTE',
      },
      stopReference: {
        value: 19,
        source: 'USER_INPUT',
      },
      targetReference: {
        value: null,
        source: 'UNAVAILABLE',
      },
      stopDistance: 2.5,
      riskAmount: 100,
      riskPercent: null,
      positionSize: 40,
      rewardRiskRatio: null,
      notes: [],
    });
    expect(JSON.stringify(result)).not.toContain('timestampMs');
    expect(JSON.stringify(result)).not.toContain('execution-feed');
    expect(JSON.stringify(result)).not.toContain('estimated');
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
        allowPreparedReferences: true,
      },
    });

    expect(result.summary.state).toBe('UNAVAILABLE');
    expect(result.generatedAt).toBeNull();
  });

  it('treats selected-plan context as enough to show an incomplete but honest result', async () => {
    const seedSession = createConfirmationSession();
    const result = await fetchRiskToolVM({
      confirmationSession: createConfirmationSession({
        preview: {
          ...seedSession.preview!,
          headline: {
            ...seedSession.preview!.headline,
            symbol: null,
          },
        },
        shell: {
          ...seedSession.shell!,
          headline: {
            ...seedSession.shell!.headline,
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
        allowPreparedReferences: true,
      },
    });

    expect(result.summary.state).toBe('INCOMPLETE');
    expect(result.summary.notes).toEqual([
      'Add distinct entry and stop prices to frame stop distance.',
      'Add a risk amount, or combine account size with risk percent.',
    ]);
    expect(result.summary.entryReference).toEqual({
      value: null,
      source: 'UNAVAILABLE',
    });
    expect(result.summary.stopReference).toEqual({
      value: null,
      source: 'UNAVAILABLE',
    });
    expect(result.summary.targetReference).toEqual({
      value: null,
      source: 'UNAVAILABLE',
    });
  });
});
