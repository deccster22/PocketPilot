import type {
  ExecutionAdapterCapability,
  TradePlanConfirmationPathType,
  TradePlanConfirmationShell,
} from '@/services/trade/types';

export function getExecutionAdapterCapability(
  shell: TradePlanConfirmationShell,
): ExecutionAdapterCapability {
  switch (shell.confirmation.pathType) {
    case 'BRACKET':
      return createAdapterCapability({
        adapterId: 'adapter-preview-bracket',
        pathType: shell.confirmation.pathType,
      });
    case 'OCO':
      return createAdapterCapability({
        adapterId: 'adapter-preview-oco',
        pathType: shell.confirmation.pathType,
      });
    case 'GUIDED_SEQUENCE':
      return createAdapterCapability({
        adapterId: 'adapter-preview-separate-orders',
        pathType: shell.confirmation.pathType,
      });
    default:
      return createAdapterCapability({
        adapterId: 'adapter-preview-unavailable',
        pathType: shell.confirmation.pathType,
      });
  }
}

function createAdapterCapability(params: {
  adapterId: string;
  pathType: TradePlanConfirmationPathType;
}): ExecutionAdapterCapability {
  if (params.pathType === 'UNAVAILABLE') {
    return {
      adapterId: params.adapterId,
      supportsBracket: false,
      supportsOCO: false,
      supportsMarketBuy: false,
      supportsLimitBuy: false,
      supportsStopLoss: false,
      supportsTakeProfit: false,
    };
  }

  return {
    adapterId: params.adapterId,
    supportsBracket: params.pathType === 'BRACKET',
    supportsOCO: params.pathType === 'OCO',
    supportsMarketBuy: true,
    supportsLimitBuy: true,
    supportsStopLoss: true,
    supportsTakeProfit: true,
  };
}
