import { createExecutionPayloadPreview } from '@/services/trade/createExecutionPayloadPreview';
import { resolveExecutionCapability } from '@/services/trade/resolveExecutionCapability';
import type {
  ConfirmationSession,
  ExecutionAdapterCapability,
  ExecutionCapabilityResolution,
  TradePlanConfirmationPathType,
  TradePlanConfirmationShell,
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
  const executionCapability = createExecutionCapability(pathType);

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
      risk: createPreviewRisk(),
    },
    shell: createShell(pathType),
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
      return resolveExecutionCapability({
        accountId: 'acct-live',
        supportsBracketOrders: false,
        supportsOCO: false,
        requiresSeparateOrders: false,
        supportsStopLoss: false,
        supportsTakeProfit: false,
      });
  }
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
          executionCapability: null,
          preparedRiskReferences: null,
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
