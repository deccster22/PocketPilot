import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { MessagePolicyAvailability } from '@/services/messages/types';
import type { DashboardSurfaceVM } from '@/services/dashboard/dashboardSurfaceService';
import {
  createDashboardScreenViewData,
  refreshDashboardScreenSurface,
} from '@/app/screens/dashboardScreenView';

function createSurface(): DashboardSurfaceVM {
  return {
    accountContext: {
      status: 'AVAILABLE',
      account: {
        accountId: 'acct-1',
        displayName: 'Primary account',
        selectionMode: 'PRIMARY_FALLBACK',
        baseCurrency: 'USD',
        strategyId: 'momentum_basics',
      },
      switching: {
        status: 'AVAILABLE',
        selectedAccountId: 'acct-1',
        options: [
          {
            accountId: 'acct-1',
            displayName: 'Primary account',
            strategyId: 'momentum_basics',
            isPrimary: true,
            isSelected: true,
          },
          {
            accountId: 'acct-2',
            displayName: 'Backup account',
            strategyId: 'dip_buying',
            isPrimary: false,
            isSelected: false,
          },
        ],
      },
    },
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
        profile: 'ADVANCED' as const,
        hasPrimeItems: true,
        hasSecondaryItems: true,
        hasDeepItems: true,
      },
    },
    scan: { accountId: 'acct-1' } as never,
    explanation: {
      status: 'AVAILABLE' as const,
      explanation: {
        title: 'Why BTC is in focus',
        summary:
          'BTC is in focus because momentum is strengthening in the current interpreted picture.',
        contextNote:
          'The current state remains watchful, so this stays active without reading as settled.',
        confidence: 'MODERATE' as const,
        confidenceNote:
          'Confidence is moderate because more than one prepared input supports this interpretation. It reflects evidence support, not a guaranteed outcome.',
        lineage: [
          {
            kind: 'MARKET_EVENT' as const,
            label: 'BTC momentum context',
            detail:
              'BTC remains in focus because momentum is strengthening in the current interpreted picture.',
            timestamp: '2026-04-01T00:00:00.000Z',
          },
        ],
        limitations: ['This explanation reflects current interpreted conditions only.'],
      },
    },
  };
}

