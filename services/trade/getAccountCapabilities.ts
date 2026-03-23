import type { AccountCapabilityContext } from '@/services/trade/types';

const DEFAULT_CAPABILITIES_BY_ACCOUNT: Record<string, AccountCapabilityContext> = {
  'acct-live': {
    accountId: 'acct-live',
    brokerId: 'broker-demo',
    supportsBracketOrders: true,
    supportsOCO: true,
    requiresSeparateOrders: false,
    supportsStopLoss: true,
    supportsTakeProfit: true,
  },
  'acct-basic': {
    accountId: 'acct-basic',
    brokerId: 'broker-demo-basic',
    supportsBracketOrders: false,
    supportsOCO: false,
    requiresSeparateOrders: true,
    supportsStopLoss: true,
    supportsTakeProfit: true,
  },
  'acct-manual': {
    accountId: 'acct-manual',
    brokerId: 'broker-demo-manual',
    supportsBracketOrders: false,
    supportsOCO: false,
    requiresSeparateOrders: false,
    supportsStopLoss: false,
    supportsTakeProfit: false,
  },
};

export async function getAccountCapabilities(
  accountId: string,
): Promise<AccountCapabilityContext> {
  const matched = DEFAULT_CAPABILITIES_BY_ACCOUNT[accountId];

  if (matched) {
    return matched;
  }

  return {
    accountId,
    brokerId: 'broker-demo',
    supportsBracketOrders: false,
    supportsOCO: false,
    requiresSeparateOrders: true,
    supportsStopLoss: true,
    supportsTakeProfit: true,
  };
}
