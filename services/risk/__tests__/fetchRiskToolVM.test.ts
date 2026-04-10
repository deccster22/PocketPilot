import { fetchRiskToolVM } from '@/services/risk/fetchRiskToolVM';
import type { ConfirmationSession } from '@/services/trade/types';
import type { ForegroundScanResult } from '@/services/types/scan';

function createPreviewRisk() {
  return {
    activeBasis: 'ACCOUNT_PERCENT' as const,
    activeBasisLabel: 'Account %',
    basisAvailability: {
      status: 'AVAILABLE' as const,
      selectedBasis: 'ACCOUNT_PERCENT' as const,
      options: [
        {
          basis: 'ACCOUNT_PERCENT' as const,
          label: 'Account %',
          isSelected: true,
        },
        {
          basis: 'FIXED_CURRENCY' as const,
          label: 'Fixed currency',
          isSelected: false,
        },
        {
          basis: 'POSITION_PERCENT' as const,
          label: 'Position %',
          isSelected: false,
        },
      ],
    },
    context: {
      status: 'UNAVAILABLE' as const,
      basis: 'ACCOUNT_PERCENT' as const,
      headline: 'Account % risk frame unavailable',
      summary:
        'PocketPilot can frame this basis once prepared entry, stop, and position-cap context are all available.',
      items: [
        {
          label: 'Needed',
          value: 'Prepared entry, prepared stop, and a prepared position cap',
        },
      ],
      reason: 'MISSING_PRICE_REFERENCES' as const,
    },
  };
}

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
    preparedRiskReferences: null,
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
      risk: createPreviewRisk(),
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
      confirmationSession: createConfirmationSession({
        preparedRiskReferences: {
          entryPrice: 21,
          stopPrice: 17,
          targetPrice: 30,
        },
      }),
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

  it('uses prepared plan references from the selected trade context when user values are absent', async () => {
    const result = await fetchRiskToolVM({
      confirmationSession: createConfirmationSession({
        preparedRiskReferences: {
          entryPrice: 20.5,
          stopPrice: 19,
          targetPrice: 24.5,
        },
      }),
      preparedQuoteScan: createPreparedQuoteScan(),
      input: {
        accountSize: null,
        riskAmount: 100,
        riskPercent: null,
        entryPrice: null,
        stopPrice: null,
        targetPrice: null,
        symbol: null,
        allowPreparedReferences: true,
      },
    });

    expect(result.summary).toEqual({
      state: 'READY',
      symbol: 'BTC',
      entryPrice: 20.5,
      stopPrice: 19,
      targetPrice: 24.5,
      entryReference: {
        value: 20.5,
        source: 'PREPARED_PLAN',
      },
      stopReference: {
        value: 19,
        source: 'PREPARED_PLAN',
      },
      targetReference: {
        value: 24.5,
        source: 'PREPARED_PLAN',
      },
      stopDistance: 1.5,
      riskAmount: 100,
      riskPercent: null,
      positionSize: 66.66666666666667,
      rewardRiskRatio: 2.6666666666666665,
      notes: [],
    });
    expect(JSON.stringify(result)).not.toContain('executionAvailable');
    expect(JSON.stringify(result)).not.toContain('payloadPreview');
    expect(JSON.stringify(result)).not.toContain('execution-feed');
    expect(JSON.stringify(result)).not.toContain('timestampMs');
  });

  it('keeps a producer-provided plan entry reference ahead of quote help while exits stay honest', async () => {
    const result = await fetchRiskToolVM({
      confirmationSession: createConfirmationSession({
        preparedRiskReferences: {
          entryPrice: 20.5,
          stopPrice: null,
          targetPrice: null,
        },
      }),
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

    expect(result.summary.entryReference).toEqual({
      value: 20.5,
      source: 'PREPARED_PLAN',
    });
    expect(result.summary.stopReference).toEqual({
      value: 19,
      source: 'USER_INPUT',
    });
    expect(result.summary.targetReference).toEqual({
      value: null,
      source: 'UNAVAILABLE',
    });
    expect(result.summary.entryPrice).toBe(20.5);
    expect(JSON.stringify(result)).not.toContain('execution-feed');
  });

  it('labels prepared plan stop references as PREPARED_PLAN without implying execution authority', async () => {
    const result = await fetchRiskToolVM({
      confirmationSession: createConfirmationSession({
        preparedRiskReferences: {
          entryPrice: 104,
          stopPrice: 100,
          targetPrice: null,
        },
      }),
      preparedQuoteScan: createPreparedQuoteScan(),
      input: {
        accountSize: null,
        riskAmount: 80,
        riskPercent: null,
        entryPrice: null,
        stopPrice: null,
        targetPrice: null,
        symbol: null,
        allowPreparedReferences: true,
      },
    });

    expect(result.summary.entryReference).toEqual({
      value: 104,
      source: 'PREPARED_PLAN',
    });
    expect(result.summary.stopReference).toEqual({
      value: 100,
      source: 'PREPARED_PLAN',
    });
    expect(result.summary.targetReference).toEqual({
      value: null,
      source: 'UNAVAILABLE',
    });
    expect(result.summary.state).toBe('READY');
    expect(JSON.stringify(result)).not.toContain('executionAvailable');
    expect(JSON.stringify(result)).not.toContain('confirmationPath');
    expect(JSON.stringify(result)).not.toContain('BRACKET');
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
