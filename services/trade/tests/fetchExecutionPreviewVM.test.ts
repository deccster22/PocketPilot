import { fetchExecutionPreviewVM } from '@/services/trade/fetchExecutionPreviewVM';
import type {
  ConfirmationSession,
  ExecutionCapabilityResolution,
  TradePlanConfirmationPathType,
} from '@/services/trade/types';

function createSession(pathType: TradePlanConfirmationPathType): ConfirmationSession {
  const executionCapability = createExecutionCapability(pathType);

  return {
    planId: 'plan-btc',
    accountId: 'acct-live',
    executionCapability,
    preview: {
      planId: 'plan-btc',
      headline: {
        intentType: 'ACCUMULATE',
        symbol: 'BTC',
        actionState: 'READY',
      },
      rationale: {
        summary: 'summary',
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
        pathType,
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

describe('fetchExecutionPreviewVM', () => {
  it('returns a prepared non-executing execution preview VM from the confirmation session', async () => {
    const result = await fetchExecutionPreviewVM({
      confirmationSession: createSession('BRACKET'),
    });

    expect(result).toEqual({
      planId: 'plan-btc',
      capabilityResolution: {
        accountId: 'acct-live',
        path: 'BRACKET',
        confirmationPath: 'BRACKET',
        supported: true,
        unavailableReason: null,
      },
      adapterCapability: {
        adapterId: 'adapter-preview-bracket',
        supportsBracket: true,
        supportsOCO: false,
        supportsMarketBuy: true,
        supportsLimitBuy: true,
        supportsStopLoss: true,
        supportsTakeProfit: true,
      },
      pathPreview: {
        planId: 'plan-btc',
        adapterId: 'adapter-preview-bracket',
        confirmationPathType: 'BRACKET',
        payloadType: 'BRACKET',
        label: 'Bracket payload placeholder',
        supported: true,
        executable: false,
      },
      payloadPreview: {
        payloadType: 'BRACKET',
        symbol: 'BTC',
        orderCount: 1,
        fieldsPresent: ['symbol', 'entryOrderType', 'stopLossPrice', 'takeProfitPrice'],
        executable: false,
      },
    });
    expect(JSON.stringify(result)).not.toContain('hidden-signal');
  });

  it('returns null preview sections when no confirmation session shell is available', async () => {
    expect(
      await fetchExecutionPreviewVM({
        confirmationSession: {
          planId: null,
          accountId: null,
          executionCapability: null,
          preview: null,
          shell: null,
          flow: null,
        },
      }),
    ).toEqual({
      planId: null,
      capabilityResolution: null,
      adapterCapability: null,
      pathPreview: null,
      payloadPreview: null,
    });
  });
});
