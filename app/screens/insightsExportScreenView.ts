import type { UserProfile } from '@/core/profile/types';
import type {
  ExportFormat,
  ExportOptionsVM,
  PreparedExportRequestVM,
  ReflectionPeriod,
} from '@/services/insights/types';

export type ExportPeriodOptionViewData = {
  id: ReflectionPeriod;
  label: string;
  isSelected: boolean;
};

export type ExportOptionViewData = {
  format: ExportFormat;
  label: string;
  description: string;
  availabilityText: string | null;
  isAvailable: boolean;
  isSelected: boolean;
};

export type ExportPayloadSummaryItemViewData = {
  label: string;
  value: string;
};

export type InsightsExportScreenViewData = {
  title: string;
  summary: string;
  profileLabel: string;
  availabilityMessage: string | null;
  requestAvailabilityMessage: string | null;
  periodOptions: ExportPeriodOptionViewData[];
  options: ExportOptionViewData[];
  requestTitle: string | null;
  coveredRangeLabel: string | null;
  timezoneLabel: string | null;
  payloadSummary: ExportPayloadSummaryItemViewData[];
};

const PERIOD_OPTIONS: ReadonlyArray<{
  id: ReflectionPeriod;
  label: string;
}> = [
  {
    id: 'LAST_MONTH',
    label: 'Last month',
  },
  {
    id: 'LAST_QUARTER',
    label: 'Last quarter',
  },
];

function formatExportAvailabilityMessage(
  reason: Extract<ExportOptionsVM['availability'], { status: 'UNAVAILABLE' }>['reason'],
): string {
  switch (reason) {
    case 'NO_EXPORTABLE_CONTENT':
      return 'There is not enough prepared reflection content to export yet.';
    default:
      return 'This export path is not enabled on this surface.';
  }
}

function formatRequestAvailabilityMessage(
  reason: Extract<PreparedExportRequestVM['availability'], { status: 'UNAVAILABLE' }>['reason'],
): string {
  switch (reason) {
    case 'NO_EXPORT_SELECTED':
      return 'Choose an export option to preview what would be prepared.';
    case 'UNSUPPORTED_FORMAT':
      return 'This export format is not available for the current profile or reflection context.';
    case 'INSUFFICIENT_CONTENT':
      return 'There is not enough prepared reflection content for this export yet.';
    default:
      return 'This export path is not enabled on this surface.';
  }
}

function createPeriodOptions(selectedPeriod: ReflectionPeriod): ExportPeriodOptionViewData[] {
  return PERIOD_OPTIONS.map((option) => ({
    id: option.id,
    label: option.label,
    isSelected: option.id === selectedPeriod,
  }));
}

function createProfileLabel(profile: UserProfile): string {
  switch (profile) {
    case 'MIDDLE':
      return 'Intermediate profile';
    case 'ADVANCED':
      return 'Advanced profile';
    default:
      return 'Beginner profile';
  }
}

export function createInsightsExportScreenViewData(
  exportOptionsVM: ExportOptionsVM | null,
  preparedExportRequestVM: PreparedExportRequestVM | null,
  params: {
    selectedProfile: UserProfile;
    selectedPeriod: ReflectionPeriod;
    selectedFormat: ExportFormat | null;
  },
): InsightsExportScreenViewData | null {
  if (!exportOptionsVM || !preparedExportRequestVM) {
    return null;
  }

  return {
    title: 'Export reflection',
    summary:
      'Prepare a calm export of reflection material that is already ready under Insights. Each option stays explicit about what it contains.',
    profileLabel: createProfileLabel(params.selectedProfile),
    availabilityMessage:
      exportOptionsVM.availability.status === 'UNAVAILABLE'
        ? formatExportAvailabilityMessage(exportOptionsVM.availability.reason)
        : null,
    requestAvailabilityMessage:
      preparedExportRequestVM.availability.status === 'UNAVAILABLE'
        ? formatRequestAvailabilityMessage(preparedExportRequestVM.availability.reason)
        : null,
    periodOptions: createPeriodOptions(params.selectedPeriod),
    options:
      exportOptionsVM.availability.status === 'AVAILABLE'
        ? exportOptionsVM.availability.options.map((option) => ({
            format: option.format,
            label: option.label,
            description: option.description,
            availabilityText: option.isAvailable
              ? 'Ready now'
              : option.unavailableReason ?? 'Not available in this context.',
            isAvailable: option.isAvailable,
            isSelected: option.format === params.selectedFormat,
          }))
        : [],
    requestTitle:
      preparedExportRequestVM.availability.status === 'AVAILABLE'
        ? preparedExportRequestVM.availability.request.title
        : null,
    coveredRangeLabel:
      preparedExportRequestVM.availability.status === 'AVAILABLE'
        ? preparedExportRequestVM.availability.request.coveredRangeLabel
        : null,
    timezoneLabel:
      preparedExportRequestVM.availability.status === 'AVAILABLE'
        ? preparedExportRequestVM.availability.request.timezoneLabel
        : null,
    payloadSummary:
      preparedExportRequestVM.availability.status === 'AVAILABLE'
        ? preparedExportRequestVM.availability.request.payloadSummary.map((item) => ({
            label: item.label,
            value: item.value,
          }))
        : [],
  };
}