describe('createDashboardScreenViewData', () => {
  it('reads the prepared Dashboard surface contract and prepared why note without re-ranking it', () => {
    const view = createDashboardScreenViewData(createSurface());

    expect(view).toEqual({
      profileLabel: 'ADVANCED',
      accountContext: {
        visible: true,
        title: 'Current account: Primary account',
        summary: 'Primary-account context | USD base currency | Strategy momentum_basics',
        switcher: {
          visible: true,
          title: 'Account context controls',
          summary: 'Switch deliberately or mark one primary fallback.',
          options: [
            {
              accountId: 'acct-1',
              title: 'Primary account',
              summary: 'Strategy momentum_basics',
              isSelected: true,
              isPrimary: true,
            },
            {
              accountId: 'acct-2',
              title: 'Backup account',
              summary: 'Strategy dip_buying',
              isSelected: false,
              isPrimary: false,
            },
          ],
        },
      },
      message: {
        visible: false,
      },
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
        summary:
          'BTC is in focus because momentum is strengthening in the current interpreted picture.',
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

  it('keeps the screen helper on the prepared account, message-policy, and explanation contracts only', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'dashboardScreenView.ts'),
      'utf8',
    );

    expect(source).toMatch(/accountContext\.status !== 'AVAILABLE'/);
    expect(source).toMatch(/messagePolicy\?\.status === 'AVAILABLE'/);
    expect(source).toMatch(/messagePolicy\.messages\[0\]/);
    expect(source).not.toMatch(
      /portfolioValue|selectedAccountId|resolveSelectedAccountContext|switchSelectedAccount|setPrimaryAccount|createAccountSwitchingAvailability/,
    );
    expect(source).not.toMatch(/kind === 'REFERRAL'/);
    expect(source).not.toMatch(/kind === 'ALERT'/);
    expect(source).not.toMatch(
      /createPreparedMessageInputs|subjectScope|changeStrength|confirmationSupport/,
    );
    expect(source).not.toMatch(
      /createExplanationSummary|signalsTriggered|eventId|providerId|metadata/,
    );
  });

  it('passes through the prepared Dashboard referral without classifying it locally', () => {
    const messagePolicy: MessagePolicyAvailability = {
      status: 'AVAILABLE',
      messages: [
        {
          kind: 'REFERRAL',
          title: 'Snapshot is the steadier fit',
          summary:
            'Dashboard has supporting context but not a strong top-focus item right now. Snapshot is the better place for a calm first read.',
          priority: 'LOW',
          surface: 'DASHBOARD',
          dismissible: false,
        },
      ],
    };

    expect(createDashboardScreenViewData(createSurface(), messagePolicy)).toMatchObject({
      message: {
        visible: true,
        kind: 'REFERRAL',
        priority: 'LOW',
        title: 'Snapshot is the steadier fit',
        summary:
          'Dashboard has supporting context but not a strong top-focus item right now. Snapshot is the better place for a calm first read.',
      },
    });
    expect(JSON.stringify(messagePolicy)).not.toMatch(/badge|unread|notification|urgent|popup/);
  });

  it('routes Dashboard refresh through the canonical message-policy seam', async () => {
    const surface = createSurface();
    const messagePolicy: MessagePolicyAvailability = {
      status: 'UNAVAILABLE',
      reason: 'NO_MESSAGE',
    };
    const fetchDashboardSurface = jest.fn().mockResolvedValue(surface);
    const fetchMessagePolicy = jest.fn().mockResolvedValue(messagePolicy);

    const result = await refreshDashboardScreenSurface({
      profile: 'ADVANCED',
      fetchDashboardSurface,
      fetchMessagePolicy,
    });

    expect(fetchDashboardSurface).toHaveBeenCalledWith({
      profile: 'ADVANCED',
      baselineScan: undefined,
    });
    expect(fetchMessagePolicy).toHaveBeenCalledWith({
      surface: 'DASHBOARD',
      profile: 'ADVANCED',
      dashboardSurface: surface,
    });
    expect(result).toEqual({
      surface,
      messagePolicy,
      nextBaselineScan: surface.scan,
    });
  });

  it('returns null when the prepared surface is unavailable', () => {
    expect(createDashboardScreenViewData(null)).toBeNull();
  });

  it('hides the account-context cue when the prepared account seam is unavailable', () => {
    expect(
      createDashboardScreenViewData({
        ...createSurface(),
        accountContext: {
          status: 'UNAVAILABLE',
          reason: 'NO_VALID_ACCOUNT_CONTEXT',
        },
      }),
    ).toMatchObject({
      accountContext: {
        visible: false,
      },
    });
  });

  it('keeps the account cue passive when switching is unavailable', () => {
    const surface = createSurface();

    expect(
      createDashboardScreenViewData({
        ...surface,
        accountContext: {
          ...surface.accountContext,
          switching: {
            status: 'UNAVAILABLE',
            reason: 'SINGLE_ACCOUNT_ONLY',
          },
        },
      }),
    ).toMatchObject({
      accountContext: {
        visible: true,
        switcher: {
          visible: false,
        },
      },
    });
  });

  it('hides the explanation card when the prepared explanation is unavailable', () => {
    expect(
      createDashboardScreenViewData({
        accountContext: {
          status: 'AVAILABLE',
          account: {
            accountId: 'acct-1',
            displayName: 'Primary account',
            selectionMode: 'EXPLICIT',
            baseCurrency: 'USD',
            strategyId: 'momentum_basics',
          },
        },
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
      message: {
        visible: false,
      },
      explanation: {
        visible: false,
      },
    });
  });
});
