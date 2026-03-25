import { fetchExecutionPreviewVM } from '@/services/trade/fetchExecutionPreviewVM';
import type { ConfirmationSession, TradePlanConfirmationPathType } from '@/services/trade/types';

function createSession(pathType: TradePlanConfirmationPathType): ConfirmationSession {
  return {
    planId: 'plan-btc',
    preview: {
      planId: 'plan-btc',
      headline: {
        intentType: 'ACCUMULATE',
        symbol: 'BTC',
        actionState: 'READY',
      },
      rationale: {
        summary: 'summary',
        primaryEventId: 'event-1',
        supportingEventIds: ['event-1'],
        supportingEventCount: 1,
      },
      constraints: {
        requiresConfirmation: true,
      },
      readiness: {
        alignment: 'ALIGNED',
        certainty: 'HIGH',
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
        actionState: 'READY',
      },
      readiness: {
        alignment: 'ALIGNED',
        certainty: 'HIGH',
      },
      confirmation: {
        requiresConfirmation: true,
        pathType,
        stepsLabel: 'Single confirmation flow',
        executionAvailable: false,
      },
      constraints: {},
      placeholders: {
        orderPayloadAvailable: false,
        executionPreviewAvailable: false,
      },
    },
    flow: null,
  };
}

describe('fetchExecutionPreviewVM', () => {
  it('returns a prepared non-executing execution preview VM from the confirmation session', async () => {
    const result = await fetchExecutionPreviewVM({
      confirmationSession: createSession('BRACKET'),
    });

    expect(result).toEqual({
      planId: 'plan-btc',
      adapterCapability: {
        adapterId: 'adapter-preview-bracket',
        supportsBracket: true,
        supportsOCO: false,
        supportsMarketBuy: true,
        supportsLimitBuy: true,
        supportsStopLoss: true,
        supportsTakeProfit: true,
      },
      pathPreview: {
        planId: 'plan-btc',
        adapterId: 'adapter-preview-bracket',
        confirmationPathType: 'BRACKET',
        payloadType: 'BRACKET',
        label: 'Bracket payload placeholder',
        supported: true,
        executable: false,
      },
      payloadPreview: {
        payloadType: 'BRACKET',
        symbol: 'BTC',
        orderCount: 1,
        fieldsPresent: ['symbol', 'entryOrderType', 'stopLossPrice', 'takeProfitPrice'],
        executable: false,
      },
    });
    expect(JSON.stringify(result)).not.toContain('hidden-signal');
  });

  it('returns null preview sections when no confirmation session shell is available', async () => {
    expect(
      await fetchExecutionPreviewVM({
        confirmationSession: {
          planId: null,
          preview: null,
          shell: null,
          flow: null,
        },
      }),
    ).toEqual({
      planId: null,
      adapterCapability: null,
      pathPreview: null,
      payloadPreview: null,
    });
  });
});
