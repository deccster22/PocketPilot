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

  return {
    planId: preview.planId,
    adapterText: `Adapter ${preview.adapterCapability.adapterId}`,
    pathText: `${preview.pathPreview.confirmationPathType} path | ${preview.pathPreview.label}`,
    payloadText: `${preview.payloadPreview.payloadType} placeholder | ${preview.payloadPreview.orderCount} order preview${
      preview.payloadPreview.orderCount === 1 ? '' : 's'
    }`,
    fieldsText: preview.payloadPreview.fieldsPresent.length
      ? `Fields: ${preview.payloadPreview.fieldsPresent.join(', ')}`
      : 'Fields: none available in this phase.',
    executableText: preview.payloadPreview.executable
      ? 'Executable payload available.'
      : 'Executable is always false in this phase.',
  };
}
