import type { SnapshotVM } from '@/services/snapshot/snapshotService';

export type SnapshotScreenViewData = {
  currentStateLabel: string;
  currentStateValue: string;
  change24hLabel: string;
  change24hValue: string;
  strategyStatusLabel: string;
  strategyStatusValue: string;
  bundleName?: string;
  portfolioValueText?: string;
};

export function createSnapshotScreenViewData(
  snapshot: SnapshotVM | null,
): SnapshotScreenViewData | null {
  const model = snapshot?.model;

  if (!model) {
    return null;
  }

  return {
    currentStateLabel: model.core.currentState.label,
    currentStateValue: model.core.currentState.value,
    change24hLabel: model.core.change24h.label,
    change24hValue: `${(model.core.change24h.value * 100).toFixed(2)}%`,
    strategyStatusLabel: model.core.strategyStatus.label,
    strategyStatusValue: model.core.strategyStatus.value,
    bundleName: model.secondary?.bundleName,
    portfolioValueText:
      model.secondary?.portfolioValue === undefined
        ? undefined
        : model.secondary.portfolioValue.toFixed(2),
  };
}
