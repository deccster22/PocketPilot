import type { UserProfile } from '@/core/profile/types';
import type {
  AccountSelectionMode,
  AccountSwitchingAvailability,
  SwitchableAccountOption,
} from '@/services/accounts/types';
import {
  fetchDashboardSurfaceVM,
  type DashboardSurfaceVM,
} from '@/services/dashboard/dashboardSurfaceService';
import type { DashboardItem } from '@/services/dashboard/types';
import type { ExplanationConfidence, ExplanationLineageItem } from '@/services/explanation/types';
import { fetchMessagePolicyVM } from '@/services/messages/fetchMessagePolicyVM';
import type {
  MessagePolicyAvailability,
  MessagePolicyKind,
  MessagePriority,
  MessageRationaleAvailability,
} from '@/services/messages/types';
import type { ForegroundScanResult } from '@/services/types/scan';

export type DashboardScreenAccountContextViewData =
  | {
      visible: false;
    }
  | {
      visible: true;
      title: string;
      summary: string;
      switcher: DashboardScreenAccountSwitcherViewData;
    };

export type DashboardScreenAccountSwitchOptionViewData = {
  accountId: string;
  title: string;
  summary: string | null;
  isSelected: boolean;
  isPrimary: boolean;
};

export type DashboardScreenAccountSwitcherViewData =
  | {
      visible: false;
    }
  | {
      visible: true;
      title: string;
      summary: string;
      options: DashboardScreenAccountSwitchOptionViewData[];
    };

export type DashboardScreenAggregatePortfolioAssetViewData = {
  symbol: string;
  summary: string;
};

export type DashboardScreenAggregatePortfolioViewData =
  | {
      visible: false;
    }
  | {
      visible: true;
      title: string;
      summary: string;
      totalValueText: string | null;
      assets: DashboardScreenAggregatePortfolioAssetViewData[];
    };

export type DashboardScreenZoneItemViewData = {
  title: string;
  subtitle: string;
  certaintyText: string;
};

export type DashboardScreenZoneViewData = {
  title: string;
  items: DashboardScreenZoneItemViewData[];
};

export type DashboardScreenMessageViewData =
  | {
      visible: false;
    }
  | {
      visible: true;
      kind: MessagePolicyKind;
      priority: MessagePriority;
      title: string;
      summary: string;
      rationale: MessageRationaleAvailability;
    };

export type DashboardScreenViewData = {
  profileLabel: string;
  accountContext: DashboardScreenAccountContextViewData;
  aggregatePortfolio: DashboardScreenAggregatePortfolioViewData;
  message: DashboardScreenMessageViewData;
  primeZone: DashboardScreenZoneViewData;
  secondaryZone: DashboardScreenZoneViewData;
  deepZone: DashboardScreenZoneViewData;
  explanation:
    | {
        visible: false;
      }
    | {
        visible: true;
        title: string;
        summary: string;
        confidenceText: string;
        confidenceNote: string;
        detail:
          | null
          | {
              contextNote?: string;
              lineage: ReadonlyArray<Pick<ExplanationLineageItem, 'label' | 'detail'>>;
              limitations: ReadonlyArray<string>;
            };
      };
};

function formatSelectionMode(selectionMode: AccountSelectionMode): string {
  switch (selectionMode) {
    case 'EXPLICIT':
      return 'Explicit account context';
    case 'PRIMARY_FALLBACK':
      return 'Primary-account context';
    default:
      return 'Highest-value fallback context';
  }
}

function createAccountContextViewData(
  accountContext: DashboardSurfaceVM['accountContext'],
): DashboardScreenAccountContextViewData {
  if (accountContext.status !== 'AVAILABLE') {
    return {
      visible: false,
    };
  }

  return {
    visible: true,
    title: `Current account: ${accountContext.account.displayName}`,
    summary: [
      formatSelectionMode(accountContext.account.selectionMode),
      accountContext.account.baseCurrency
        ? `${accountContext.account.baseCurrency} base currency`
        : null,
      accountContext.account.strategyId
        ? `Strategy ${accountContext.account.strategyId}`
        : null,
    ]
      .filter((value): value is string => Boolean(value))
      .join(' | '),
    switcher: createAccountSwitcherViewData(accountContext.switching),
  };
}

