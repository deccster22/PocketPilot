import { STRATEGY_BUNDLES } from '@/core/strategy/bundles';
import { defaultBundleIdsForProfile } from '@/core/strategy/profileDefaults';
import { QuoteBroker } from '@/providers/quoteBroker';
import { fetchLiveQuotes } from '@/providers/liveQuoteFetcher';
import type { UserProfile } from '@/app/state/profileState';
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
};

export async function fetchSnapshotVM(params: {
  profile: UserProfile;
  baselineScan?: ForegroundScanResult;
  nowProvider?: () => number;
}): Promise<SnapshotVM> {
  const nowProvider = params.nowProvider ?? Date.now;
  const broker = new QuoteBroker({
    mode: 'CALM',
    fetcher: fetchLiveQuotes,
    nowProvider,
  });

  const scan = await runForegroundScan(
    { broker },
    {
      accounts: SNAPSHOT_ACCOUNTS,
      symbols: [...SNAPSHOT_SYMBOLS],
      baselineQuotes: params.baselineScan?.quotes,
    },
  );

  const strategies = resolveActiveStrategies({ profile: params.profile });
  const signals = runStrategies({
    scan,
    baselineScan: params.baselineScan,
    strategies,
    nowMs: nowProvider(),
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

  const strategyAlignment = signals.length === 0 ? 'Aligned' : 'Needs review';

  return {
    portfolioValue,
    change24h,
    strategyAlignment,
    bundleName,
    scan,
    signals,
  };
}
