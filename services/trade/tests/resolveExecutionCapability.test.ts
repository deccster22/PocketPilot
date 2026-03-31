import {
  resolveExecutionCapability,
  resolveExecutionPayloadType,
} from '@/services/trade/resolveExecutionCapability';
import type { AccountCapabilityContext } from '@/services/trade/types';

function createCapabilities(
  overrides: Partial<AccountCapabilityContext> = {},
): AccountCapabilityContext {
  return {
    accountId: 'acct-live',
    brokerId: 'broker-demo',
    supportsBracketOrders: false,
    supportsOCO: false,
    requiresSeparateOrders: false,
    supportsStopLoss: false,
    supportsTakeProfit: false,
    ...overrides,
  };
}

describe('resolveExecutionCapability', () => {
  it.each([
    [
      'BRACKET',
      createCapabilities({
        supportsBracketOrders: true,
        supportsStopLoss: true,
        supportsTakeProfit: true,
      }),
      {
        accountId: 'acct-live',
        path: 'BRACKET',
        confirmationPath: 'BRACKET',
        supported: true,
        unavailableReason: null,
      },
    ],
    [
      'OCO',
      createCapabilities({
        supportsOCO: true,
        supportsStopLoss: true,
        supportsTakeProfit: true,
      }),
      {
        accountId: 'acct-live',
        path: 'OCO',
        confirmationPath: 'OCO',
        supported: true,
        unavailableReason: null,
      },
    ],
    [
      'SEPARATE_ORDERS',
      createCapabilities({
        requiresSeparateOrders: true,
        supportsStopLoss: true,
        supportsTakeProfit: true,
      }),
      {
        accountId: 'acct-live',
        path: 'SEPARATE_ORDERS',
        confirmationPath: 'GUIDED_SEQUENCE',
        supported: true,
        unavailableReason: null,
      },
    ],
    [
      'UNAVAILABLE',
      createCapabilities(),
      {
        accountId: 'acct-live',
        path: 'UNAVAILABLE',
        confirmationPath: 'UNAVAILABLE',
        supported: false,
        unavailableReason:
          'Account capabilities do not support a protected execution path for this plan.',
      },
    ],
  ] as const)('returns the canonical %s resolution deterministically', (_, capabilities, expected) => {
    expect(resolveExecutionCapability(capabilities)).toEqual(expected);
    expect(resolveExecutionCapability(capabilities)).toEqual(expected);
  });

  it('maps canonical execution paths to payload-preview paths without local reinterpretation', () => {
    expect(resolveExecutionPayloadType('BRACKET')).toBe('BRACKET');
    expect(resolveExecutionPayloadType('OCO')).toBe('OCO');
    expect(resolveExecutionPayloadType('SEPARATE_ORDERS')).toBe('SEPARATE_ORDERS');
    expect(resolveExecutionPayloadType('UNAVAILABLE')).toBe('UNAVAILABLE');
  });
});
