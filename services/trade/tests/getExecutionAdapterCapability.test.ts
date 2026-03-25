import { getExecutionAdapterCapability } from '@/services/trade/getExecutionAdapterCapability';
import type { TradePlanConfirmationShell, TradePlanConfirmationPathType } from '@/services/trade/types';

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

describe('getExecutionAdapterCapability', () => {
  it.each([
    ['BRACKET', 'adapter-preview-bracket'],
    ['OCO', 'adapter-preview-oco'],
    ['GUIDED_SEQUENCE', 'adapter-preview-separate-orders'],
    ['UNAVAILABLE', 'adapter-preview-unavailable'],
  ] as const)('returns a deterministic placeholder capability for %s paths', (pathType, adapterId) => {
    expect(getExecutionAdapterCapability(createShell(pathType))).toEqual({
      adapterId,
      supportsBracket: pathType === 'BRACKET',
      supportsOCO: pathType === 'OCO',
      supportsMarketBuy: pathType !== 'UNAVAILABLE',
      supportsLimitBuy: pathType !== 'UNAVAILABLE',
      supportsStopLoss: pathType !== 'UNAVAILABLE',
      supportsTakeProfit: pathType !== 'UNAVAILABLE',
    });
  });
});