function formatAccountSwitchOptionSummary(
  option: SwitchableAccountOption,
): string | null {
  return option.strategyId ? `Strategy ${option.strategyId}` : null;
}

function createAccountSwitcherViewData(
  switchingAvailability?: AccountSwitchingAvailability,
): DashboardScreenAccountSwitcherViewData {
  if (switchingAvailability?.status !== 'AVAILABLE') {
    return {
      visible: false,
    };
  }

  return {
    visible: true,
    title: 'Account context controls',
    summary: 'Switch deliberately or mark one primary fallback.',
    options: switchingAvailability.options.map((option) => ({
      accountId: option.accountId,
      title: option.displayName,
      summary: formatAccountSwitchOptionSummary(option),
      isSelected: option.isSelected,
      isPrimary: option.isPrimary,
    })),
  };
}

function formatDecimal(value: number, fractionDigits: number): string {
  return value.toFixed(fractionDigits).replace(/\.?0+$/, '');
}

function formatCurrencyValue(value: number, currency: string | null): string {
  const formattedValue = value.toFixed(2);
  return currency ? `${currency} ${formattedValue}` : formattedValue;
}

function createAggregateAssetSummary(params: {
  amount: number | null;
  value: number | null;
  weightPct: number | null;
  currency: string | null;
}): string {
  const parts = [
    params.amount === null ? null : `${formatDecimal(params.amount, 4)} units`,
    params.value === null ? null : formatCurrencyValue(params.value, params.currency),
    params.weightPct === null ? null : `${params.weightPct.toFixed(1)}% weight`,
  ].filter((value): value is string => value !== null);

  return parts.join(' | ');
}

function createAggregatePortfolioViewData(
  aggregatePortfolioContext: DashboardSurfaceVM['aggregatePortfolioContext'],
): DashboardScreenAggregatePortfolioViewData {
  if (aggregatePortfolioContext.status !== 'AVAILABLE') {
    return {
      visible: false,
    };
  }

  const { portfolio } = aggregatePortfolioContext;

  return {
    visible: true,
    title: 'Aggregate holdings',
    summary: `Across ${portfolio.accountCount} ${
      portfolio.accountCount === 1 ? 'account' : 'accounts'
    } | Portfolio exposure only; strategy truth stays on the current account.`,
    totalValueText:
      portfolio.totalValue === null
        ? null
        : `${formatCurrencyValue(portfolio.totalValue, portfolio.currency)} total`,
    assets: portfolio.assets.slice(0, 3).map((asset) => ({
      symbol: asset.symbol,
      summary: createAggregateAssetSummary({
        amount: asset.amount,
        value: asset.value,
        weightPct: asset.weightPct,
        currency: portfolio.currency,
      }),
    })),
  };
}

function formatEventTypeLabel(item: DashboardItem): string {
  switch (item.eventType) {
    case 'DATA_QUALITY':
      return 'Data quality';
    case 'ESTIMATED_PRICE':
      return 'Estimated price';
    case 'MOMENTUM_BUILDING':
      return 'Momentum building';
    case 'DIP_DETECTED':
      return 'Dip detected';
    default:
      return 'Price movement';
  }
}

function formatTrendLabel(item: DashboardItem): string {
  switch (item.trendDirection) {
    case 'strengthening':
      return 'Strengthening';
    case 'weakening':
      return 'Weakening';
    default:
      return 'Neutral';
  }
}

function formatZoneItems(items: DashboardItem[]): DashboardScreenZoneItemViewData[] {
  return items.map((item) => ({
    title: item.symbol
      ? `${item.symbol} - ${formatEventTypeLabel(item)}`
      : formatEventTypeLabel(item),
    subtitle: [formatTrendLabel(item), item.alignmentState?.replace('_', ' ').toLowerCase()]
      .filter(Boolean)
      .join(' | '),
    certaintyText: item.certainty === 'estimated' ? 'Estimated' : 'Confirmed',
  }));
}

