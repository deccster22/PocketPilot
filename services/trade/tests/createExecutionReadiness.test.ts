import { createExecutionReadiness } from '@/services/trade/createExecutionReadiness';
import type {
  ConfirmationSession,
  ExecutionAdapterCapability,
  ExecutionCapabilityResolution,
  ExecutionPreviewVM,
  TradeHubActionState,
  TradePlanConfirmationPathType,
} from '@/services/trade/types';

function createSession(params?: {
  planId?: string | null;
  allRequiredAcknowledged?: boolean;
  certainty?: 'HIGH' | 'MEDIUM' | 'LOW';
  actionState?: TradeHubActionState;
  pathType?: TradePlanConfirmationPathType;
}): ConfirmationSession {
  const pathType = params?.pathType ?? 'BRACKET';
  const executionCapability = createExecutionCapability(pathType);

  return {
    planId: params?.planId ?? 'plan-btc',
    accountId: params?.planId === null ? null : 'acct-live',
    executionCapability: params?.planId === null ? null : executionCapability,
    preview: {
      planId: params?.planId ?? 'plan-btc',
      headline: {
        intentType: 'ACCUMULATE',
        symbol: 'BTC',
        actionState: params?.actionState ?? 'READY',
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
        certainty: params?.certainty ?? 'HIGH',
      },
      placeholders: {
        orderPreviewAvailable: false,
        executionPreviewAvailable: false,
      },
    },
    shell:
      params?.planId === null
        ? null
        : {
            planId: params?.planId ?? 'plan-btc',
            headline: {
              intentType: 'ACCUMULATE',
              symbol: 'BTC',
              actionState: params?.actionState ?? 'READY',
            },
            readiness: {
              alignment: 'ALIGNED',
              certainty: params?.certainty ?? 'HIGH',
            },
            confirmation: {
              requiresConfirmation: true,
              pathType,
              stepsLabel: 'Prepared steps',
              executionAvailable: false,
            },
            constraints: {},
            placeholders: {
              orderPayloadAvailable: false,
              executionPreviewAvailable: false,
            },
          },
    flow:
      params?.planId === null
        ? null
        : {
            planId: params?.planId ?? 'plan-btc',
            steps: [],
            currentStepId: 'review',
            canProceed: params?.allRequiredAcknowledged ?? false,
            allRequiredAcknowledged: params?.allRequiredAcknowledged ?? false,
            blockedReason:
              (params?.allRequiredAcknowledged ?? false)
                ? undefined
                : 'Complete all required confirmation steps before proceeding.',
          },
  };
}

function createCapability(
  overrides: Partial<ExecutionAdapterCapability> = {},
): ExecutionAdapterCapability {
  return {
    adapterId: 'adapter-preview',
    supportsBracket: true,
    supportsOCO: true,
    supportsMarketBuy: true,
    supportsLimitBuy: true,
    supportsStopLoss: true,
    supportsTakeProfit: true,
    ...overrides,
  };
}

function createPreview(params?: {
  pathType?: TradePlanConfirmationPathType;
  capability?: ExecutionAdapterCapability | null;
  capabilityResolution?: ExecutionCapabilityResolution | null;
}): ExecutionPreviewVM {
  const pathType = params?.pathType ?? 'BRACKET';
  const capabilityResolution = params?.capabilityResolution ?? createExecutionCapability(pathType);
  const payloadType =
    capabilityResolution.path;

  return {
    planId: 'plan-btc',
    capabilityResolution,
    adapterCapability: params?.capability ?? createCapability(),
    pathPreview: {
      planId: 'plan-btc',
      adapterId: 'adapter-preview',
      confirmationPathType: capabilityResolution.confirmationPath,
      payloadType,
      label: 'Prepared path',
      supported: capabilityResolution.supported,
      executable: false,
    },
    payloadPreview: {
      payloadType,
      symbol: 'BTC',
      orderCount: payloadType === 'SEPARATE_ORDERS' ? 3 : payloadType === 'OCO' ? 2 : 1,
      fieldsPresent: ['symbol'],
      executable: false,
    },
  };
}

function createExecutionCapability(
  pathType: TradePlanConfirmationPathType,
): ExecutionCapabilityResolution {
  switch (pathType) {
    case 'BRACKET':
      return {
        accountId: 'acct-live',
        path: 'BRACKET',
        confirmationPath: 'BRACKET',
        supported: true,
        unavailableReason: null,
      };
    case 'OCO':
      return {
        accountId: 'acct-live',
        path: 'OCO',
        confirmationPath: 'OCO',
        supported: true,
        unavailableReason: null,
      };
    case 'GUIDED_SEQUENCE':
      return {
        accountId: 'acct-live',
        path: 'SEPARATE_ORDERS',
        confirmationPath: 'GUIDED_SEQUENCE',
        supported: true,
        unavailableReason: null,
      };
    default:
      return {
        accountId: 'acct-live',
        path: 'UNAVAILABLE',
        confirmationPath: 'UNAVAILABLE',
        supported: false,
        unavailableReason:
          'Account capabilities do not support a protected execution path for this plan.',
      };
  }
}

