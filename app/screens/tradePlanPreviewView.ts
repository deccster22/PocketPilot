import type {
  PositionSizingAvailability,
  PositionSizingUnavailableReason,
  RiskInputGuidanceAvailability,
  TradeHubActionState,
  TradePlanPreview,
} from '@/services/trade/types';
import {
  describePreparedTradeReferencesUnavailableReason,
  normalisePreparedTradeReferencesAvailability,
  shouldRenderPreparedTradeReferencesUnavailableReason,
} from '@/services/trade/createPreparedTradeReferences';

export type TradePlanSizingViewData = {
  statusText: string;
  headline: string;
  summary: string;
  details: ReadonlyArray<{
    label: string;
    value: string;
  }>;
  notes: ReadonlyArray<string>;
};

export type TradePlanPreparedReferenceRowViewData = {
  kind: 'STOP' | 'TARGET';
  label: string;
  value: string;
  sourceLabel: string;
};

export type TradePlanPreparedReferencesViewData =
  | {
      visible: false;
    }
  | {
      visible: true;
      title: string;
      rows: ReadonlyArray<TradePlanPreparedReferenceRowViewData>;
      limitationText: string | null;
      unavailableText: string | null;
    };

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
  preparedReferences: TradePlanPreparedReferencesViewData;
  riskInputGuidance: RiskInputGuidanceAvailability;
  positionSizing: TradePlanSizingViewData;
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

function createPositionSizingViewData(
  sizing: PositionSizingAvailability,
): TradePlanSizingViewData {
  if (sizing.status === 'AVAILABLE') {
    return {
      statusText: 'Prepared sizing available',
      headline: sizing.output.sizeLabel,
      summary: 'Shows the prepared position size and stop-based max loss from this selected plan.',
      details: [
        {
          label: 'Position size',
          value: sizing.output.sizeValue,
        },
        {
          label: sizing.output.maxLossLabel,
          value: sizing.output.maxLossValue,
        },
      ],
      notes: [...sizing.output.notes],
    };
  }

  const summaryByReason: Record<PositionSizingUnavailableReason, string> = {
    INSUFFICIENT_INPUTS:
      'PocketPilot can frame this readout once the prepared plan carries enough entry, stop, cap, and account context.',
    NOT_ENABLED_FOR_SURFACE: 'Position sizing is not enabled on this surface yet.',
    UNSUPPORTED_RISK_BASIS: 'Position sizing cannot frame the selected risk basis yet.',
  };

  return {
    statusText: 'Prepared sizing unavailable',
    headline: 'Position sizing unavailable',
    summary: summaryByReason[sizing.reason],
    details: [
      {
        label: 'Needed',
        value: 'Prepared entry, prepared stop, a prepared position cap, and current account value',
      },
    ],
    notes: ['Support-only readout; no order path is opened here.'],
  };
}

function createRiskInputGuidanceViewData(
  preview: TradePlanPreview,
): RiskInputGuidanceAvailability {
  return preview.riskInputGuidance ?? {
    status: 'UNAVAILABLE',
    reason: 'NO_GUIDANCE_NEEDED',
  };
}

function createPreparedReferencesViewData(
  preview: TradePlanPreview,
): TradePlanPreparedReferencesViewData {
  const availability = normalisePreparedTradeReferencesAvailability(preview.preparedTradeReferences);

  if (availability.status === 'AVAILABLE') {
    return {
      visible: true,
      title: 'Prepared planning levels',
      rows: availability.references.map((reference) => ({
        kind: reference.kind,
        label: reference.label,
        value: reference.value,
        sourceLabel: reference.sourceLabel,
      })),
      limitationText:
        availability.references
          .flatMap((reference) => reference.limitations ?? [])
          .find((limitation) => limitation.trim().length > 0) ?? null,
      unavailableText: null,
    };
  }

  if (!shouldRenderPreparedTradeReferencesUnavailableReason(availability.reason)) {
    return {
      visible: false,
    };
  }

  return {
    visible: true,
    title: 'Prepared planning levels',
    rows: [],
    limitationText: null,
    unavailableText: describePreparedTradeReferencesUnavailableReason(availability.reason),
  };
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
    preparedReferences: createPreparedReferencesViewData(preview),
    riskInputGuidance: createRiskInputGuidanceViewData(preview),
    positionSizing: createPositionSizingViewData(preview.positionSizing),
  };
}
