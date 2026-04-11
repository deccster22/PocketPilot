import type { MarketEvent } from '@/core/types/marketEvent';
import type { OrientationContext } from '@/services/orientation/createOrientationContext';

import type {
  SelectedAccountAvailability,
  SelectedAccountContext,
} from '@/services/accounts/types';

type AccountScopedValue = {
  accountId?: string | null;
};

type LatestRelevantEvent = OrientationContext['currentState']['latestRelevantEvent'];

function normaliseAccountId(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isSelectedAccountMatch(
  item: AccountScopedValue,
  selectedAccount: SelectedAccountContext,
): boolean {
  return normaliseAccountId(item.accountId) === selectedAccount.accountId;
}

function hasMarketEventFields(
  event: LatestRelevantEvent,
): event is MarketEvent {
  return Boolean(event && 'symbol' in event && 'strategyId' in event && 'certainty' in event);
}

export function requireSelectedAccountContext(
  availability: SelectedAccountAvailability,
): SelectedAccountContext {
  if (availability.status === 'UNAVAILABLE') {
    throw new Error(
      `Selected account context is unavailable: ${availability.reason}.`,
    );
  }

  return availability.account;
}

export function filterAccountScopedItems<T extends AccountScopedValue>(params: {
  selectedAccount: SelectedAccountContext;
  items: ReadonlyArray<T>;
}): T[] {
  return params.items.filter((item) => isSelectedAccountMatch(item, params.selectedAccount));
}

export function enforceAccountScopedTruth<T>(params: {
  label: string;
  selectedAccount: SelectedAccountContext;
  accountIds: ReadonlyArray<string | null | undefined>;
  value: T;
}): T {
  const mismatchedAccountIds = [...new Set(params.accountIds.map(normaliseAccountId))]
    .filter((accountId): accountId is string => accountId !== null)
    .filter((accountId) => accountId !== params.selectedAccount.accountId);

  if (mismatchedAccountIds.length > 0) {
    throw new Error(
      `${params.label} must remain scoped to account ${params.selectedAccount.accountId}. Found: ${mismatchedAccountIds.join(', ')}.`,
    );
  }

  return params.value;
}

export function scopeOrientationContextToSelectedAccount(params: {
  selectedAccount: SelectedAccountContext;
  orientationContext: OrientationContext;
}): OrientationContext {
  const latestRelevantEvent = params.orientationContext.currentState.latestRelevantEvent;
  const scopedLatestRelevantEvent =
    latestRelevantEvent && isSelectedAccountMatch(latestRelevantEvent, params.selectedAccount)
      ? latestRelevantEvent
      : null;
  const scopedEventsSinceLastViewed = filterAccountScopedItems({
    selectedAccount: params.selectedAccount,
    items: params.orientationContext.historyContext.eventsSinceLastViewed,
  });
  const scopedSinceLastChecked = params.orientationContext.historyContext.sinceLastChecked
    ? {
        ...params.orientationContext.historyContext.sinceLastChecked,
        accountId: params.selectedAccount.accountId,
        events: filterAccountScopedItems({
          selectedAccount: params.selectedAccount,
          items: params.orientationContext.historyContext.sinceLastChecked.events,
        }),
      }
    : params.orientationContext.historyContext.sinceLastChecked;

  return {
    ...params.orientationContext,
    accountId: params.selectedAccount.accountId,
    symbol: hasMarketEventFields(scopedLatestRelevantEvent)
      ? scopedLatestRelevantEvent.symbol ?? undefined
      : undefined,
    strategyId: hasMarketEventFields(scopedLatestRelevantEvent)
      ? scopedLatestRelevantEvent.strategyId ?? undefined
      : undefined,
    currentState: {
      ...params.orientationContext.currentState,
      latestRelevantEvent: scopedLatestRelevantEvent,
      certainty: hasMarketEventFields(scopedLatestRelevantEvent)
        ? scopedLatestRelevantEvent.certainty ?? null
        : null,
    },
    historyContext: {
      eventsSinceLastViewed: scopedEventsSinceLastViewed,
      sinceLastChecked: scopedSinceLastChecked,
    },
  };
}
