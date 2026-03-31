import { createExecutionPreviewDisplayState } from '@/services/trade/createExecutionBoundaryDisplayState';
import type { ExecutionPreviewVM } from '@/services/trade/types';

export type TradeExecutionPreviewViewData = {
  planId: string;
  adapterText: string;
  pathText: string;
  payloadText: string;
  fieldsText: string;
  executableText: string;
};

export function createTradeExecutionPreviewViewData(
  preview: ExecutionPreviewVM | null,
): TradeExecutionPreviewViewData | null {
  if (
    !preview?.pathPreview ||
    !preview.payloadPreview ||
    !preview.adapterCapability ||
    !preview.planId
  ) {
    return null;
  }

  const displayState = createExecutionPreviewDisplayState(preview);

  return {
    planId: preview.planId,
    adapterText: displayState.adapterText,
    pathText: displayState.pathText,
    payloadText: displayState.payloadText,
    fieldsText: displayState.fieldsText,
    executableText: displayState.executableText,
  };
}
