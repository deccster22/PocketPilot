import type { StrategyId } from '@/core/strategy/types';
import type { KnowledgeCatalogEntry } from '@/services/knowledge/types';

import type {
  StrategyNavigatorSurface,
  StrategyPreviewFocus,
  StrategyPreviewKnowledgeFollowThrough,
  StrategyPreviewScenarioId,
} from './types';

type TopicHint = {
  topicId: string;
  reason: string;
  weight: number;
  requiresPrimaryRelation?: boolean;
};

type CandidateScore = {
  topicId: string;
  title: string;
  score: number;
  bestReason: string;
  bestWeight: number;
};

const MAX_ITEMS = 2;

const ENABLED_SURFACES = new Set<StrategyNavigatorSurface>(['STRATEGY_NAVIGATOR']);

const PRIMARY_TOPIC_HINTS: Readonly<Record<StrategyId, TopicHint>> = {
  data_quality: {
    topicId: 'pp-estimated-vs-confirmed-context',
    reason:
      'This preview is mainly about certainty limits and provisional context, so this is the clearest supporting explainer.',
    weight: 9,
  },
  momentum_basics: {
    topicId: 'strategy-momentum-pulse',
    reason:
      'This preview keeps the momentum lens grounded in pace, follow-through, and whether acceleration still looks orderly.',
    weight: 9,
  },
  dip_buying: {
    topicId: 'strategy-buy-the-dip',
    reason:
      'This preview is about pullbacks and stabilisation, so this is the clearest strategy follow-through if you want more context.',
    weight: 9,
  },
  trend_following: {
    topicId: 'strategy-trend-follow',
    reason:
      'This preview is about whether direction still has structure behind it, so this is the clearest strategy follow-through.',
    weight: 9,
  },
  mean_reversion: {
    topicId: 'strategy-reversion-bounce',
    reason:
      'This preview is about stretch, exhaustion, and an attempted unwind, so this is the clearest strategy follow-through.',
    weight: 9,
  },
  fib_levels: {
    topicId: 'strategy-fibonacci-zones',
    reason:
      'This preview is about structure, zones, and measured reactions, so this is the clearest strategy follow-through.',
    weight: 9,
  },
  snapshot_change: {
    topicId: 'pp-what-strategy-status-means',
    reason:
      'This preview is about strategy-state interpretation, so this topic is the clearest supporting explainer.',
    weight: 9,
  },
  noop: {
    topicId: 'pp-what-strategy-preview-strategy-navigator-is-for',
    reason:
      'This preview is still exploratory rather than actionable, so the navigator explainer is the clearest supporting read.',
    weight: 9,
  },
};

const SCENARIO_HINTS: Readonly<Record<StrategyPreviewScenarioId, ReadonlyArray<TopicHint>>> = {
  DIP_VOLATILITY: [
    {
      topicId: 'pp-estimated-vs-confirmed-context',
      reason:
        'This simulated dip stays unsettled, so certainty boundaries matter before the move sounds cleaner than it is.',
      weight: 5,
      requiresPrimaryRelation: true,
    },
  ],
  TREND_CONTINUATION: [
    {
      topicId: 'pp-what-market-regime-means',
      reason:
        'This simulated continuation makes more sense when the broader backdrop still has room in the interpretation.',
      weight: 5,
      requiresPrimaryRelation: true,
    },
  ],
  MIXED_REVERSAL: [
    {
      topicId: 'pp-estimated-vs-confirmed-context',
      reason:
        'This simulated reversal stays mixed, so certainty boundaries still matter before it sounds settled.',
      weight: 5,
      requiresPrimaryRelation: true,
    },
    {
      topicId: 'pp-what-market-regime-means',
      reason:
        'This simulated reversal is easier to read when you compare the attempted turn with the broader backdrop.',
      weight: 4,
      requiresPrimaryRelation: true,
    },
  ],
  RANGE_COMPRESSION: [
    {
      topicId: 'pp-what-market-regime-means',
      reason:
        'This simulated pause is mostly about the broader environment tightening rather than resolving, so regime context helps.',
      weight: 5,
      requiresPrimaryRelation: true,
    },
  ],
};

