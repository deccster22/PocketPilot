import type {
  PositionSizingAvailability,
  PreparedTradeRiskLane,
  ProtectionPlan,
  RiskInputGuidanceAvailability,
} from '@/services/trade/types';

type RiskInputGuidanceAccountContext = {
  portfolioValue: number | null;
  baseCurrency: string | null;
};

type RiskInputGuidanceUnavailableReason =
  | 'NO_GUIDANCE_NEEDED'
  | 'NOT_ENABLED_FOR_SURFACE';

const BASIS_GUIDANCE_ITEM = 'A supported risk basis on this surface';
const TITLE = 'Prepared risk context incomplete';

function isPositiveFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function createUnavailable(reason: RiskInputGuidanceUnavailableReason): RiskInputGuidanceAvailability {
  return {
    status: 'UNAVAILABLE',
    reason,
  };
}

function pushUnique(items: string[], item: string): void {
  if (!items.includes(item)) {
    items.push(item);
  }
}

function buildContextItems(params: {
  plan: ProtectionPlan;
  accountContext?: RiskInputGuidanceAccountContext | null;
}): string[] {
  const items: string[] = [];
  const entryPrice = params.plan.preparedRiskReferences?.entryPrice;
  const stopPrice = params.plan.preparedRiskReferences?.stopPrice;
  const hasEntryPrice = isPositiveFiniteNumber(entryPrice);
  const hasStopPrice = isPositiveFiniteNumber(stopPrice);

  if (!hasEntryPrice && !hasStopPrice) {
    pushUnique(items, 'Prepared entry and stop-loss prices');
  } else {
    if (!hasEntryPrice) {
      pushUnique(items, 'Prepared entry price');
    }

    if (!hasStopPrice || (hasEntryPrice && hasStopPrice && entryPrice === stopPrice)) {
      pushUnique(items, 'Prepared stop-loss price');
    }
  }

  if (!isPositiveFiniteNumber(params.plan.constraints.maxPositionSize)) {
    pushUnique(items, 'Prepared position cap');
  }

  if (!isPositiveFiniteNumber(params.accountContext?.portfolioValue)) {
    pushUnique(items, 'Current account value for this account');
  }

  return items;
}

function buildSummary(params: { hasBasisItem: boolean; itemCount: number }): string {
  if (params.itemCount === 0) {
    return 'PocketPilot can finish sizing and max-loss framing once the prepared plan carries the missing context.';
  }

  if (params.hasBasisItem && params.itemCount === 1) {
    return 'PocketPilot can finish sizing and max-loss framing once a supported basis is available on this surface.';
  }

  if (params.hasBasisItem) {
    return 'PocketPilot can finish sizing and max-loss framing once a supported basis is available and the selected plan carries the missing context.';
  }

  return 'PocketPilot can finish sizing and max-loss framing once the selected plan carries the missing context.';
}

function createGuidance(items: string[], hasBasisItem: boolean): RiskInputGuidanceAvailability {
  return {
    status: 'AVAILABLE',
    guidance: {
      title: TITLE,
      summary: buildSummary({
        hasBasisItem,
        itemCount: items.length,
      }),
      items,
    },
  };
}

export function createRiskInputGuidance(params: {
  plan: ProtectionPlan | null;
  risk: Pick<PreparedTradeRiskLane, 'activeBasis' | 'activeBasisLabel' | 'basisAvailability'>;
  accountContext?: RiskInputGuidanceAccountContext | null;
  positionSizing: PositionSizingAvailability;
  isEnabledForSurface?: boolean;
}): RiskInputGuidanceAvailability {
  if (params.isEnabledForSurface === false) {
    return createUnavailable('NOT_ENABLED_FOR_SURFACE');
  }

  if (!params.plan) {
    return createUnavailable('NO_GUIDANCE_NEEDED');
  }

  if (params.positionSizing.status === 'AVAILABLE') {
    return createUnavailable('NO_GUIDANCE_NEEDED');
  }

  const items: string[] = [];
  const hasSupportedBasis =
    params.risk.basisAvailability.status === 'AVAILABLE' &&
    params.risk.activeBasis !== null &&
    params.risk.activeBasisLabel !== null;
  const basisBlocked =
    !hasSupportedBasis || params.positionSizing.reason === 'UNSUPPORTED_RISK_BASIS';

  if (basisBlocked || params.positionSizing.reason === 'NOT_ENABLED_FOR_SURFACE') {
    pushUnique(items, BASIS_GUIDANCE_ITEM);
  }

  if (params.positionSizing.reason === 'INSUFFICIENT_INPUTS') {
    const contextItems = buildContextItems({
      plan: params.plan,
      accountContext: params.accountContext ?? null,
    });

    contextItems.forEach((item) => pushUnique(items, item));
  }

  if (items.length === 0) {
    return createUnavailable('NO_GUIDANCE_NEEDED');
  }

  return createGuidance(items, items.includes(BASIS_GUIDANCE_ITEM));
}
