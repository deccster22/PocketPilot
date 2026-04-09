import { listCatalog } from '@/core/strategy/catalog';
import type { StrategyCatalogEntry } from '@/core/strategy/catalogTypes';
import type { StrategyId } from '@/core/strategy/types';
import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';
import type { KnowledgeCatalogEntry } from '@/services/knowledge/types';

import { createStrategyNavigatorVM } from './createStrategyNavigatorVM';
import { listStrategyPreviewScenarios } from './strategyPreviewScenarios';
import type {
  StrategyNavigatorSurface,
  StrategyNavigatorVM,
  StrategyPreviewScenario,
  StrategyPreviewScenarioId,
} from './types';

const PREVIEW_STRATEGY_IDS = new Set<StrategyId>([
  'data_quality',
  'momentum_basics',
  'dip_buying',
  'trend_following',
  'mean_reversion',
  'fib_levels',
]);

function listPreviewStrategies(
  strategies: ReadonlyArray<StrategyCatalogEntry>,
): StrategyCatalogEntry[] {
  return strategies.filter((strategy) => PREVIEW_STRATEGY_IDS.has(strategy.id));
}

function createGeneratedAt(nowMs: number | null | undefined): string | null {
  if (nowMs === null || nowMs === undefined || Number.isNaN(nowMs)) {
    return null;
  }

  return new Date(nowMs).toISOString();
}

export function fetchStrategyNavigatorVM(params?: {
  surface?: StrategyNavigatorSurface;
  selectedStrategyId?: StrategyId | null;
  selectedScenarioId?: StrategyPreviewScenarioId | null;
  nowProvider?: () => number;
  strategies?: ReadonlyArray<StrategyCatalogEntry>;
  scenarios?: ReadonlyArray<StrategyPreviewScenario>;
  knowledgeNodes?: ReadonlyArray<KnowledgeCatalogEntry> | null;
}): StrategyNavigatorVM {
  const strategies = listPreviewStrategies(params?.strategies ?? listCatalog());
  const scenarios = params?.scenarios ?? listStrategyPreviewScenarios();

  return createStrategyNavigatorVM({
    generatedAt: createGeneratedAt((params?.nowProvider ?? Date.now)()),
    selectedStrategyId: params?.selectedStrategyId,
    selectedScenarioId: params?.selectedScenarioId,
    strategies,
    scenarios,
    knowledgeNodes: params?.knowledgeNodes ?? knowledgeCatalog,
    surface: params?.surface,
  });
}
