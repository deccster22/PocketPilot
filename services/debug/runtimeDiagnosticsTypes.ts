import type {
  CertaintyState,
  FreshnessState,
  ProviderHealthState,
  ProviderRequestRole,
  QuoteSymbolPolicyState,
} from '@/services/providers/types';

export type RuntimeDiagnosticsProviderEntry = {
  providerId: string;
  role: ProviderRequestRole | 'mixed';
  healthState: ProviderHealthState;
  score: number | null;
  recentAttempts: number | null;
  recentSuccesses: number | null;
  recentFailures: number | null;
  recentCooldownSkips: number | null;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
};

export type RuntimeDiagnosticsQuotePolicySummary = {
  coalescedRequest: boolean;
  providersTried: ReadonlyArray<string>;
  cooldownSkippedProviders: ReadonlyArray<string>;
  usedLastGood: boolean;
  freshness: FreshnessState;
  certainty: CertaintyState;
};

export type RuntimeDiagnosticsSymbolEntry = {
  symbol: string;
  providerId: string | null;
  policyState: QuoteSymbolPolicyState | null;
  lastUpdatedAt: string | null;
  lastGoodAt: string | null;
};

export type RuntimeDiagnosticsVM = {
  generatedAt: string | null;
  role: ProviderRequestRole | 'mixed';
  providers: ReadonlyArray<RuntimeDiagnosticsProviderEntry>;
  quotePolicy: RuntimeDiagnosticsQuotePolicySummary | null;
  symbols: ReadonlyArray<RuntimeDiagnosticsSymbolEntry>;
  notes: ReadonlyArray<string>;
};
