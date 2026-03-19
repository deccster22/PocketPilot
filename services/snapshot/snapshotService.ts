import { STRATEGY_BUNDLES } from '@/core/strategy/bundles';
import { defaultBundleIdsForProfile } from '@/core/strategy/profileDefaults';
import type { EventLedgerEntry } from '@/core/types/eventLedger';
import type { AlignmentState, MarketEvent } from '@/core/types/marketEvent';
import { QuoteBroker } from '@/providers/quoteBroker';
import { fetchLiveQuotes } from '@/providers/liveQuoteFetcher';
import type { UserProfile } from '@/app/state/profileState';
import {
  buildDebugObservatoryPayload,
  type DebugObservatoryPayload,
} from '@/services/debug/debugObservatoryService';
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

const SNAPSHOT_SYMBOLS = ['BTC', 'ETH', 'SOL', 'DOGE'] as const;

const SNAPSHOT_ACCOUNTS = [{ id: 'acct-live', portfolioValue: 10_000, isPrimary: true }];

export type SnapshotVM = {
  portfolioValue: number;
  change24h: number;
  strategyAlignment: string;
  bundleName: string;
  scan: ForegroundScanResult;
  signals: ReturnType<typeof runStrategies>;
  marketEvents: MarketEvent[];
  eventStream: EventStream;
  orientationContext: OrientationContext;
  eventsSinceLastViewed?: EventLedgerEntry[];
  sinceLastChecked?: SinceLastCheckedPayload;
  debugObservatory?: DebugObservatoryPayload;
};

export function formatAlignmentState(alignmentState: AlignmentState): string {
  switch (alignmentState) {
    case 'NEEDS_REVIEW':
      return 'Needs review';
    case 'WATCHFUL':
      return 'Watchful';
    default:
      return 'Aligned';
  }
}

export async function fetchSnapshotVM(params: {
  profile: UserProfile;
  baselineScan?: ForegroundScanResult;
  nowProvider?: () => number;
  includeDebugObservatory?: boolean;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
}): Promise<SnapshotVM> {
  const nowProvider = params.nowProvider ?? Date.now;
  const eventLedger = params.eventLedger ?? defaultEventLedgerService;
  const eventLedgerQueries =
    params.eventLedgerQueries ?? createEventLedgerQueries(eventLedger);
  const lastViewedState = params.lastViewedState ?? defaultLastViewedState;
  const broker = new QuoteBroker({
    mode: 'CALM',
    fetcher: fetchLiveQuotes,
    nowProvider,
  });
  const primaryProvider = createQuoteBrokerProvider(broker, 'broker:live');

  const scan = await runForegroundScan(
    {
      getQuotesForSymbols: (routerParams) =>
        getQuotesForSymbols(
          {
            primary: primaryProvider,
          },
          routerParams,
        ),
      nowProvider,
      getInstrumentation: () => broker.instrumentation,
    },
    {
      accounts: SNAPSHOT_ACCOUNTS,
      symbols: [...SNAPSHOT_SYMBOLS],
      baselineQuotes: params.baselineScan?.quotes,
    },
  );

  const strategies = resolveActiveStrategies({ profile: params.profile });
  const strategyNowMs = nowProvider();
  const signals = runStrategies({
    scan,
    baselineScan: params.baselineScan,
    strategies,
    nowMs: strategyNowMs,
  });
  const marketEvents = createMarketEvents({
    accountId: scan.accountId,
    quotesBySymbol: scan.quotes,
    pctChangeBySymbol: scan.pctChangeBySymbol,
    signals,
  });
  const eventStream = createEventStream({
    accountId: scan.accountId,
    timestamp: strategyNowMs,
    events: marketEvents,
  });
  eventLedger.appendEvents(eventStream.events);
  const resolvedLastViewedTimestamp =
    params.lastViewedTimestamp ??
    lastViewedState.getLastViewedTimestamp({
      surfaceId: SNAPSHOT_LAST_VIEWED_SURFACE_ID,
      accountId: scan.accountId,
    });
  const sinceLastChecked =
    resolvedLastViewedTimestamp === undefined
      ? undefined
      : createSinceLastChecked({
          sinceTimestamp: resolvedLastViewedTimestamp,
          accountId: scan.accountId,
          eventQueries: eventLedgerQueries,
        });

  const prices = Object.values(scan.quotes).map((quote) => quote.price);
  const portfolioValue = prices.reduce((sum, price) => sum + price, 0);
  const changeValues = Object.values(scan.pctChangeBySymbol ?? {});
  const change24h =
    changeValues.length > 0
      ? changeValues.reduce((sum, change) => sum + change, 0) / changeValues.length
      : 0;

  const defaultBundleId = defaultBundleIdsForProfile(params.profile)[0];
  const bundleName =
    STRATEGY_BUNDLES.find((bundle) => bundle.id === defaultBundleId)?.name ?? 'Unknown bundle';

  const strategyAlignment = formatAlignmentState(summarizeAlignment(eventStream.events));
  const orientationContext = createOrientationContext({
    accountId: scan.accountId,
    currentEvents: eventStream.events,
    strategyAlignment,
    sinceLastChecked,
  });
  const debugObservatory = params.includeDebugObservatory
    ? buildDebugObservatoryPayload({
        timestampMs: scan.quoteMeta?.timestampMs ?? strategyNowMs,
        symbols: scan.symbols,
        quotes: scan.quotes,
        quoteMeta: scan.quoteMeta,
        deltas: scan.pctChangeBySymbol,
        strategySignals: signals,
        marketEvents: eventStream.events,
        eventLedger,
        accountId: scan.accountId,
        snapshot: {
          portfolioValue,
          change24h,
          strategyAlignment,
          bundleName,
          accountId: scan.accountId,
        },
      })
    : undefined;

  return {
    portfolioValue,
    change24h,
    strategyAlignment,
    bundleName,
    scan,
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
    debugObservatory,
  };
}
