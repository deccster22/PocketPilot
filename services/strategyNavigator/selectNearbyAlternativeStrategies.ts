import type { StrategyCatalogEntry } from '@/core/strategy/catalogTypes';
import type { StrategyId } from '@/core/strategy/types';

import {
  isSupportStrategyMetadataFamily,
  resolveStrategyMetadata,
} from './strategyMetadata';
import type {
  NearbyAlternativeAvailability,
  StrategyMetadata,
  StrategyMetadataTag,
  StrategyNavigatorSurface,
  StrategyPreviewFocus,
  StrategyPreviewScenarioId,
} from './types';

const MAX_NEARBY_ALTERNATIVES = 2;
const MIN_COMPARABLE_SCORE = 3;
const SUPPORT_LENS_PENALTY = -2;
const ENABLED_SURFACES = new Set<StrategyNavigatorSurface>(['STRATEGY_NAVIGATOR']);

const FOCUS_BONUS_CUES: ReadonlyArray<{
  pattern: RegExp;
  tags: ReadonlyArray<StrategyMetadataTag>;
}> = [
  {
    pattern: /\bestimated\b|\bconfirmed\b|\bcertainty\b|\btrustworthy\b|\bcoverage\b/i,
    tags: ['CERTAINTY_SUPPORT'],
  },
  {
    pattern: /\bcontinuation\b|\bfollow-through\b|\btrend\b|\bdirectional\b|\bstrength\b/i,
    tags: [
      'TREND_CONTINUATION',
      'ORDERLY_FOLLOW_THROUGH',
      'TREND_STRUCTURE',
      'DIRECTIONAL_HOLD',
    ],
  },
  {
    pattern: /\bdip\b|\bpullback\b|\bweakness\b|\breversal\b|\bovershoot\b/i,
    tags: ['PULLBACK_STABILIZATION', 'MEAN_RESET', 'OVERSHOOT_EASING'],
  },
  {
    pattern: /\blevel\b|\bzone\b|\bstructure\b|\bsupport\b|\bresistance\b|\bretracement\b/i,
    tags: ['STRUCTURE_LEVELS', 'RETRACEMENT_BEHAVIOR'],
  },
];

type NearbyAlternativeScore = {
  strategyId: StrategyId;
  family: StrategyMetadata['family'];
  score: number;
};

function isEnabledForSurface(surface: StrategyNavigatorSurface): boolean {
  return ENABLED_SURFACES.has(surface);
}

function createFocusText(focus: StrategyPreviewFocus | null | undefined): string {
  if (!focus) {
    return '';
  }

  return [
    focus.snapshotHeadline,
    ...focus.dashboardFocus,
    ...focus.eventHighlights,
    focus.alertPosture,
  ]
    .join(' ')
    .trim();
}

function collectFocusCueTags(focusText: string): Set<StrategyMetadataTag> {
  const cueTags = new Set<StrategyMetadataTag>();

  if (focusText.length === 0) {
    return cueTags;
  }

  for (const cue of FOCUS_BONUS_CUES) {
    if (!cue.pattern.test(focusText)) {
      continue;
    }

    for (const tag of cue.tags) {
      cueTags.add(tag);
    }
  }

  return cueTags;
}

function countTagOverlap(
  leftTags: ReadonlyArray<StrategyMetadataTag>,
  rightTags: ReadonlyArray<StrategyMetadataTag>,
): number {
  if (leftTags.length === 0 || rightTags.length === 0) {
    return 0;
  }

  const rightSet = new Set(rightTags);
  let overlap = 0;

  for (const tag of leftTags) {
    if (rightSet.has(tag)) {
      overlap += 1;
    }
  }

  return overlap;
}

function resolveScenarioBonus(
  candidateMetadata: StrategyMetadata,
  scenarioId: StrategyPreviewScenarioId,
): number {
  return candidateMetadata.scenarioTags.includes(scenarioId) ? 2 : 0;
}

function resolveFocusBonus(
  candidateMetadata: StrategyMetadata,
  cueTags: Set<StrategyMetadataTag>,
): number {
  if (cueTags.size === 0) {
    return 0;
  }

  const candidateTags = new Set([
    ...candidateMetadata.postureTags,
    ...candidateMetadata.contrastNeighborTags,
  ]);
  let score = 0;

  for (const tag of cueTags) {
    if (candidateTags.has(tag)) {
      score += 1;
    }
  }

  return score;
}

function resolveSupportLensPenalty(
  bestFitFamily: StrategyMetadata['family'],
  candidateFamily: StrategyMetadata['family'],
): number {
  if (
    !isSupportStrategyMetadataFamily(bestFitFamily) &&
    isSupportStrategyMetadataFamily(candidateFamily)
  ) {
    return SUPPORT_LENS_PENALTY;
  }

  return 0;
}

