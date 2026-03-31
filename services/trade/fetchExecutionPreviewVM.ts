import { createExecutionPayloadPreview } from '@/services/trade/createExecutionPayloadPreview';
import { getExecutionAdapterCapability } from '@/services/trade/getExecutionAdapterCapability';
import type { ConfirmationSession, ExecutionPayloadType, ExecutionPreviewVM } from '@/services/trade/types';

export async function fetchExecutionPreviewVM(params: {
  confirmationSession: ConfirmationSession | null;
}): Promise<ExecutionPreviewVM> {
  const session = params.confirmationSession;

  if (!session?.shell) {
    return {
      planId: session?.planId ?? null,
      capabilityResolution: session?.executionCapability ?? null,
      adapterCapability: null,
      pathPreview: null,
      payloadPreview: null,
    };
  }

  const capabilityResolution = session.executionCapability;

  if (!capabilityResolution) {
    return {
      planId: session.planId,
      capabilityResolution: null,
      adapterCapability: null,
      pathPreview: null,
      payloadPreview: null,
    };
  }

  const adapterCapability = getExecutionAdapterCapability(capabilityResolution);
  const payloadPreview = createExecutionPayloadPreview({
    confirmationSession: session,
    capabilityResolution,
    adapterCapability,
  });

  return {
    planId: session.planId,
    capabilityResolution,
    adapterCapability,
    pathPreview: {
      planId: session.planId,
      adapterId: adapterCapability.adapterId,
      confirmationPathType: capabilityResolution.confirmationPath,
      payloadType: payloadPreview.payloadType,
      label: resolvePathLabel(payloadPreview.payloadType),
      supported: capabilityResolution.supported,
      executable: false,
    },
    payloadPreview,
  };
}

function resolvePathLabel(payloadType: ExecutionPayloadType): string {
  switch (payloadType) {
    case 'BRACKET':
      return 'Bracket payload placeholder';
    case 'OCO':
      return 'OCO payload placeholder';
    case 'SEPARATE_ORDERS':
      return 'Separate-order payload placeholder';
    default:
      return 'Execution payload unavailable';
  }
}
