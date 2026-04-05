import type { RiskToolVM } from '@/services/risk/types';

export type RiskToolDetailRow = {
  label: string;
  value: string;
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
      return 'Position size is based on the supplied entry, stop, and risk basis.';
    case 'INCOMPLETE':
      return 'Add the missing price or risk inputs to complete this summary.';
    default:
      return 'Select a prepared plan or add pricing context before using this tool.';
  }
}

export function createRiskToolScreenViewData(
  riskTool: RiskToolVM | null,
): RiskToolScreenViewData | null {
  if (!riskTool) {
    return null;
  }

  return {
    stateText: formatStateText(riskTool.summary.state),
    statusText: formatStatusText(riskTool.summary.state),
    boundaryText:
      'Risk framing stays support-only. It does not create an order or imply execution readiness.',
    symbolText: `Reference symbol: ${riskTool.summary.symbol ?? 'Not set'}`,
    generatedAtText: riskTool.generatedAt ? `Prepared at ${riskTool.generatedAt}` : null,
    detailRows: [
      {
        label: 'Entry reference',
        value: formatValue(riskTool.summary.entryPrice, 'Not set'),
      },
      {
        label: 'Stop reference',
        value: formatValue(riskTool.summary.stopPrice, 'Not set'),
      },
      {
        label: 'Target reference',
        value: formatValue(riskTool.summary.targetPrice, 'Not set'),
      },
      {
        label: 'Stop distance',
        value: formatValue(riskTool.summary.stopDistance),
      },
      {
        label: 'Risk amount',
        value: formatValue(riskTool.summary.riskAmount),
      },
      {
        label: 'Risk percent',
        value: formatPercent(riskTool.summary.riskPercent),
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
