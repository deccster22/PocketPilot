import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createDashboardScreenViewData } from '@/app/screens/dashboardScreenView';

describe('createDashboardScreenViewData', () => {
  it('reads the prepared Dashboard surface contract and prepared why note without re-ranking it', () => {
    const view = createDashboardScreenViewData({
      model: {
        primeZone: {
          items: [
            {
              symbol: 'BTC',
              accountId: 'acct-1',
              strategyId: 'strategy-a',
              eventType: 'MOMENTUM_BUILDING',
              alignmentState: 'WATCHFUL',
              trendDirection: 'strengthening',
              certainty: 'confirmed',
              timestamp: 500,
            },
          ],
        },
        secondaryZone: {
          items: [
            {
              symbol: 'ETH',
              accountId: 'acct-1',
              strategyId: 'strategy-b',
              eventType: 'ESTIMATED_PRICE',
              alignmentState: 'NEEDS_REVIEW',
              trendDirection: 'neutral',
              certainty: 'estimated',
              timestamp: 490,
            },
          ],
        },
        deepZone: {
          items: [
            {
              symbol: 'SOL',
              accountId: 'acct-1',
              strategyId: 'strategy-c',
              eventType: 'PRICE_MOVEMENT',
              alignmentState: 'ALIGNED',
              trendDirection: 'neutral',
              certainty: 'estimated',
              timestamp: 480,
            },
          ],
        },
        meta: {
          profile: 'ADVANCED',
          hasPrimeItems: true,
          hasSecondaryItems: true,
          hasDeepItems: true,
        },
      },
      scan: {} as never,
      explanation: {
        status: 'AVAILABLE',
        explanation: {
          title: 'Why BTC is in focus',
          summary: 'BTC is in focus because momentum is strengthening in the current interpreted picture.',
          contextNote:
            'The current state remains watchful, so this stays active without reading as settled.',
          confidence: 'MODERATE',
          confidenceNote:
            'Confidence is moderate because more than one prepared input supports this interpretation. It reflects evidence support, not a guaranteed outcome.',
          lineage: [
            {
              kind: 'MARKET_EVENT',
              label: 'BTC momentum context',
              detail: 'BTC remains in focus because momentum is strengthening in the current interpreted picture.',
              timestamp: '2026-04-01T00:00:00.000Z',
            },
          ],
          limitations: ['This explanation reflects current interpreted conditions only.'],
        },
      },
    });

    expect(view).toEqual({
      profileLabel: 'ADVANCED',
      primeZone: {
        title: 'Prime Zone',
        items: [
          {
            title: 'BTC - Momentum building',
            subtitle: 'Strengthening | watchful',
            certaintyText: 'Confirmed',
          },
        ],
      },
      secondaryZone: {
        title: 'Secondary Zone',
        items: [
          {
            title: 'ETH - Estimated price',
            subtitle: 'Neutral | needs review',
            certaintyText: 'Estimated',
          },
        ],
      },
      deepZone: {
        title: 'Deep Zone',
        items: [
          {
            title: 'SOL - Price movement',
            subtitle: 'Neutral | aligned',
            certaintyText: 'Estimated',
          },
        ],
      },
      explanation: {
        visible: true,
        title: 'Why BTC is in focus',
        summary: 'BTC is in focus because momentum is strengthening in the current interpreted picture.',
        confidenceText: 'Support: Moderate',
        confidenceNote:
          'Confidence is moderate because more than one prepared input supports this interpretation. It reflects evidence support, not a guaranteed outcome.',
        detail: {
          contextNote:
            'The current state remains watchful, so this stays active without reading as settled.',
          lineage: [
            {
              label: 'BTC momentum context',
              detail:
                'BTC remains in focus because momentum is strengthening in the current interpreted picture.',
            },
          ],
          limitations: ['This explanation reflects current interpreted conditions only.'],
        },
      },
    });
  });

  it('keeps the screen helper on the prepared explanation contract only', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'dashboardScreenView.ts'),
      'utf8',
    );

    expect(source).toMatch(/surface\.explanation\.status === 'AVAILABLE'/);
    expect(source).not.toMatch(/createExplanationSummary|signalsTriggered|eventId|providerId|metadata/);
  });

  it('returns null when the prepared surface is unavailable', () => {
    expect(createDashboardScreenViewData(null)).toBeNull();
  });

  it('hides the explanation card when the prepared explanation is unavailable', () => {
    expect(
      createDashboardScreenViewData({
        model: {
          primeZone: { items: [] },
          secondaryZone: { items: [] },
          deepZone: { items: [] },
          meta: {
            profile: 'BEGINNER',
            hasPrimeItems: false,
            hasSecondaryItems: false,
            hasDeepItems: false,
          },
        },
        scan: {} as never,
        explanation: {
          status: 'UNAVAILABLE',
          reason: 'NO_EXPLANATION_TARGET',
        },
      }),
    ).toMatchObject({
      explanation: {
        visible: false,
      },
    });
  });
});