describe('createExecutionReadiness', () => {
  it('blocks submission when required acknowledgement is still pending', () => {
    const result = createExecutionReadiness({
      confirmationSession: createSession({ allRequiredAcknowledged: false }),
      executionPreview: createPreview(),
    });

    expect(result).toEqual({
      eligible: false,
      blockers: [
        {
          code: 'NOT_ACKNOWLEDGED',
          message: 'Complete every required acknowledgement before submission can become eligible.',
        },
      ],
      warnings: [],
      summary: {
        requiresAcknowledgement: true,
        hasUnavailablePath: false,
        hasCapabilityMismatch: false,
      },
    });
  });

  it('blocks submission when the prepared path is unavailable', () => {
    const result = createExecutionReadiness({
      confirmationSession: createSession({
        allRequiredAcknowledged: true,
        pathType: 'UNAVAILABLE',
      }),
      executionPreview: createPreview({ pathType: 'UNAVAILABLE' }),
    });

    expect(result.blockers).toEqual([
      {
        code: 'UNAVAILABLE_PATH',
        message: 'The current confirmation session has no available execution path.',
      },
    ]);
    expect(result.eligible).toBe(false);
    expect(result.summary.hasUnavailablePath).toBe(true);
  });

  it('blocks submission when the prepared preview diverges from canonical capability truth', () => {
    const result = createExecutionReadiness({
      confirmationSession: createSession({ allRequiredAcknowledged: true, pathType: 'BRACKET' }),
      executionPreview: createPreview({
        pathType: 'BRACKET',
        capabilityResolution: createExecutionCapability('OCO'),
      }),
    });

    expect(result.blockers).toEqual([
      {
        code: 'CAPABILITY_MISSING',
        message: 'The prepared adapter capability does not support the selected confirmation path.',
      },
    ]);
    expect(result.eligible).toBe(false);
    expect(result.summary.hasCapabilityMismatch).toBe(true);
  });

  it('returns eligible true when plan, acknowledgements, path, and capability are all valid', () => {
    const result = createExecutionReadiness({
      confirmationSession: createSession({ allRequiredAcknowledged: true }),
      executionPreview: createPreview(),
    });

    expect(result).toEqual({
      eligible: true,
      blockers: [],
      warnings: [],
      summary: {
        requiresAcknowledgement: false,
        hasUnavailablePath: false,
        hasCapabilityMismatch: false,
      },
    });
  });

  it('preserves warnings without blocking eligibility', () => {
    const result = createExecutionReadiness({
      confirmationSession: createSession({
        allRequiredAcknowledged: true,
        certainty: 'LOW',
        actionState: 'CAUTION',
        pathType: 'GUIDED_SEQUENCE',
      }),
      executionPreview: createPreview({ pathType: 'GUIDED_SEQUENCE' }),
    });

    expect(result.eligible).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.warnings).toEqual([
      {
        code: 'LOW_CERTAINTY',
        message: 'This plan is prepared with low certainty and should be reviewed carefully.',
      },
      {
        code: 'CAUTION_STATE',
        message: 'This plan is currently in a caution state even when submission becomes eligible.',
      },
      {
        code: 'PARTIAL_CAPABILITY',
        message:
          'The prepared path relies on separate-order scaffolding instead of a native combined order path.',
      },
    ]);
  });

  it('returns deterministic output without leaking raw signal data', () => {
    const confirmationSession = createSession({
      allRequiredAcknowledged: true,
      certainty: 'LOW',
      actionState: 'CAUTION',
      pathType: 'GUIDED_SEQUENCE',
    });
    const executionPreview = createPreview({ pathType: 'GUIDED_SEQUENCE' });

    const first = createExecutionReadiness({
      confirmationSession,
      executionPreview,
    });
    const second = createExecutionReadiness({
      confirmationSession,
      executionPreview,
    });

    expect(first).toEqual(second);
    expect(JSON.stringify(first)).not.toContain('signalsTriggered');
    expect(JSON.stringify(first)).not.toContain('hidden-signal');
  });

  it('blocks submission when no plan is selected', () => {
    const result = createExecutionReadiness({
      confirmationSession: {
        planId: null,
        accountId: null,
        executionCapability: null,
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
    });

    expect(result).toEqual({
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
