import type {
  ExecutionCapabilityResolution,
  ExecutionAdapterCapability,
} from '@/services/trade/types';

export function getExecutionAdapterCapability(
  capabilityResolution: ExecutionCapabilityResolution,
): ExecutionAdapterCapability {
  return createAdapterCapability(resolveAdapterId(capabilityResolution.path), capabilityResolution);
}

function resolveAdapterId(path: ExecutionCapabilityResolution['path']): string {
  switch (path) {
    case 'BRACKET':
      return 'adapter-preview-bracket';
    case 'OCO':
      return 'adapter-preview-oco';
    case 'SEPARATE_ORDERS':
      return 'adapter-preview-separate-orders';
    default:
      return 'adapter-preview-unavailable';
  }
}

function createAdapterCapability(
  adapterId: string,
  capabilityResolution: ExecutionCapabilityResolution,
): ExecutionAdapterCapability {
  if (!capabilityResolution.supported) {
    return {
      adapterId,
      supportsBracket: false,
      supportsOCO: false,
      supportsMarketBuy: false,
      supportsLimitBuy: false,
      supportsStopLoss: false,
      supportsTakeProfit: false,
    };
  }

  return {
    adapterId,
    supportsBracket: capabilityResolution.path === 'BRACKET',
    supportsOCO: capabilityResolution.path === 'OCO',
    supportsMarketBuy: true,
    supportsLimitBuy: true,
    supportsStopLoss: true,
    supportsTakeProfit: true,
  };
}
