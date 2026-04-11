import { fetchExecutionReadinessVM } from '@/services/trade/fetchExecutionReadinessVM';
import type {
  ConfirmationSession,
  ExecutionCapabilityResolution,
  ExecutionPreviewVM,
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
      positionSizing: {
        status: 'UNAVAILABLE',
        reason: 'INSUFFICIENT_INPUTS',
      },
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

function createPreview(): ExecutionPreviewVM {
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
      fieldsPresent: ['symbol', 'entryPreview'],
      executable: false,
    },
  };
}

describe('fetchExecutionReadinessVM', () => {
  it('returns a prepared readiness VM from the confirmation session and execution preview', async () => {
    const result = await fetchExecutionReadinessVM({
      confirmationSession: createSession(),
      executionPreview: createPreview(),
    });

    expect(result).toEqual({
      eligible: true,
      blockers: [],
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
        {
          code: 'PARTIAL_CAPABILITY',
          message:
            'The prepared path relies on separate-order scaffolding instead of a native combined order path.',
        },
      ],
      summary: {
        requiresAcknowledgement: false,
        hasUnavailablePath: false,
        hasCapabilityMismatch: false,
      },
    });
  });

  it('returns a deterministic no-plan readiness VM when there is no selected session', async () => {
    expect(
      await fetchExecutionReadinessVM({
        confirmationSession: {
          planId: null,
          accountId: null,
          executionCapability: null,
          preparedRiskReferences: null,
          preview: null,
          shell: null,
          flow: null,
        },
        executionPreview: {
          planId: null,
          capabilityResolution: null,
          adapterCapability: null,
          pathPreview: null,
          payloadPreview: null,
        },
      }),
    ).toEqual({
      eligible: false,
      blockers: [
        {
          code: 'NO_PLAN_SELECTED',
          message: 'Select a confirmation plan before submission can become eligible.',
        },
      ],
      warnings: [],
      summary: {
        requiresAcknowledgement: false,
        hasUnavailablePath: false,
        hasCapabilityMismatch: false,
      },
    });
  });
});
