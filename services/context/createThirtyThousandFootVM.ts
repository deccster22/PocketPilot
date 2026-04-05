import type { PreparedContextInputs, StrategyFitSummary, ThirtyThousandFootVM } from './types';

type ThirtyThousandFootSurface = 'SNAPSHOT' | 'THIRTY_THOUSAND_FOOT' | 'DASHBOARD' | 'TRADE_HUB';

function isEnabledForSurface(surface: ThirtyThousandFootSurface): boolean {
  return surface === 'SNAPSHOT' || surface === 'THIRTY_THOUSAND_FOOT';
}

function formatFitState(fit: StrategyFitSummary): string {
  switch (fit.state) {
    case 'FAVOURABLE':
      return 'favourable';
    case 'UNFAVOURABLE':
      return 'unfavourable';
    case 'MIXED':
      return 'mixed';
    default:
      return 'unknown';
  }
}

function formatCurrentState(currentState: PreparedContextInputs['currentState']): string | null {
  if (!currentState) {
    return null;
  }

  return currentState.toLowerCase();
}

function shouldSurfaceContext(
  contextInputs: PreparedContextInputs,
  fit: StrategyFitSummary,
): boolean {
  if (contextInputs.contextStrength === 'THIN' || fit.state === 'UNKNOWN') {
    return false;
  }

  if (contextInputs.conditionState === 'STRESSED') {
    return true;
  }

  return (
    contextInputs.conditionState === 'MIXED' &&
    (contextInputs.volatilityContext?.state !== 'CALM' ||
      contextInputs.structureContext?.posture === 'MIXED' ||
      contextInputs.structureContext?.posture === 'STRAINED')
  );
}

function createVolatilityDetail(contextInputs: PreparedContextInputs): string | null {
  switch (contextInputs.volatilityContext?.state) {
    case 'EXPANDING':
      return 'Volatility is expanding relative to recent conditions.';
    case 'ELEVATED':
      return 'Volatility is elevated relative to recent conditions.';
    case 'CALM':
      return 'Volatility is closer to recent norms.';
    default:
      return null;
  }
}

function createStructureDetail(contextInputs: PreparedContextInputs): string | null {
  const currentState = formatCurrentState(contextInputs.currentState);

  switch (contextInputs.structureContext?.posture) {
    case 'STRAINED':
      return currentState
        ? `Broader structure leans ${currentState} and still reads strained.`
        : 'Broader structure still reads strained.';
    case 'MIXED':
      return currentState
        ? `Broader structure still leans ${currentState}, but the broader picture remains mixed.`
        : 'Broader structure remains mixed rather than settled.';
    case 'STABLE':
      return currentState
        ? `Broader structure still leans ${currentState} and remains fairly stable.`
        : 'Broader structure remains fairly stable.';
    default:
      return null;
  }
}

function createFitDetail(
  contextInputs: PreparedContextInputs,
  fit: StrategyFitSummary,
): string | null {
  switch (contextInputs.fitSupport) {
    case 'STRAINED':
      return `Current strategy fit looks ${formatFitState(fit)} under this backdrop.`;
    case 'SUPPORTED':
      return 'Current strategy fit still has support from the broader picture.';
    case 'NEUTRAL':
      return `Current strategy fit currently reads ${formatFitState(fit)} under this backdrop.`;
    default:
      return null;
  }
}

function createGroundingDetail(contextInputs: PreparedContextInputs): string | null {
  switch (contextInputs.historicalGrounding?.state) {
    case 'ACTIVE':
      return 'Recent interpreted history has been active too, so this does not read as an isolated move.';
    case 'SUPPORTED':
      return 'Recent interpreted history still supports this broader read.';
    case 'LIGHT':
      return 'Recent interpreted history is still light, so this broader read should stay modest.';
    default:
      return contextInputs.hasEstimatedContext
        ? 'Part of this broader read still rests on estimated context.'
        : null;
  }
}

export function createThirtyThousandFootVM(params: {
  generatedAt: string | null;
  fit: StrategyFitSummary;
  contextInputs: PreparedContextInputs;
  surface?: ThirtyThousandFootSurface;
}): ThirtyThousandFootVM {
  const surface = params.surface ?? 'SNAPSHOT';

  if (!isEnabledForSurface(surface)) {
    return {
      generatedAt: params.generatedAt,
      fit: params.fit,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
    };
  }

  if (
    params.fit.state === 'UNKNOWN' ||
    params.contextInputs.contextStrength === 'THIN' ||
    params.contextInputs.conditionState === 'UNKNOWN'
  ) {
    return {
      generatedAt: params.generatedAt,
      fit: params.fit,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'INSUFFICIENT_INTERPRETED_CONTEXT',
      },
    };
  }

  if (!shouldSurfaceContext(params.contextInputs, params.fit)) {
    return {
      generatedAt: params.generatedAt,
      fit: params.fit,
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_MEANINGFUL_CONTEXT',
      },
    };
  }

  const details = [
    createVolatilityDetail(params.contextInputs),
    createStructureDetail(params.contextInputs),
    createFitDetail(params.contextInputs, params.fit),
    createGroundingDetail(params.contextInputs),
  ].filter((detail): detail is string => Boolean(detail));

  return {
    generatedAt: params.generatedAt,
    fit: params.fit,
    availability: {
      status: 'AVAILABLE',
      title:
        params.contextInputs.conditionState === 'STRESSED'
          ? 'Broader conditions look strained'
          : 'Broader conditions look mixed',
      summary:
        params.contextInputs.conditionState === 'STRESSED'
          ? 'Volatility is expanding relative to recent conditions, and the broader picture looks more strained than Snapshot usually needs to show.'
          : 'Volatility or broader structure looks less settled than Snapshot usually needs to show.',
      details,
    },
  };
}
