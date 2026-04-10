import type { TradeHubActionState, TradePlanPreview } from '@/services/trade/types';

export type TradePlanPreviewViewData = {
  planId: string;
  intentLabel: string;
  symbolLabel: string;
  actionStateText: string;
  rationaleSummary: string;
  rationaleTraceText: string;
  readinessText: string;
  constraintsText: string;
  confirmationText: string;
  placeholderText: string;
  riskBasisText: string;
  riskStatusText: string;
  riskHeadline: string;
  riskSummary: string;
  riskItems: ReadonlyArray<{
    label: string;
    value: string;
  }>;
};

function formatIntentLabel(intentType: TradePlanPreview['headline']['intentType']): string {
  switch (intentType) {
    case 'ACCUMULATE':
      return 'Accumulate';
    case 'REDUCE':
      return 'Reduce';
    case 'HOLD':
      return 'Hold';
    default:
      return 'Wait';
  }
}

function formatActionStateText(actionState: TradeHubActionState): string {
  switch (actionState) {
    case 'READY':
      return 'Ready for confirmation';
    case 'CAUTION':
      return 'Caution before confirmation';
    default:
      return 'Wait before confirmation';
  }
}

function formatConstraintsText(preview: TradePlanPreview): string {
  const parts = ['Confirmation required'];

  if (preview.constraints.cooldownActive) {
    parts.push('cooldown active');
  }

  if (preview.constraints.maxPositionSize !== undefined) {
    parts.push(`max position size ${preview.constraints.maxPositionSize}`);
  }

  return parts.join(' | ');
}

export function createTradePlanPreviewViewData(
  preview: TradePlanPreview | null,
): TradePlanPreviewViewData | null {
  if (!preview) {
    return null;
  }

  return {
    planId: preview.planId,
    intentLabel: formatIntentLabel(preview.headline.intentType),
    symbolLabel: preview.headline.symbol ?? 'Portfolio-level',
    actionStateText: formatActionStateText(preview.headline.actionState),
    rationaleSummary: preview.rationale.summary,
    rationaleTraceText: `${preview.rationale.supportingEventCount} supporting event${
      preview.rationale.supportingEventCount === 1 ? '' : 's'
    } | primary event ${preview.rationale.primaryEventId ?? 'none'}`,
    readinessText: `${preview.readiness.alignment.toLowerCase()} alignment | ${preview.readiness.certainty.toLowerCase()} certainty`,
    constraintsText: formatConstraintsText(preview),
    confirmationText: preview.constraints.requiresConfirmation
      ? 'This is a framed plan preview only. A future confirmation step is still required.'
      : 'Confirmation is not required.',
    placeholderText:
      preview.placeholders.orderPreviewAvailable || preview.placeholders.executionPreviewAvailable
        ? 'Execution placeholders are available.'
        : 'Order and execution previews are placeholder-only in this phase.',
    riskBasisText: `Risk basis: ${preview.risk.activeBasisLabel ?? 'Unavailable'}`,
    riskStatusText:
      preview.risk.context?.status === 'AVAILABLE'
        ? 'Prepared risk context available'
        : 'Prepared risk context unavailable',
    riskHeadline: preview.risk.context?.headline ?? 'Risk context unavailable',
    riskSummary:
      preview.risk.context?.summary ??
      'PocketPilot could not prepare a risk-per-trade context for this plan yet.',
    riskItems:
      preview.risk.context?.items.map((item) => ({
        label: item.label,
        value: item.value,
      })) ?? [],
  };
}
