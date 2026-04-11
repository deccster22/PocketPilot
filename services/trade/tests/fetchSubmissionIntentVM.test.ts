import { fetchSubmissionIntentVM } from '@/services/trade/fetchSubmissionIntentVM';
import type { ConfirmationSession, ExecutionCapabilityResolution } from '@/services/trade/types';

function createPreviewRisk() {
  return {
    activeBasis: 'ACCOUNT_PERCENT' as const,
    activeBasisLabel: 'Account %',
    basisAvailability: {
      status: 'AVAILABLE' as const,
      selectedBasis: 'ACCOUNT_PERCENT' as const,
      options: [
        {
          basis: 'ACCOUNT_PERCENT' as const,
          label: 'Account %',
          isSelected: true,
        },
        {
          basis: 'FIXED_CURRENCY' as const,
          label: 'Fixed currency',
          isSelected: false,
        },
        {
          basis: 'POSITION_PERCENT' as const,
          label: 'Position %',
          isSelected: false,
        },
      ],
    },
    context: {
      status: 'UNAVAILABLE' as const,
      basis: 'ACCOUNT_PERCENT' as const,
      headline: 'Account % risk frame unavailable',
      summary:
        'PocketPilot can frame this basis once prepared entry, stop, and position-cap context are all available.',
      items: [
        {
          label: 'Needed',
          value: 'Prepared entry, prepared stop, and a prepared position cap',
        },
      ],
      reason: 'MISSING_PRICE_REFERENCES' as const,
    },
  };
}

function createSession(pathType: 'BRACKET' | 'GUIDED_SEQUENCE', acknowledged = true): ConfirmationSession {
  const executionCapability =
    pathType === 'BRACKET'
      ? {
          accountId: 'acct-live',
          path: 'BRACKET',
          confirmationPath: 'BRACKET',
          supported: true,
          unavailableReason: null,
        }
      : {
          accountId: 'acct-live',
          path: 'SEPARATE_ORDERS',
          confirmationPath: 'GUIDED_SEQUENCE',
          supported: true,
          unavailableReason: null,
        };

  return {
    planId: 'plan-btc',
    accountId: 'acct-live',
    executionCapability: executionCapability as ExecutionCapabilityResolution,
    preparedRiskReferences: null,
    preview: {
      planId: 'plan-btc',
      headline: {
        intentType: 'ACCUMULATE',
        symbol: 'BTC',
        actionState: 'CAUTION',
      },
      rationale: {
        summary: 'Prepared summary',
        primaryEventId: 'event-1',
        supportingEventIds: ['event-1'],
        supportingEventCount: 1,
      },
      constraints: {
        requiresConfirmation: true,
      },
      readiness: {
        alignment: 'ALIGNED',
        certainty: 'LOW',
      },
      placeholders: {
        orderPreviewAvailable: false,
        executionPreviewAvailable: false,
      },
      risk: createPreviewRisk(),
      positionSizing: {
        status: 'UNAVAILABLE',
        reason: 'INSUFFICIENT_INPUTS',
      },
    },
    shell: {
      planId: 'plan-btc',
      headline: {
        intentType: 'ACCUMULATE',
        symbol: 'BTC',
        actionState: 'CAUTION',
      },
      readiness: {
        alignment: 'ALIGNED',
        certainty: 'LOW',
      },
      confirmation: {
        requiresConfirmation: true,
        pathType,
        stepsLabel: 'Prepared steps',
        executionAvailable: false,
      },
      constraints: {},
      placeholders: {
        orderPayloadAvailable: false,
        executionPreviewAvailable: false,
      },
    },
    flow: {
      planId: 'plan-btc',
      steps: [],
      currentStepId: 'confirm-intent',
      canProceed: acknowledged,
      allRequiredAcknowledged: acknowledged,
      blockedReason: acknowledged
        ? undefined
        : 'Complete all required confirmation steps before proceeding.',
    },
  };
}

describe('fetchSubmissionIntentVM', () => {
  it('returns a blocked submission-intent result when readiness is not eligible', async () => {
    await expect(
      fetchSubmissionIntentVM({
        confirmationSession: createSession('BRACKET', false),
      }),
    ).resolves.toEqual({
      status: 'BLOCKED',
      blockers: [
        {
          code: 'NOT_ACKNOWLEDGED',
          message: 'Complete every required acknowledgement before submission can become eligible.',
        },
      ],
      warnings: [
        {
          code: 'LOW_CERTAINTY',
          message: 'This plan is prepared with low certainty and should be reviewed carefully.',
        },
        {
          code: 'CAUTION_STATE',
          message:
            'This plan is currently in a caution state even when submission becomes eligible.',
        },
      ],
    });
  });

  it('returns a placeholder-ready submission-intent result by composing existing service seams', async () => {
    await expect(
      fetchSubmissionIntentVM({
        confirmationSession: createSession('GUIDED_SEQUENCE', true),
      }),
    ).resolves.toEqual({
      status: 'READY',
      adapterType: 'SEPARATE_ORDERS',
      placeholderOnly: true,
      planId: 'plan-btc',
      accountId: 'acct-live',
      symbol: 'BTC',
      payloadPreview: [
        {
          payloadType: 'SEPARATE_ORDERS',
          symbol: 'BTC',
          orderCount: 3,
          fieldsPresent: [
            'symbol',
            'entryOrderType',
            'entryPreview',
            'stopLossOrder',
            'takeProfitOrder',
          ],
          executable: false,
        },
      ],
      warnings: [
        {
          code: 'LOW_CERTAINTY',
          message: 'This plan is prepared with low certainty and should be reviewed carefully.',
        },
        {
          code: 'CAUTION_STATE',
          message:
            'This plan is currently in a caution state even when submission becomes eligible.',
        },
        {
          code: 'PARTIAL_CAPABILITY',
          message:
            'The prepared path relies on separate-order scaffolding instead of a native combined order path.',
        },
      ],
    });
  });
});
