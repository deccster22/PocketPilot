import type { RiskToolVM } from '@/services/risk/types';
import type { TradeHubHelpAffordance } from '@/services/knowledge/types';

export type RiskToolDetailRow = {
  label: string;
  value: string;
  supportingText?: string;
  helpAffordance?: TradeHubHelpAffordance;
};

export type RiskToolScreenViewData = {
  stateText: string;
  statusText: string;
  boundaryText: string;
  symbolText: string;
  generatedAtText: string | null;
  detailRows: RiskToolDetailRow[];
  notes: string[];
};

function formatNumber(value: number): string {
  return value.toFixed(4).replace(/\.?0+$/, '');
}

function formatValue(value: number | null, fallback = 'Not available'): string {
  return value === null ? fallback : formatNumber(value);
}

function formatPercent(value: number | null): string {
  return value === null ? 'Not available' : `${formatNumber(value)}%`;
}

function formatUnits(value: number | null): string {
  return value === null ? 'Not available' : `${formatNumber(value)} units`;
}

function formatRewardRisk(value: number | null): string {
  return value === null ? 'Not available' : `${formatNumber(value)} to 1`;
}

function formatReferenceSource(
  source: RiskToolVM['summary']['entryReference']['source'],
): string | undefined {
  switch (source) {
    case 'USER_INPUT':
      return 'Source: your input';
    case 'PREPARED_QUOTE':
      return 'Source: current planning context';
    case 'PREPARED_PLAN':
      return 'Source: prepared plan';
    default:
      return undefined;
  }
}

function formatStateText(state: RiskToolVM['summary']['state']): string {
  switch (state) {
    case 'READY':
      return 'Risk framing ready';
    case 'INCOMPLETE':
      return 'Risk framing needs more input';
    default:
      return 'Risk framing unavailable';
  }
}

function formatStatusText(state: RiskToolVM['summary']['state']): string {
  switch (state) {
    case 'READY':
      return 'Position size is calculated from the entry price, stop-loss price, and selected risk basis in this summary.';
    case 'INCOMPLETE':
      return 'Add or adjust the missing price or risk inputs to complete this summary.';
    default:
      return 'Select a prepared plan or add pricing context before using this tool.';
  }
}

function findAffordance(
  riskTool: RiskToolVM,
  slot: TradeHubHelpAffordance['slot'],
): TradeHubHelpAffordance | undefined {
  if (riskTool.inlineHelpAffordances.status !== 'AVAILABLE') {
    return undefined;
  }

  return riskTool.inlineHelpAffordances.affordances.find((affordance) => affordance.slot === slot);
}

export function createRiskToolScreenViewData(
  riskTool: RiskToolVM | null,
): RiskToolScreenViewData | null {
  if (!riskTool) {
    return null;
  }

  const stopLossHelp = findAffordance(riskTool, 'RISK_TOOL_STOP_LOSS_PRICE');
  const targetHelp = findAffordance(riskTool, 'RISK_TOOL_TARGET_PRICE');
  const activeRiskBasisHelp = findAffordance(riskTool, 'RISK_TOOL_ACTIVE_RISK_BASIS');
  const riskAmountHelp =
    activeRiskBasisHelp?.term === 'RISK_AMOUNT' ? activeRiskBasisHelp : undefined;
  const riskPercentHelp =
    activeRiskBasisHelp?.term === 'RISK_PERCENT' ? activeRiskBasisHelp : undefined;

  return {
    stateText: formatStateText(riskTool.summary.state),
    statusText: formatStatusText(riskTool.summary.state),
    boundaryText:
      'Risk framing stays support-only. It does not create an order or imply execution readiness.',
    symbolText: `Asset symbol: ${riskTool.summary.symbol ?? 'Not set'}`,
    generatedAtText: riskTool.generatedAt ? `Prepared at ${riskTool.generatedAt}` : null,
    detailRows: [
      {
        label: 'Entry price',
        value: formatValue(riskTool.summary.entryPrice, 'Not set'),
        supportingText: formatReferenceSource(riskTool.summary.entryReference.source),
      },
      {
        label: 'Stop-loss price',
        value: formatValue(riskTool.summary.stopPrice, 'Not set'),
        supportingText: formatReferenceSource(riskTool.summary.stopReference.source),
        ...(stopLossHelp ? { helpAffordance: stopLossHelp } : {}),
      },
      {
        label: 'Target price',
        value: formatValue(riskTool.summary.targetPrice, 'Not set'),
        supportingText: formatReferenceSource(riskTool.summary.targetReference.source),
        ...(targetHelp ? { helpAffordance: targetHelp } : {}),
      },
      {
        label: 'Stop distance',
        value: formatValue(riskTool.summary.stopDistance),
      },
      {
        label: 'Risk amount',
        value: formatValue(riskTool.summary.riskAmount),
        ...(riskAmountHelp ? { helpAffordance: riskAmountHelp } : {}),
      },
      {
        label: 'Risk percent',
        value: formatPercent(riskTool.summary.riskPercent),
        ...(riskPercentHelp ? { helpAffordance: riskPercentHelp } : {}),
      },
      {
        label: 'Position size',
        value: formatUnits(riskTool.summary.positionSize),
      },
      {
        label: 'Reward/risk',
        value: formatRewardRisk(riskTool.summary.rewardRiskRatio),
      },
    ],
    notes: [...riskTool.summary.notes],
  };
}
