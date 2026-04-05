import { createThirtyThousandFootVM } from '@/services/context/createThirtyThousandFootVM';
import type { PreparedContextInputs } from '@/services/context/types';

function createContextInputs(
  overrides: Partial<PreparedContextInputs> = {},
): PreparedContextInputs {
  return {
    alignmentState: 'WATCHFUL',
    contextStrength: 'SUPPORTED',
    currentState: 'DOWN',
    hasEstimatedContext: false,
    volatilityContext: {
      state: 'ELEVATED',
    },
    structureContext: {
      posture: 'MIXED',
    },
    conditionState: 'MIXED',
    fitSupport: 'NEUTRAL',
    historicalGrounding: {
      state: 'SUPPORTED',
    },
    ...overrides,
  };
}

describe('createThirtyThousandFootVM', () => {
  it('surfaces richer calm broader context when mixed fit still has honest support', () => {
    const result = createThirtyThousandFootVM({
      generatedAt: '2026-04-05T00:00:00.000Z',
      fit: {
        state: 'MIXED',
        summary:
          'Conditions look mixed for this strategy while volatility stays elevated relative to recent conditions.',
      },
      contextInputs: createContextInputs(),
    });

    expect(result).toEqual({
      generatedAt: '2026-04-05T00:00:00.000Z',
      fit: {
        state: 'MIXED',
        summary:
          'Conditions look mixed for this strategy while volatility stays elevated relative to recent conditions.',
      },
      availability: {
        status: 'AVAILABLE',
        title: 'Broader conditions look mixed',
        summary:
          'Volatility or broader structure looks less settled than Snapshot usually needs to show.',
        details: [
          'Volatility is elevated relative to recent conditions.',
          'Broader structure still leans down, but the broader picture remains mixed.',
          'Current strategy fit currently reads mixed under this backdrop.',
          'Recent interpreted history still supports this broader read.',
        ],
      },
    });
    expect(JSON.stringify(result)).not.toMatch(
      /urgent|warning|alert|trade now|act now|immediately/i,
    );
  });

  it('returns unavailable honestly when there is no broader context worth surfacing', () => {
    expect(
      createThirtyThousandFootVM({
        generatedAt: '2026-04-05T00:00:00.000Z',
        fit: {
          state: 'FAVOURABLE',
          summary:
            'Conditions look broadly favourable for this strategy. Broader structure remains stable and volatility is closer to recent norms.',
        },
        contextInputs: createContextInputs({
          alignmentState: 'ALIGNED',
          contextStrength: 'BASELINE',
          currentState: 'UP',
          volatilityContext: {
            state: 'CALM',
          },
          structureContext: {
            posture: 'STABLE',
          },
          conditionState: 'ORDERLY',
          fitSupport: 'SUPPORTED',
          historicalGrounding: null,
        }),
      }),
    ).toEqual({
      generatedAt: '2026-04-05T00:00:00.000Z',
      fit: {
        state: 'FAVOURABLE',
        summary:
          'Conditions look broadly favourable for this strategy. Broader structure remains stable and volatility is closer to recent norms.',
      },
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NO_MEANINGFUL_CONTEXT',
      },
    });
  });

  it('returns unavailable when interpreted context is still too thin', () => {
    expect(
      createThirtyThousandFootVM({
        generatedAt: '2026-04-05T00:00:00.000Z',
        fit: {
          state: 'UNKNOWN',
          summary:
            'There is not enough confirmed interpreted context yet to describe strategy fit clearly.',
        },
        contextInputs: createContextInputs({
          contextStrength: 'THIN',
          currentState: 'FLAT',
          hasEstimatedContext: true,
          volatilityContext: null,
          structureContext: null,
          conditionState: 'UNKNOWN',
          fitSupport: 'UNKNOWN',
          historicalGrounding: {
            state: 'LIGHT',
          },
        }),
      }),
    ).toEqual({
      generatedAt: '2026-04-05T00:00:00.000Z',
      fit: {
        state: 'UNKNOWN',
        summary:
          'There is not enough confirmed interpreted context yet to describe strategy fit clearly.',
      },
      availability: {
        status: 'UNAVAILABLE',
        reason: 'INSUFFICIENT_INTERPRETED_CONTEXT',
      },
    });
  });

  it('respects surface eligibility inside services instead of app', () => {
    expect(
      createThirtyThousandFootVM({
        generatedAt: '2026-04-05T00:00:00.000Z',
        fit: {
          state: 'MIXED',
          summary:
            'Conditions look mixed for this strategy while volatility stays elevated relative to recent conditions.',
        },
        contextInputs: createContextInputs(),
        surface: 'DASHBOARD',
      }),
    ).toEqual({
      generatedAt: '2026-04-05T00:00:00.000Z',
      fit: {
        state: 'MIXED',
        summary:
          'Conditions look mixed for this strategy while volatility stays elevated relative to recent conditions.',
      },
      availability: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_SURFACE',
      },
    });
  });
});
