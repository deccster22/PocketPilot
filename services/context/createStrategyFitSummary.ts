import type { PreparedContextInputs, StrategyFitSummary } from './types';

function createUnknownSummary(params: {
  hasEstimatedContext: boolean;
  hasBaselineContext: boolean;
}): string {
  if (params.hasEstimatedContext) {
    return 'There is not enough confirmed interpreted context yet to describe strategy fit clearly.';
  }

  if (params.hasBaselineContext) {
    return 'There is not enough richer interpreted context yet to describe strategy fit clearly.';
  }

  return 'There is not enough interpreted context yet to describe strategy fit clearly.';
}

export function createStrategyFitSummary(params: {
  contextInputs: PreparedContextInputs;
}): StrategyFitSummary {
  const { contextInputs } = params;
  const hasBaselineContext =
    contextInputs.alignmentState !== null && contextInputs.currentState !== null;

  if (!contextInputs.alignmentState || contextInputs.contextStrength === 'THIN') {
    return {
      state: 'UNKNOWN',
      summary: createUnknownSummary({
        hasEstimatedContext: contextInputs.hasEstimatedContext,
        hasBaselineContext,
      }),
    };
  }

  if (contextInputs.fitSupport === 'STRAINED') {
    if (
      contextInputs.volatilityContext?.state === 'EXPANDING' &&
      contextInputs.structureContext?.posture === 'STRAINED'
    ) {
      return {
        state: 'UNFAVOURABLE',
        summary:
          'Conditions look unfavourable for this strategy while volatility is expanding and broader structure looks strained.',
      };
    }

    if (contextInputs.structureContext?.posture === 'STRAINED') {
      return {
        state: 'UNFAVOURABLE',
        summary:
          'Conditions look unfavourable for this strategy because broader structure looks strained.',
      };
    }

    return {
      state: 'UNFAVOURABLE',
      summary: 'Conditions look unfavourable for this strategy in the current interpreted picture.',
    };
  }

  if (contextInputs.alignmentState === 'ALIGNED' && contextInputs.fitSupport === 'SUPPORTED') {
    if (contextInputs.structureContext?.posture === 'STABLE') {
      return {
        state: 'FAVOURABLE',
        summary:
          'Conditions look broadly favourable for this strategy. Broader structure remains stable and volatility is closer to recent norms.',
      };
    }

    return {
      state: 'FAVOURABLE',
      summary:
        'Conditions look broadly favourable for this strategy in the current interpreted picture.',
    };
  }

  if (contextInputs.volatilityContext?.state === 'EXPANDING') {
    return {
      state: 'MIXED',
      summary:
        'Conditions look mixed for this strategy while volatility is expanding relative to recent conditions.',
    };
  }

  if (contextInputs.volatilityContext?.state === 'ELEVATED') {
    return {
      state: 'MIXED',
      summary:
        'Conditions look mixed for this strategy while volatility stays elevated relative to recent conditions.',
    };
  }

  if (contextInputs.structureContext?.posture === 'MIXED') {
    return {
      state: 'MIXED',
      summary: 'Conditions look mixed for this strategy because broader structure remains mixed.',
    };
  }

  if (contextInputs.alignmentState === 'WATCHFUL') {
    return {
      state: 'MIXED',
      summary: 'Conditions look mixed for this strategy in the current interpreted picture.',
    };
  }

  return {
    state: 'UNKNOWN',
    summary: createUnknownSummary({
      hasEstimatedContext: contextInputs.hasEstimatedContext,
      hasBaselineContext,
    }),
  };
}
