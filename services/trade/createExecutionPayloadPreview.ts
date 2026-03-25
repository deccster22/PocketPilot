import type {
  ConfirmationSession,
  ExecutionAdapterCapability,
  ExecutionPayloadType,
  OrderPayloadPreview,
  TradePlanConfirmationShell,
} from '@/services/trade/types';

export function createExecutionPayloadPreview(params: {
  confirmationSession?: ConfirmationSession;
  confirmationShell?: TradePlanConfirmationShell;
  adapterCapability?: ExecutionAdapterCapability;
}): OrderPayloadPreview {
  const shell = params.confirmationSession?.shell ?? params.confirmationShell ?? null;
  const symbol =
    params.confirmationSession?.preview?.headline.symbol ?? shell?.headline.symbol ?? null;
  const payloadType = resolvePayloadType(shell);

  switch (payloadType) {
    case 'BRACKET':
      return {
        payloadType,
        symbol,
        orderCount: 1,
        fieldsPresent: ['symbol', 'entryOrderType', 'stopLossPrice', 'takeProfitPrice'],
        executable: false,
      };
    case 'OCO':
      return {
        payloadType,
        symbol,
        orderCount: 2,
        fieldsPresent: [
          'symbol',
          'entryOrderType',
          'ocoGroup',
          'stopLossPrice',
          'takeProfitPrice',
        ],
        executable: false,
      };
    case 'SEPARATE_ORDERS':
      return {
        payloadType,
        symbol,
        orderCount: 3,
        fieldsPresent: [
          'symbol',
          'entryOrderType',
          'entryPreview',
          'stopLossOrder',
          'takeProfitOrder',
        ],
        executable: false,
      };
    default:
      return {
        payloadType,
        symbol,
        orderCount: 0,
        fieldsPresent: params.adapterCapability ? ['adapterId'] : [],
        executable: false,
      };
  }
}

function resolvePayloadType(
  shell: TradePlanConfirmationShell | null,
): ExecutionPayloadType {
  if (!shell) {
    return 'UNAVAILABLE';
  }

  switch (shell.confirmation.pathType) {
    case 'BRACKET':
      return 'BRACKET';
    case 'OCO':
      return 'OCO';
    case 'GUIDED_SEQUENCE':
      return 'SEPARATE_ORDERS';
    default:
      return 'UNAVAILABLE';
  }
}
