import type {
  ConfirmationSession,
  ExecutionCapabilityResolution,
  ExecutionAdapterCapability,
  OrderPayloadPreview,
} from '@/services/trade/types';
import { resolveExecutionPayloadType } from '@/services/trade/resolveExecutionCapability';

export function createExecutionPayloadPreview(params: {
  confirmationSession?: ConfirmationSession;
  capabilityResolution?: ExecutionCapabilityResolution;
  adapterCapability?: ExecutionAdapterCapability;
}): OrderPayloadPreview {
  const shell = params.confirmationSession?.shell ?? null;
  const capabilityResolution =
    params.confirmationSession?.executionCapability ?? params.capabilityResolution ?? null;
  const symbol =
    params.confirmationSession?.preview?.headline.symbol ?? shell?.headline.symbol ?? null;
  const payloadType = capabilityResolution
    ? resolveExecutionPayloadType(capabilityResolution.path)
    : 'UNAVAILABLE';

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
