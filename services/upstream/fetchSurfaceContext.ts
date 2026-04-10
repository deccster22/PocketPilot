import { STRATEGY_BUNDLES } from '@/core/strategy/bundles';
import type { UserProfile } from '@/core/profile/types';
import { defaultBundleIdsForProfile } from '@/core/strategy/profileDefaults';
import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type { AlignmentState, MarketEvent } from '@/core/types/marketEvent';
import { QuoteBroker } from '@/providers/quoteBroker';
import { fetchLiveQuotes } from '@/providers/liveQuoteFetcher';
import {
  createSinceLastChecked,
  type SinceLastCheckedPayload,
} from '@/services/events/createSinceLastChecked';
import {
  defaultEventLedgerService,
  type EventLedgerService,
} from '@/services/events/eventLedgerService';
import {
  createEventLedgerQueries,
  type EventLedgerQueries,
} from '@/services/events/eventLedgerQueries';
import { createMarketEvents } from '@/services/events/createMarketEvents';
import {
  createEventStream,
  summarizeAlignment,
  type EventStream,
} from '@/services/events/eventStream';
import { defaultAccountPreferenceStore } from '@/services/accounts/accountPreferenceStore';
import {
  enforceAccountScopedTruth,
  filterAccountScopedItems,
  requireSelectedAccountContext,
  scopeOrientationContextToSelectedAccount,
} from '@/services/accounts/enforceAccountScopedTruth';
import { fetchSelectedAccountContext } from '@/services/accounts/fetchSelectedAccountContext';
import type {
  AccountContextCandidate,
  AccountPreferenceStore,
  SelectedAccountAvailability,
} from '@/services/accounts/types';
import {
  createOrientationContext,
  type OrientationContext,
} from '@/services/orientation/createOrientationContext';
import {
  defaultLastViewedState,
  SNAPSHOT_LAST_VIEWED_SURFACE_ID,
  type LastViewedState,
} from '@/services/orientation/lastViewedState';
import {
  createQuoteBrokerProvider,
  getQuotesForSymbols,
} from '@/services/providers/providerRouter';
import { runForegroundScan } from '@/services/scan/foregroundScanService';
import { resolveActiveStrategies } from '@/services/strategy/activeStrategiesService';
import { runStrategies } from '@/services/strategy/runStrategiesService';
import type { ForegroundScanResult } from '@/services/types/scan';

const SURFACE_SYMBOLS = ['BTC', 'ETH', 'SOL', 'DOGE'] as const;

const SURFACE_ACCOUNTS: ReadonlyArray<AccountContextCandidate> = [
  {
    id: 'acct-live',
    displayName: 'Live account',
    portfolioValue: 10_000,
    isPrimary: true,
    baseCurrency: 'USD',
    strategyId: 'momentum_basics',
  },
  {
    id: 'acct-basic',
    displayName: 'Basic account',
    portfolioValue: 6_500,
    baseCurrency: 'USD',
    strategyId: 'dip_buying',
  },
  {
    id: 'acct-manual',
    displayName: 'Manual account',
    portfolioValue: 4_250,
    baseCurrency: 'USD',
    strategyId: 'data_quality',
  },
];

export type SurfaceContext = {
  selectedAccountContext: SelectedAccountAvailability;
  portfolioValue: number;
  change24h: number;
  strategyAlignment: string;
  bundleName: string;
  eventLedger: EventLedgerService;
  scan: ForegroundScanResult;
  signals: ReturnType<typeof runStrategies>;
  marketEvents: MarketEvent[];
  eventStream: EventStream;
  orientationContext: OrientationContext;
  eventsSinceLastViewed?: EventLedgerEntry[];
  sinceLastChecked?: SinceLastCheckedPayload;
};

function formatAlignmentState(alignmentState: AlignmentState): string {
  switch (alignmentState) {
    case 'NEEDS_REVIEW':
      return 'Needs review';
    case 'WATCHFUL':
      return 'Watchful';
    default:
      return 'Aligned';
  }
}

