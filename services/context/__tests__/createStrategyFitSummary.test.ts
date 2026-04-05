import { createStrategyFitSummary } from '@/services/context/createStrategyFitSummary';
import type { PreparedContextInputs } from '@/services/context/types';

function createContextInputs(
  overrides: Partial<PreparedContextInputs> = {},
): PreparedContextInputs {
  return {
    alignmentState: 'ALIGNED',
    contextStrength: 'SUPPORTED',
    currentState: 'UP',
    hasEstimatedContext: false,
    volatilityContext: {
      state: 'CALM',
    },
    structureContext: {
      posture: 'STABLE',
    },
    conditionState: 'ORDERLY',
    fitSupport: 'SUPPORTED',
    historicalGrounding: null,
    ...overrides,
  };
}

describe('createStrategyFitSummary', () => {
  it('returns a favourable descriptive fit when broader structure is stable and calm', () => {
    expect(
      createStrategyFitSummary({
        contextInputs: createContextInputs(),
      }),
    ).toEqual({
      state: 'FAVOURABLE',
      summary:
        'Conditions look broadly favourable for this strategy. Broader structure remains stable and volatility is closer to recent norms.',
    });
  });

  it('returns a mixed descriptive fit for elevated volatility without turning directive', () => {
    const result = createStrategyFitSummary({
      contextInputs: createContextInputs({
        alignmentState: 'WATCHFUL',
        currentState: 'DOWN',
        volatilityContext: {
          state: 'ELEVATED',
        },
        structureContext: {
          posture: 'MIXED',
        },
        conditionState: 'MIXED',
        fitSupport: 'NEUTRAL',
      }),
    });

    expect(result).toEqual({
      state: 'MIXED',
      summary:
        'Conditions look mixed for this strategy while volatility stays elevated relative to recent conditions.',
    });
    expect(result.summary).not.toMatch(/should|trade|act|buy|sell|switch/i);
  });

  it('returns an unfavourable fit when volatility expansion and strained structure align', () => {
    expect(
      createStrategyFitSummary({
        contextInputs: createContextInputs({
          alignmentState: 'NEEDS_REVIEW',
          currentState: 'DOWN',
          volatilityContext: {
            state: 'EXPANDING',
          },
          structureContext: {
            posture: 'STRAINED',
          },
          conditionState: 'STRESSED',
          fitSupport: 'STRAINED',
        }),
      }),
    ).toEqual({
      state: 'UNFAVOURABLE',
      summary:
        'Conditions look unfavourable for this strategy while volatility is expanding and broader structure looks strained.',
    });
  });

  it('returns unknown honestly when richer interpreted context is still too thin', () => {
    const result = createStrategyFitSummary({
      contextInputs: createContextInputs({
        alignmentState: 'WATCHFUL',
        contextStrength: 'THIN',
        currentState: 'FLAT',
        hasEstimatedContext: true,
        volatilityContext: null,
        structureContext: null,
        conditionState: 'UNKNOWN',
        fitSupport: 'UNKNOWN',
      }),
    });

    expect(result).toEqual({
      state: 'UNKNOWN',
      summary:
        'There is not enough confirmed interpreted context yet to describe strategy fit clearly.',
    });
  });

  it('is deterministic for the same interpreted inputs', () => {
    const params = {
      contextInputs: createContextInputs({
        alignmentState: 'WATCHFUL',
        volatilityContext: {
          state: 'EXPANDING',
        },
        structureContext: {
          posture: 'MIXED',
        },
        conditionState: 'MIXED',
        fitSupport: 'NEUTRAL',
      }),
    };

    expect(createStrategyFitSummary(params)).toEqual(createStrategyFitSummary(params));
  });
});
