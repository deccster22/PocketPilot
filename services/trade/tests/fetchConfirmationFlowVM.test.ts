import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { fetchConfirmationFlowVM } from '@/services/trade/fetchConfirmationFlowVM';
import { fetchTradePlanConfirmationVM } from '@/services/trade/fetchTradePlanConfirmationVM';

jest.mock('@/services/trade/fetchTradePlanConfirmationVM');

describe('fetchConfirmationFlowVM', () => {
  const mockFetchTradePlanConfirmationVM = jest.mocked(fetchTradePlanConfirmationVM);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('consumes the prepared confirmation shell and returns a prepared confirmation flow', async () => {
    mockFetchTradePlanConfirmationVM.mockResolvedValue({
      confirmationShell: {
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
          pathType: 'GUIDED_SEQUENCE',
          stepsLabel: 'Review separate order steps',
          executionAvailable: false,
        },
        constraints: {
          cooldownActive: true,
        },
        placeholders: {
          orderPayloadAvailable: false,
          executionPreviewAvailable: false,
        },
      },
      selectedPlanId: 'plan-btc',
      scan: {
        accountId: 'acct-live',
        symbols: ['BTC'],
        quotes: {},
        baselineQuotes: undefined,
        pctChangeBySymbol: {},
        estimatedFlags: {},
        instrumentation: {
          requests: 1,
          symbolsRequested: 1,
          symbolsFetched: 0,
          symbolsBlocked: 0,
        },
        quoteMeta: {
          role: 'execution',
          providerId: 'broker:live',
          freshness: 'UNAVAILABLE',
          certainty: 'UNAVAILABLE',
          lastUpdatedAt: null,
          lastGoodAt: null,
          usedLastGood: false,
          fallbackUsed: false,
          requestedSymbols: ['BTC'],
          returnedSymbols: [],
          missingSymbols: ['BTC'],
          timestampMs: 1_700_000_000_000,
          providersTried: ['broker:live'],
          sourceBySymbol: {},
          coalescedRequest: false,
          policyStateBySymbol: { BTC: 'UNAVAILABLE' },
          providerHealthSummary: {
            'broker:live': {
              providerId: 'broker:live',
              requests: 1,
              symbolsRequested: 1,
              symbolsFetched: 0,
              symbolsBlocked: 0,
              cooldown: 'INACTIVE',
            },
          },
          policy: {
            staleIfError: 'FAILED_WITHOUT_LAST_GOOD',
            staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY',
            cooldown: 'INACTIVE',
            cooldownSkippedProviders: [],
          },
        },
      },
    });

    const result = await fetchConfirmationFlowVM({
      profile: 'ADVANCED',
      selectedPlanId: 'plan-btc',
    });

    expect(result.selectedPlanId).toBe('plan-btc');
    expect(result.actions).not.toBeNull();
    expect(result.confirmationFlow).toEqual({
      planId: 'plan-btc',
      steps: [
        {
          stepId: 'review',
          type: 'REVIEW',
          label: 'Review separate order steps',
          completed: false,
          acknowledged: false,
          required: true,
          acknowledgementLabel: 'Acknowledge review',
        },
        {
          stepId: 'constraint-check',
          type: 'CONSTRAINT_CHECK',
          label: 'Review constraints: cooldown active',
          completed: false,
          acknowledged: false,
          required: true,
          acknowledgementLabel: 'Acknowledge constraints',
        },
        {
          stepId: 'unavailable',
          type: 'UNAVAILABLE',
          label: 'Execution remains unavailable in this phase',
          completed: false,
          acknowledged: false,
          required: true,
        },
        {
          stepId: 'confirm-intent',
          type: 'CONFIRM_INTENT',
          label: 'Confirm user intent before any later execution step',
          completed: false,
          acknowledged: false,
          required: true,
          acknowledgementLabel: 'Acknowledge intent',
        },
      ],
      currentStepId: 'review',
      canProceed: false,
      allRequiredAcknowledged: false,
      blockedReason: 'Execution remains unavailable in this phase.',
    });
    expect(
      result.actions?.acknowledgeStep(result.confirmationFlow!, 'review').steps[0].acknowledged,
    ).toBe(true);
    expect(JSON.stringify(result.confirmationFlow)).not.toContain('hidden-signal');
  });

  it('returns null when no confirmation shell is available', async () => {
    mockFetchTradePlanConfirmationVM.mockResolvedValue({
      confirmationShell: null,
      selectedPlanId: null,
      scan: {
        accountId: 'acct-live',
        symbols: [],
        quotes: {},
        baselineQuotes: undefined,
        pctChangeBySymbol: {},
        estimatedFlags: {},
        instrumentation: {
          requests: 0,
          symbolsRequested: 0,
          symbolsFetched: 0,
          symbolsBlocked: 0,
        },
        quoteMeta: {
          role: 'execution',
          providerId: 'broker:live',
          freshness: 'UNAVAILABLE',
          certainty: 'UNAVAILABLE',
          lastUpdatedAt: null,
          lastGoodAt: null,
          usedLastGood: false,
          fallbackUsed: false,
          requestedSymbols: [],
          returnedSymbols: [],
          missingSymbols: [],
          timestampMs: 1_700_000_000_000,
          providersTried: ['broker:live'],
          sourceBySymbol: {},
          coalescedRequest: false,
          policyStateBySymbol: {},
          providerHealthSummary: {
            'broker:live': {
              providerId: 'broker:live',
              requests: 0,
              symbolsRequested: 0,
              symbolsFetched: 0,
              symbolsBlocked: 0,
              cooldown: 'INACTIVE',
            },
          },
          policy: {
            staleIfError: 'FAILED_WITHOUT_LAST_GOOD',
            staleWhileRevalidate: 'NOT_IMPLEMENTED_FOREGROUND_ONLY',
            cooldown: 'INACTIVE',
            cooldownSkippedProviders: [],
          },
        },
      },
    });

    const result = await fetchConfirmationFlowVM({
      profile: 'ADVANCED',
    });

    expect(result.confirmationFlow).toBeNull();
    expect(result.actions).toBeNull();
    expect(result.selectedPlanId).toBeNull();
  });

  it('keeps orchestration in services and out of snapshot and dashboard paths', () => {
    const serviceSource = readFileSync(
      join(process.cwd(), 'services', 'trade', 'fetchConfirmationFlowVM.ts'),
      'utf8',
    );

    expect(serviceSource).not.toMatch(/fetchSnapshotVM/);
    expect(serviceSource).not.toMatch(/snapshotService/);
    expect(serviceSource).not.toMatch(/fetchDashboardSurfaceVM/);
    expect(serviceSource).not.toMatch(/dashboardSurfaceService/);
  });
});
