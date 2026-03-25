import { fetchSubmissionIntentVM } from '@/services/trade/fetchSubmissionIntentVM';
import type { ConfirmationSession } from '@/services/trade/types';

function createSession(pathType: 'BRACKET' | 'GUIDED_SEQUENCE', acknowledged = true): ConfirmationSession {
  return {
    planId: 'plan-btc',
    accountId: 'acct-live',
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
