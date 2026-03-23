import type { TradeHubActionState, TradePlanConfirmationShell } from '@/services/trade/types';

export type TradePlanConfirmationViewData = {
  planId: string;
  intentLabel: string;
  symbolLabel: string;
  actionStateText: string;
  readinessText: string;
  confirmationText: string;
  constraintsText: string;
  placeholderText: string;
};

function formatIntentLabel(
  intentType: TradePlanConfirmationShell['headline']['intentType'],
): string {
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

function formatConstraintsText(shell: TradePlanConfirmationShell): string {
  const parts = ['Confirmation required'];

  if (shell.constraints.cooldownActive) {
    parts.push('cooldown active');
  }

  if (shell.constraints.maxPositionSize !== undefined) {
    parts.push(`max position size ${shell.constraints.maxPositionSize}`);
  }

  return parts.join(' | ');
}

function formatConfirmationText(shell: TradePlanConfirmationShell): string {
  const availabilityText = shell.confirmation.executionAvailable
    ? 'Execution preview is available.'
    : 'Execution remains unavailable in this phase.';

  return `${shell.confirmation.pathType} path | ${shell.confirmation.stepsLabel} | ${availabilityText}`;
}

export function createTradePlanConfirmationViewData(
  shell: TradePlanConfirmationShell | null,
): TradePlanConfirmationViewData | null {
  if (!shell) {
    return null;
  }

  return {
    planId: shell.planId,
    intentLabel: formatIntentLabel(shell.headline.intentType),
    symbolLabel: shell.headline.symbol ?? 'Portfolio-level',
    actionStateText: formatActionStateText(shell.headline.actionState),
    readinessText: `${shell.readiness.alignment.toLowerCase()} alignment | ${shell.readiness.certainty.toLowerCase()} certainty`,
    confirmationText: formatConfirmationText(shell),
    constraintsText: formatConstraintsText(shell),
    placeholderText:
      shell.placeholders.orderPayloadAvailable || shell.placeholders.executionPreviewAvailable
        ? 'Order payload or execution preview is available.'
        : 'Order payload and execution preview remain placeholders in this phase.',
  };
}
