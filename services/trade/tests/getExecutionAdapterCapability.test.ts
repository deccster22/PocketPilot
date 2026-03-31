import { getExecutionAdapterCapability } from '@/services/trade/getExecutionAdapterCapability';
import type { ExecutionCapabilityResolution, TradePlanConfirmationPathType } from '@/services/trade/types';

function createCapabilityResolution(
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

describe('getExecutionAdapterCapability', () => {
  it.each([
    ['BRACKET', 'adapter-preview-bracket'],
    ['OCO', 'adapter-preview-oco'],
    ['GUIDED_SEQUENCE', 'adapter-preview-separate-orders'],
    ['UNAVAILABLE', 'adapter-preview-unavailable'],
  ] as const)('returns a deterministic placeholder capability for %s paths', (pathType, adapterId) => {
    expect(getExecutionAdapterCapability(createCapabilityResolution(pathType))).toEqual({
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
