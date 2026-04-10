import { createSubmissionIntent } from '@/services/trade/createSubmissionIntent';
import type {
  ConfirmationSession,
  ExecutionCapabilityResolution,
  ExecutionPreviewVM,
  ExecutionReadiness,
} from '@/services/trade/types';

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

function createSession(): ConfirmationSession {
  const executionCapability: ExecutionCapabilityResolution = {
    accountId: 'acct-live',
    path: 'SEPARATE_ORDERS',
    confirmationPath: 'GUIDED_SEQUENCE',
    supported: true,
    unavailableReason: null,
  };

  return {
    planId: 'plan-btc',
    accountId: 'acct-live',
    executionCapability,
    preparedRiskReferences: null,
    preview: {
      planId: 'plan-btc',
      headline: {
        intentType: 'ACCUMULATE',
        symbol: 'BTC',
        actionState: 'CAUTION',
      },
      rationale: {
        summary: 'Prepared summary',
        primaryEventId: 'event-1',
        supportingEventIds: ['event-1'],
        supportingEventCount: 1,
      },
      constraints: {
        requiresConfirmation: true,
      },
      readiness: {
        alignment: 'ALIGNED',
        certainty: 'LOW',
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
        actionState: 'CAUTION',
      },
      readiness: {
        alignment: 'ALIGNED',
        certainty: 'LOW',
      },
      confirmation: {
        requiresConfirmation: true,
        pathType: 'GUIDED_SEQUENCE',
        stepsLabel: 'Prepared steps',
        executionAvailable: false,
      },
      constraints: {},
      placeholders: {
        orderPayloadAvailable: false,
        executionPreviewAvailable: false,
      },
    },
    flow: {
      planId: 'plan-btc',
      steps: [],
      currentStepId: 'confirm-intent',
      canProceed: true,
      allRequiredAcknowledged: true,
    },
  };
}

function createExecutionPreview(): ExecutionPreviewVM {
  return {
    planId: 'plan-btc',
    capabilityResolution: {
      accountId: 'acct-live',
      path: 'SEPARATE_ORDERS',
      confirmationPath: 'GUIDED_SEQUENCE',
      supported: true,
      unavailableReason: null,
    },
    adapterCapability: {
      adapterId: 'adapter-preview-separate-orders',
      supportsBracket: false,
      supportsOCO: false,
      supportsMarketBuy: true,
      supportsLimitBuy: true,
      supportsStopLoss: true,
      supportsTakeProfit: true,
    },
    pathPreview: {
      planId: 'plan-btc',
      adapterId: 'adapter-preview-separate-orders',
      confirmationPathType: 'GUIDED_SEQUENCE',
      payloadType: 'SEPARATE_ORDERS',
      label: 'Separate-order payload placeholder',
      supported: true,
      executable: false,
    },
    payloadPreview: {
      payloadType: 'SEPARATE_ORDERS',
      symbol: 'BTC',
      orderCount: 3,
      fieldsPresent: ['symbol', 'entryPreview', 'stopLossOrder', 'takeProfitOrder'],
      executable: false,
    },
  };
}

function createReadiness(overrides?: Partial<ExecutionReadiness>): ExecutionReadiness {
  return {
    eligible: true,
    blockers: [],
    warnings: [
      {
        code: 'LOW_CERTAINTY',
        message: 'This plan is prepared with low certainty and should be reviewed carefully.',
      },
      {
        code: 'CAUTION_STATE',
        message: 'This plan is currently in a caution state even when submission becomes eligible.',
      },
    ],
    summary: {
      requiresAcknowledgement: false,
      hasUnavailablePath: false,
      hasCapabilityMismatch: false,
    },
    ...overrides,
  };
}

describe('createSubmissionIntent', () => {
  it('returns a blocked result with readiness blockers when submission is not eligible', () => {
    const result = createSubmissionIntent({
      confirmationSession: createSession(),
      executionPreview: createExecutionPreview(),
      executionReadiness: createReadiness({
        eligible: false,
        blockers: [
          {
            code: 'NOT_ACKNOWLEDGED',
            message:
              'Complete every required acknowledgement before submission can become eligible.',
          },
        ],
      }),
    });

    expect(result).toEqual({
      status: 'BLOCKED',
      blockers: [
        {
          code: 'NOT_ACKNOWLEDGED',
          message: 'Complete every required acknowledgement before submission can become eligible.',
        },
      ],
      warnings: [
        {
          code: 'LOW_CERTAINTY',
          message: 'This plan is prepared with low certainty and should be reviewed carefully.',
        },
        {
          code: 'CAUTION_STATE',
          message:
            'This plan is currently in a caution state even when submission becomes eligible.',
        },
      ],
    });
  });

  it('returns a placeholder-only ready contract when readiness is eligible', () => {
    const result = createSubmissionIntent({
      confirmationSession: createSession(),
      executionPreview: createExecutionPreview(),
      executionReadiness: createReadiness(),
    });

    expect(result).toEqual({
      status: 'READY',
      adapterType: 'SEPARATE_ORDERS',
      placeholderOnly: true,
      planId: 'plan-btc',
      accountId: 'acct-live',
      symbol: 'BTC',
      payloadPreview: [
        {
          payloadType: 'SEPARATE_ORDERS',
          symbol: 'BTC',
          orderCount: 3,
          fieldsPresent: ['symbol', 'entryPreview', 'stopLossOrder', 'takeProfitOrder'],
          executable: false,
        },
      ],
      warnings: [
        {
          code: 'LOW_CERTAINTY',
          message: 'This plan is prepared with low certainty and should be reviewed carefully.',
        },
        {
          code: 'CAUTION_STATE',
          message:
            'This plan is currently in a caution state even when submission becomes eligible.',
        },
      ],
    });
  });

  it('uses canonical capability truth instead of re-deriving adapter type from preview shape', () => {
    const confirmationSession = createSession();
    const executionPreview = createExecutionPreview();

    executionPreview.payloadPreview = {
      payloadType: 'BRACKET',
      symbol: 'BTC',
      orderCount: 3,
      fieldsPresent: ['symbol', 'entryPreview', 'stopLossOrder', 'takeProfitOrder'],
      executable: false,
    };

    const result = createSubmissionIntent({
      confirmationSession,
      executionPreview,
      executionReadiness: createReadiness(),
    });

    expect(result).toMatchObject({
      status: 'READY',
      adapterType: 'SEPARATE_ORDERS',
    });
  });

  it('remains deterministic and does not leak raw signal data', () => {
    const confirmationSession = createSession();
    const executionPreview = createExecutionPreview();
    const executionReadiness = createReadiness();

    const first = createSubmissionIntent({
      confirmationSession,
      executionPreview,
      executionReadiness,
    });
    const second = createSubmissionIntent({
      confirmationSession,
      executionPreview,
      executionReadiness,
    });

    expect(first).toEqual(second);
    expect(JSON.stringify(first)).not.toContain('signalsTriggered');
    expect(JSON.stringify(first)).not.toContain('hidden-signal');
  });

  it('does not introduce dispatch behavior into the placeholder seam', () => {
    const result = createSubmissionIntent({
      confirmationSession: createSession(),
      executionPreview: createExecutionPreview(),
      executionReadiness: createReadiness(),
    });

    expect(JSON.stringify(result)).not.toContain('dispatch');
    expect(JSON.stringify(result)).not.toContain('submitOrder');
    expect(JSON.stringify(result)).toContain('"placeholderOnly":true');
  });
});