function scoreNearbyAlternative(params: {
  bestFitStrategyId: StrategyId;
  bestFitMetadata: StrategyMetadata;
  candidateStrategyId: StrategyId;
  scenarioId: StrategyPreviewScenarioId;
  focusCueTags: Set<StrategyMetadataTag>;
}): NearbyAlternativeScore | null {
  if (params.candidateStrategyId === params.bestFitStrategyId) {
    return null;
  }

  const candidateMetadata = resolveStrategyMetadata(params.candidateStrategyId);

  if (!candidateMetadata) {
    return null;
  }

  const proximityScore =
    countTagOverlap(
      params.bestFitMetadata.contrastNeighborTags,
      candidateMetadata.contrastNeighborTags,
    ) * 2;
  const postureScore = countTagOverlap(
    params.bestFitMetadata.postureTags,
    candidateMetadata.postureTags,
  );
  const sameFamilyBonus =
    params.bestFitMetadata.family === candidateMetadata.family &&
    !isSupportStrategyMetadataFamily(candidateMetadata.family)
      ? 1
      : 0;
  const scenarioBonus = resolveScenarioBonus(candidateMetadata, params.scenarioId);
  const focusBonus = resolveFocusBonus(candidateMetadata, params.focusCueTags);
  const supportLensPenalty = resolveSupportLensPenalty(
    params.bestFitMetadata.family,
    candidateMetadata.family,
  );
  const clearlyDistant =
    proximityScore === 0 &&
    postureScore === 0 &&
    scenarioBonus === 0 &&
    focusBonus === 0 &&
    sameFamilyBonus === 0;

  if (clearlyDistant) {
    return null;
  }

  return {
    strategyId: params.candidateStrategyId,
    family: candidateMetadata.family,
    score:
      proximityScore +
      postureScore +
      sameFamilyBonus +
      scenarioBonus +
      focusBonus +
      supportLensPenalty,
  };
}

function pickTopNearbyAlternatives(
  candidates: ReadonlyArray<NearbyAlternativeScore>,
): NearbyAlternativeScore[] {
  if (candidates.length === 0) {
    return [];
  }

  const preferred = candidates
    .filter((candidate) => candidate.score >= MIN_COMPARABLE_SCORE)
    .slice(0, MAX_NEARBY_ALTERNATIVES);

  if (preferred.length > 0) {
    return preferred;
  }

  return candidates
    .filter((candidate) => candidate.score > 0)
    .slice(0, MAX_NEARBY_ALTERNATIVES);
}

export function selectNearbyAlternativeStrategies(params: {
  surface?: StrategyNavigatorSurface;
  bestFitStrategyId?: StrategyId | null;
  strategies?: ReadonlyArray<Pick<StrategyCatalogEntry, 'id' | 'archetype'>> | null;
  scenarioId?: StrategyPreviewScenarioId | null;
  focus?: StrategyPreviewFocus | null;
}): NearbyAlternativeAvailability {
  const surface = params.surface ?? 'STRATEGY_NAVIGATOR';
  const bestFitStrategyId = params.bestFitStrategyId ?? null;
  const scenarioId = params.scenarioId ?? null;

  if (!isEnabledForSurface(surface)) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    };
  }

  if (!bestFitStrategyId || !scenarioId || !params.strategies || params.strategies.length < 2) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_COMPARABLE_ALTERNATIVES',
    };
  }

  const bestFitStrategy = params.strategies.find(
    (strategy) => strategy.id === bestFitStrategyId,
  );
  const bestFitMetadata = resolveStrategyMetadata(bestFitStrategyId);

  if (!bestFitStrategy || !bestFitMetadata) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_COMPARABLE_ALTERNATIVES',
    };
  }

  const focusCueTags = collectFocusCueTags(createFocusText(params.focus));
  const scoredAlternatives = params.strategies
    .map((candidate) =>
      scoreNearbyAlternative({
        bestFitStrategyId,
        bestFitMetadata,
        candidateStrategyId: candidate.id,
        scenarioId,
        focusCueTags,
      }),
    )
    .filter((score): score is NearbyAlternativeScore => score !== null)
    .sort(
      (left, right) =>
        right.score - left.score || left.strategyId.localeCompare(right.strategyId),
    );
  const primaryAlternatives = scoredAlternatives.filter(
    (candidate) => !isSupportStrategyMetadataFamily(candidate.family),
  );
  const supportAlternatives = scoredAlternatives.filter((candidate) =>
    isSupportStrategyMetadataFamily(candidate.family),
  );
  const selectedPrimaryAlternatives = pickTopNearbyAlternatives(primaryAlternatives);
  const selectedAlternatives =
    selectedPrimaryAlternatives.length > 0
      ? selectedPrimaryAlternatives
      : pickTopNearbyAlternatives(supportAlternatives);

  if (selectedAlternatives.length === 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_COMPARABLE_ALTERNATIVES',
    };
  }

  return {
    status: 'AVAILABLE',
    selection: {
      bestFitStrategyId,
      nearbyAlternativeStrategyIds: selectedAlternatives.map(
        (candidate) => candidate.strategyId,
      ),
    },
  };
}