function formatConfidenceText(confidence: ExplanationConfidence): string {
  switch (confidence) {
    case 'HIGH':
      return 'Support: High';
    case 'MODERATE':
      return 'Support: Moderate';
    default:
      return 'Support: Low';
  }
}

function createDashboardMessageViewData(
  messagePolicy?: MessagePolicyAvailability | null,
): DashboardScreenMessageViewData {
  if (messagePolicy?.status === 'AVAILABLE' && messagePolicy.messages[0]) {
    return {
      visible: true,
      kind: messagePolicy.messages[0].kind,
      priority: messagePolicy.messages[0].priority,
      title: messagePolicy.messages[0].title,
      summary: messagePolicy.messages[0].summary,
      rationale: messagePolicy.rationale,
    };
  }

  return {
    visible: false,
  };
}

export async function refreshDashboardScreenSurface(params: {
  profile: UserProfile;
  baselineScan?: ForegroundScanResult;
  fetchDashboardSurface?: typeof fetchDashboardSurfaceVM;
  fetchMessagePolicy?: typeof fetchMessagePolicyVM;
}): Promise<{
  surface: DashboardSurfaceVM;
  messagePolicy: MessagePolicyAvailability;
  nextBaselineScan: ForegroundScanResult;
}> {
  const fetchDashboardSurface = params.fetchDashboardSurface ?? fetchDashboardSurfaceVM;
  const fetchMessagePolicy = params.fetchMessagePolicy ?? fetchMessagePolicyVM;
  const surface = await fetchDashboardSurface({
    profile: params.profile,
    baselineScan: params.baselineScan,
  });
  const messagePolicy = await fetchMessagePolicy({
    surface: 'DASHBOARD',
    profile: params.profile,
    dashboardSurface: surface,
  });

  return {
    surface,
    messagePolicy,
    nextBaselineScan: params.baselineScan ?? surface.scan,
  };
}

export function createDashboardScreenViewData(
  surface: DashboardSurfaceVM | null,
  messagePolicy?: MessagePolicyAvailability | null,
): DashboardScreenViewData | null {
  if (!surface) {
    return null;
  }

  const explanationDetail =
    surface.explanation.status === 'AVAILABLE'
      ? {
          contextNote: surface.explanation.explanation.contextNote,
          lineage: surface.explanation.explanation.lineage.map((item) => ({
            label: item.label,
            detail: item.detail,
          })),
          limitations: surface.explanation.explanation.limitations,
        }
      : null;
  const hasExplanationDetail = Boolean(
    explanationDetail &&
      (explanationDetail.contextNote ||
        explanationDetail.lineage.length > 0 ||
        explanationDetail.limitations.length > 0),
  );

  return {
    profileLabel: surface.model.meta.profile,
    accountContext: createAccountContextViewData(surface.accountContext),
    aggregatePortfolio: createAggregatePortfolioViewData(surface.aggregatePortfolioContext),
    message: createDashboardMessageViewData(messagePolicy),
    primeZone: {
      title: 'Prime Zone',
      items: formatZoneItems(surface.model.primeZone.items),
    },
    secondaryZone: {
      title: 'Secondary Zone',
      items: formatZoneItems(surface.model.secondaryZone.items),
    },
    deepZone: {
      title: 'Deep Zone',
      items: formatZoneItems(surface.model.deepZone.items),
    },
    explanation:
      surface.explanation.status === 'AVAILABLE'
        ? {
            visible: true,
            title: surface.explanation.explanation.title,
            summary: surface.explanation.explanation.summary,
            confidenceText: formatConfidenceText(surface.explanation.explanation.confidence),
            confidenceNote: surface.explanation.explanation.confidenceNote,
            detail: hasExplanationDetail ? explanationDetail : null,
          }
        : {
            visible: false,
          },
  };
}