export async function fetchSurfaceContext(params: {
  profile: UserProfile;
  accounts?: ReadonlyArray<AccountContextCandidate>;
  selectedAccountId?: string | null;
  accountPreferenceStore?: Pick<AccountPreferenceStore, 'load'>;
  accountSwitchingEnabled?: boolean;
  baselineScan?: ForegroundScanResult;
  nowProvider?: () => number;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
}): Promise<SurfaceContext> {
  const nowProvider = params.nowProvider ?? Date.now;
  const eventLedger = params.eventLedger ?? defaultEventLedgerService;
  const eventLedgerQueries =
    params.eventLedgerQueries ?? createEventLedgerQueries(eventLedger);
  const lastViewedState = params.lastViewedState ?? defaultLastViewedState;
  const broker = new QuoteBroker({
    providerId: 'broker:live',
    fetcher: fetchLiveQuotes,
    nowProvider,
  });
  const primaryProvider = createQuoteBrokerProvider(broker, 'execution');
  const accounts = params.accounts ?? SURFACE_ACCOUNTS;
  const accountPreferenceStore =
    params.accountPreferenceStore ?? defaultAccountPreferenceStore;
  const selectedAccountContext = await fetchSelectedAccountContext({
    accounts,
    selectedAccountId: params.selectedAccountId,
    accountPreferenceStore,
    isSwitchingEnabledForSurface: params.accountSwitchingEnabled,
  });
  const selectedAccount = requireSelectedAccountContext(selectedAccountContext);

  const scan = await runForegroundScan(
    {
      getQuotesForSymbols: (routerParams) =>
        getQuotesForSymbols(
          {
            execution: {
              primary: primaryProvider,
            },
          },
          routerParams,
        ),
      nowProvider,
      getInstrumentation: () => broker.instrumentation,
    },
    {
      accounts: [...accounts],
      selectedAccountId: selectedAccount.accountId,
      symbols: [...SURFACE_SYMBOLS],
      baselineQuotes: params.baselineScan?.quotes,
    },
  );
  const scopedScan = enforceAccountScopedTruth({
    label: 'Selected account scan',
    selectedAccount,
    accountIds: [scan.accountId],
    value: scan,
  });

  const strategies = resolveActiveStrategies({ profile: params.profile });
  const strategyNowMs = nowProvider();
  const signals = runStrategies({
    scan: scopedScan,
    baselineScan: params.baselineScan,
    strategies,
    nowMs: strategyNowMs,
  });
  const scopedMarketEvents = filterAccountScopedItems({
    selectedAccount,
    items: createMarketEvents({
      accountId: scopedScan.accountId,
      quotesBySymbol: scopedScan.quotes,
      pctChangeBySymbol: scopedScan.pctChangeBySymbol,
      signals,
    }),
  });
  const marketEvents = enforceAccountScopedTruth({
    label: 'Strategy alignment',
    selectedAccount,
    accountIds: scopedMarketEvents.map((event) => event.accountId),
    value: scopedMarketEvents,
  });
  const eventStream = enforceAccountScopedTruth({
    label: 'Event stream',
    selectedAccount,
    accountIds: [selectedAccount.accountId, ...marketEvents.map((event) => event.accountId)],
    value: createEventStream({
      accountId: selectedAccount.accountId,
      timestamp: strategyNowMs,
      events: marketEvents,
    }),
  });
  eventLedger.appendEvents(eventStream.events);

  const resolvedLastViewedTimestamp =
    params.lastViewedTimestamp ??
    lastViewedState.getLastViewedTimestamp({
      surfaceId: SNAPSHOT_LAST_VIEWED_SURFACE_ID,
      accountId: selectedAccount.accountId,
    });
  const sinceLastChecked =
    resolvedLastViewedTimestamp === undefined
      ? undefined
      : createSinceLastChecked({
          sinceTimestamp: resolvedLastViewedTimestamp,
          accountId: selectedAccount.accountId,
          eventQueries: eventLedgerQueries,
        });

  const prices = Object.values(scopedScan.quotes).map((quote) => quote.price);
  const portfolioValue = prices.reduce((sum, price) => sum + price, 0);
  const changeValues = Object.values(scopedScan.pctChangeBySymbol ?? {});
  const change24h =
    changeValues.length > 0
      ? changeValues.reduce((sum, change) => sum + change, 0) / changeValues.length
      : 0;

  const defaultBundleId = defaultBundleIdsForProfile(params.profile)[0];
  const bundleName =
    STRATEGY_BUNDLES.find((bundle) => bundle.id === defaultBundleId)?.name ?? 'Unknown bundle';

  const strategyAlignment = formatAlignmentState(summarizeAlignment(eventStream.events));
  const scopedOrientationContext = scopeOrientationContextToSelectedAccount({
    selectedAccount,
    orientationContext: createOrientationContext({
      accountId: selectedAccount.accountId,
      currentEvents: eventStream.events,
      strategyAlignment,
      sinceLastChecked,
    }),
  });
  const orientationContext = enforceAccountScopedTruth({
    label: 'Orientation context',
    selectedAccount,
    accountIds: [
      selectedAccount.accountId,
      scopedOrientationContext.currentState.latestRelevantEvent?.accountId,
      ...scopedOrientationContext.historyContext.eventsSinceLastViewed.map(
        (event) => event.accountId,
      ),
      ...(scopedOrientationContext.historyContext.sinceLastChecked?.events ?? []).map(
        (event) => event.accountId,
      ),
    ],
    value: scopedOrientationContext,
  });

  return {
    selectedAccountContext,
    portfolioValue,
    change24h,
    strategyAlignment,
    bundleName,
    eventLedger,
    scan: scopedScan,
    signals,
    marketEvents,
    eventStream,
    orientationContext,
    eventsSinceLastViewed:
      orientationContext.historyContext.sinceLastChecked === null
        ? undefined
        : orientationContext.historyContext.eventsSinceLastViewed,
    sinceLastChecked:
      orientationContext.historyContext.sinceLastChecked === null
        ? undefined
        : orientationContext.historyContext.sinceLastChecked,
  };
}
