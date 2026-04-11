import { renderPreparedExportFile } from '@/services/insights/renderPreparedExportFile';
import type {
  PreparedExportDispatchResult,
  PreparedExportRequestVM,
} from '@/services/insights/types';

export type ExportDispatchAdapter = {
  dispatchSupported: boolean;
  canShare: boolean;
  writeFile(params: {
    fileLabel: string;
    mimeType: string;
    content: string | Uint8Array;
  }): Promise<void>;
};

function mapUnavailableReason(
  reason: Extract<PreparedExportRequestVM['availability'], { status: 'UNAVAILABLE' }>['reason'],
): Extract<PreparedExportDispatchResult, { status: 'UNAVAILABLE' }>['reason'] {
  switch (reason) {
    case 'NO_EXPORT_SELECTED':
      return 'NO_EXPORT_SELECTED';
    case 'UNSUPPORTED_FORMAT':
      return 'UNSUPPORTED_FORMAT';
    case 'INSUFFICIENT_CONTENT':
      return 'INSUFFICIENT_CONTENT';
    default:
      return 'DISPATCH_NOT_SUPPORTED';
  }
}

export async function dispatchExportRequest(params: {
  preparedExportRequestVM: PreparedExportRequestVM;
  adapter?: ExportDispatchAdapter;
}): Promise<PreparedExportDispatchResult> {
  if (params.preparedExportRequestVM.availability.status === 'UNAVAILABLE') {
    return {
      status: 'UNAVAILABLE',
      reason: mapUnavailableReason(params.preparedExportRequestVM.availability.reason),
    };
  }

  const { request } = params.preparedExportRequestVM.availability;

  if (request.dispatchAvailability.status === 'UNAVAILABLE') {
    return {
      status: 'UNAVAILABLE',
      reason:
        request.dispatchAvailability.reason === 'INSUFFICIENT_CONTENT'
          ? 'INSUFFICIENT_CONTENT'
          : 'DISPATCH_NOT_SUPPORTED',
    };
  }

  if (!params.adapter || !params.adapter.dispatchSupported) {
    return {
      status: 'UNAVAILABLE',
      reason: 'DISPATCH_NOT_SUPPORTED',
    };
  }

  try {
    const renderedFile = renderPreparedExportFile(request);

    await params.adapter.writeFile({
      fileLabel: renderedFile.fileLabel,
      mimeType: renderedFile.mimeType,
      content: renderedFile.content,
    });

    return {
      status: 'AVAILABLE',
      fileLabel: renderedFile.fileLabel,
      mimeType: renderedFile.mimeType,
      timezoneLabel: request.timezoneLabel,
      journalReferenceIncluded: request.journalReferenceIncluded,
    };
  } catch {
    return {
      status: 'UNAVAILABLE',
      reason: 'DISPATCH_FAILED',
    };
  }
}
