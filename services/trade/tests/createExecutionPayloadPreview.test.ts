import { createExecutionPayloadPreview } from '@/services/trade/createExecutionPayloadPreview';
import type {
  ConfirmationSession,
  ExecutionAdapterCapability,
  TradePlanConfirmationPathType,
  TradePlanConfirmationShell,
} from '@/services/trade/types';

function createShell(
  pathType: TradePlanConfirmationPathType,
): TradePlanConfirmationShell {
  return {
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
  };
}

function createSession(
  pathType: TradePlanConfirmationPathType,
): ConfirmationSession {
  return {
    planId: 'plan-btc',
    accountId: 'acct-live',
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
    shell: createShell(pathType),
    flow: null,
  };
}

const adapterCapability: ExecutionAdapterCapability = {
  adapterId: 'adapter-preview',
  supportsBracket: true,
  supportsOCO: true,
  supportsMarketBuy: true,
  supportsLimitBuy: true,
  supportsStopLoss: true,
  supportsTakeProfit: true,
};

describe('createExecutionPayloadPreview', () => {
  it.each([
    ['BRACKET', 'BRACKET', 1, ['symbol', 'entryOrderType', 'stopLossPrice', 'takeProfitPrice']],
    [
      'OCO',
      'OCO',
      2,
      ['symbol', 'entryOrderType', 'ocoGroup', 'stopLossPrice', 'takeProfitPrice'],
    ],
    [
      'GUIDED_SEQUENCE',
      'SEPARATE_ORDERS',
      3,
      ['symbol', 'entryOrderType', 'entryPreview', 'stopLossOrder', 'takeProfitOrder'],
    ],
    ['UNAVAILABLE', 'UNAVAILABLE', 0, ['adapterId']],
  ] as const)(
    'maps %s confirmation paths to a non-executing %s payload preview',
    (pathType, payloadType, orderCount, fieldsPresent) => {
      expect(
        createExecutionPayloadPreview({
          confirmationSession: createSession(pathType),
          adapterCapability,
        }),
      ).toEqual({
        payloadType,
        symbol: 'BTC',
        orderCount,
        fieldsPresent,
        executable: false,
      });
    },
  );

  it('returns an unavailable preview when no shell is available', () => {
    expect(
      createExecutionPayloadPreview({
        confirmationSession: {
          planId: null,
          accountId: null,
          preview: null,
          shell: null,
          flow: null,
        },
      }),
    ).toEqual({
      payloadType: 'UNAVAILABLE',
      symbol: null,
      orderCount: 0,
      fieldsPresent: [],
      executable: false,
    });
  });
});