const FOCUS_HINTS: ReadonlyArray<{ pattern: RegExp; hint: TopicHint }> = [
  {
    pattern: /\bestimated\b|\bconfirmed\b|\bcertainty\b|\bprovisional\b|\bdata-quality\b/i,
    hint: {
      topicId: 'pp-estimated-vs-confirmed-context',
      reason:
        'This preview keeps returning to certainty boundaries, so this concept is the clearest supporting follow-through.',
      weight: 3,
      requiresPrimaryRelation: true,
    },
  },
  {
    pattern: /\bbroader\b|\bbackdrop\b|\bstructure\b|\btrend\b|\brange\b|\bcompression\b|\bzone\b|\blevel\b/i,
    hint: {
      topicId: 'pp-what-market-regime-means',
      reason:
        'This preview keeps returning to broader structure and backdrop support, so regime context is the clearest supporting follow-through.',
      weight: 3,
      requiresPrimaryRelation: true,
    },
  },
  {
    pattern:
      /\bprice-movement events\b|\bestimated-price events\b|\bdip-detected events\b|\bmomentum-building events\b|\bdata-quality events\b/i,
    hint: {
      topicId: 'pp-what-a-marketevent-is',
      reason:
        'This preview keeps pointing to interpreted market events, so this explainer is a useful next step if you want that language unpacked.',
      weight: 2,
      requiresPrimaryRelation: true,
    },
  },
];

function addHint(
  scores: Map<string, CandidateScore>,
  nodesByTopicId: ReadonlyMap<string, KnowledgeCatalogEntry>,
  primaryTopic: KnowledgeCatalogEntry | undefined,
  hint: TopicHint,
) {
  if (
    hint.requiresPrimaryRelation &&
    primaryTopic &&
    primaryTopic.topicId !== hint.topicId &&
    !primaryTopic.relatedTopicIds.includes(hint.topicId)
  ) {
    return;
  }

  const entry = nodesByTopicId.get(hint.topicId);

  if (!entry) {
    return;
  }

  const existing = scores.get(entry.topicId);

  if (!existing) {
    scores.set(entry.topicId, {
      topicId: entry.topicId,
      title: entry.title,
      score: hint.weight,
      bestReason: hint.reason,
      bestWeight: hint.weight,
    });
    return;
  }

  existing.score += hint.weight;

  if (
    hint.weight > existing.bestWeight ||
    (hint.weight === existing.bestWeight &&
      hint.reason.localeCompare(existing.bestReason) < 0)
  ) {
    existing.bestReason = hint.reason;
    existing.bestWeight = hint.weight;
  }
}

function collectFocusHints(focus: StrategyPreviewFocus): TopicHint[] {
  const text = [focus.snapshotHeadline, ...focus.dashboardFocus, ...focus.eventHighlights, focus.alertPosture]
    .join(' ')
    .trim();

  if (text.length === 0) {
    return [];
  }

  return FOCUS_HINTS.filter(({ pattern }) => pattern.test(text)).map(({ hint }) => hint);
}

export function selectStrategyPreviewKnowledge(params: {
  surface?: StrategyNavigatorSurface;
  strategyId: StrategyId;
  scenarioId: StrategyPreviewScenarioId;
  focus: StrategyPreviewFocus;
  nodes: ReadonlyArray<KnowledgeCatalogEntry> | null | undefined;
}): StrategyPreviewKnowledgeFollowThrough {
  const surface = params.surface ?? 'STRATEGY_NAVIGATOR';

  if (!ENABLED_SURFACES.has(surface)) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    };
  }

  if (!params.nodes || params.nodes.length === 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'KNOWLEDGE_UNAVAILABLE',
    };
  }

  const nodesByTopicId = new Map(params.nodes.map((node) => [node.topicId, node] as const));
  const primaryHint = PRIMARY_TOPIC_HINTS[params.strategyId];
  const primaryTopic = primaryHint ? nodesByTopicId.get(primaryHint.topicId) : undefined;
  const scores = new Map<string, CandidateScore>();

  if (primaryHint) {
    addHint(scores, nodesByTopicId, primaryTopic, primaryHint);
  }

  (SCENARIO_HINTS[params.scenarioId] ?? []).forEach((hint) =>
    addHint(scores, nodesByTopicId, primaryTopic, hint),
  );
  collectFocusHints(params.focus).forEach((hint) =>
    addHint(scores, nodesByTopicId, primaryTopic, hint),
  );

  const items = [...scores.values()]
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
    .slice(0, MAX_ITEMS)
    .map((item) => ({
      topicId: item.topicId,
      title: item.title,
      reason: item.bestReason,
    }));

  if (items.length === 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_RELEVANT_KNOWLEDGE',
    };
  }

  return {
    status: 'AVAILABLE',
    items,
  };
}
