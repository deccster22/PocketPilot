import type {
  AccountCapabilityContext,
  ExecutionCapabilityPath,
  ExecutionCapabilityResolution,
  ExecutionPayloadType,
} from '@/services/trade/types';

const UNAVAILABLE_REASON =
  'Account capabilities do not support a protected execution path for this plan.';

export function resolveExecutionCapability(
  capabilities: AccountCapabilityContext,
): ExecutionCapabilityResolution {
  if (
    capabilities.supportsBracketOrders &&
    capabilities.supportsStopLoss &&
    capabilities.supportsTakeProfit
  ) {
    return {
      accountId: capabilities.accountId,
      path: 'BRACKET',
      confirmationPath: 'BRACKET',
      supported: true,
      unavailableReason: null,
    };
  }

  if (
    capabilities.supportsOCO &&
    capabilities.supportsStopLoss &&
    capabilities.supportsTakeProfit
  ) {
    return {
      accountId: capabilities.accountId,
      path: 'OCO',
      confirmationPath: 'OCO',
      supported: true,
      unavailableReason: null,
    };
  }

  if (
    capabilities.requiresSeparateOrders &&
    capabilities.supportsStopLoss &&
    capabilities.supportsTakeProfit
  ) {
    return {
      accountId: capabilities.accountId,
      path: 'SEPARATE_ORDERS',
      confirmationPath: 'GUIDED_SEQUENCE',
      supported: true,
      unavailableReason: null,
    };
  }

  return {
    accountId: capabilities.accountId,
    path: 'UNAVAILABLE',
    confirmationPath: 'UNAVAILABLE',
    supported: false,
    unavailableReason: UNAVAILABLE_REASON,
  };
}

export function resolveExecutionPayloadType(
  path: ExecutionCapabilityPath,
): ExecutionPayloadType {
  return path;
}
