import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type {
  MessagePolicyAvailability,
  MessagePolicyLane,
} from '@/services/messages/types';
import type { DashboardSurfaceVM } from '@/services/dashboard/dashboardSurfaceService';
import type { ContextualKnowledgeLane } from '@/services/knowledge/types';
import {
  createDashboardScreenViewData,
  refreshDashboardScreenSurface,
} from '@/app/screens/dashboardScreenView';

function createUnavailableContextualKnowledgeLane(): ContextualKnowledgeLane {
  return {
    availability: {
      status: 'UNAVAILABLE',
      reason: 'NO_RELEVANT_TOPIC',
    },
    linkage: {
      selectedTopicIds: [],
      selectionReason: 'SURFACE_CONTEXT',
    },
    presentation: {
      maxVisibleTopics: 0,
      emphasis: 'SUBORDINATE',
      shouldRenderShelf: false,
    },
    topics: [],
  };
}

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
    aggregatePortfolioContext: {
      status: 'AVAILABLE',
      portfolio: {
        totalValue: 16_500,
        currency: 'USD',
        accountCount: 3,
        assets: [
          {
            symbol: 'BTC',
            amount: 0.17,
            value: 10_200,
            weightPct: 61.81818181818181,
          },
          {
            symbol: 'ETH',
            amount: 2.25,
            value: 4_200,
            weightPct: 25.454545454545453,
          },
          {
            symbol: 'SOL',
            amount: 80,
            value: 2_100,
            weightPct: 12.727272727272727,
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
      contextualKnowledgeLane: createUnavailableContextualKnowledgeLane(),
      inlineGlossaryHelp: {
        status: 'UNAVAILABLE',
        reason: 'NOT_ENABLED_FOR_PROFILE',
      },
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

function unavailableMessagePolicy(): MessagePolicyAvailability {
  return {
    status: 'UNAVAILABLE',
    reason: 'NO_MESSAGE',
    rationale: {
      status: 'UNAVAILABLE',
      reason: 'NO_RATIONALE_AVAILABLE',
    },
  };
}

function createMessagePolicyLane(policyAvailability: MessagePolicyAvailability): MessagePolicyLane {
  return {
    policyAvailability,
    rationaleAvailability: policyAvailability.rationale,
  };
}

describe('createDashboardScreenViewData', () => {
  it('reads the prepared Dashboard surface contract and prepared why note without re-ranking it', () => {
    const view = createDashboardScreenViewData(
      createSurface(),
      createMessagePolicyLane(unavailableMessagePolicy()),
    );

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
      aggregatePortfolio: {
        visible: true,
        title: 'Aggregate holdings',
        summary:
          'Across 3 accounts | Portfolio exposure only; strategy truth stays on the current account.',
        totalValueText: 'USD 16500.00 total',
        assets: [
          {
            symbol: 'BTC',
            summary: '0.17 units | USD 10200.00 | 61.8% weight',
          },
          {
            symbol: 'ETH',
            summary: '2.25 units | USD 4200.00 | 25.5% weight',
          },
          {
            symbol: 'SOL',
            summary: '80 units | USD 2100.00 | 12.7% weight',
          },
        ],
      },
        message: {
          visible: false,
        },
        contextualKnowledge: {
          visible: false,
          title: 'Optional knowledge',
          summary: 'The shelf stays hidden until the prepared context is stronger.',
          originSurface: 'NONE',
          selectionReason: null,
          presentation: {
            maxVisibleTopics: 0,
            emphasis: 'SUBORDINATE',
            shouldRenderShelf: false,
          },
          items: [],
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
        inlineGlossary: {
          status: 'UNAVAILABLE',
          reason: 'NOT_ENABLED_FOR_PROFILE',
        },
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

  it('maps the prepared contextual knowledge lane without deriving local topic selection', () => {
    const view = createDashboardScreenViewData({
      ...createSurface(),
      contextualKnowledgeLane: {
        availability: {
          status: 'AVAILABLE',
          surface: 'DASHBOARD',
          items: [
            {
              topicId: 'pp-what-dashboard-is-for',
              title: 'What Dashboard Is For',
              reason: 'Dashboard is the strongest contextual home for deeper explanation.',
            },
          ],
        },
        linkage: {
          selectedTopicIds: ['pp-what-dashboard-is-for'],
          selectionReason: 'SURFACE_CONTEXT',
        },
        presentation: {
          maxVisibleTopics: 1,
          emphasis: 'SUBORDINATE',
          shouldRenderShelf: true,
        },
        topics: [
          {
            topicId: 'pp-what-dashboard-is-for',
            title: 'What Dashboard Is For',
            summary: 'Dashboard is PocketPilot\'s focus workspace.',
            difficulty: 'BEGINNER',
            mediaType: 'ARTICLE',
            reason: 'Dashboard is the strongest contextual home for deeper explanation.',
          },
        ],
      },
    });

    expect(view?.contextualKnowledge).toEqual({
      visible: true,
      title: 'Quiet context',
      summary: 'Only one quiet link stays visible, and only when the surface is still relevant enough.',
      originSurface: 'DASHBOARD',
      selectionReason: 'SURFACE_CONTEXT',
      presentation: {
        maxVisibleTopics: 1,
        emphasis: 'SUBORDINATE',
        shouldRenderShelf: true,
      },
      items: [
        {
          topicId: 'pp-what-dashboard-is-for',
          title: 'What Dashboard Is For',
          reason: 'Dashboard is the strongest contextual home for deeper explanation.',
        },
      ],
    });
  });

  it('hides the prepared contextual knowledge shelf when the service says the lane is too sparse', () => {
    const view = createDashboardScreenViewData({
      ...createSurface(),
      contextualKnowledgeLane: {
        availability: {
          status: 'AVAILABLE',
          surface: 'DASHBOARD',
          items: [
            {
              topicId: 'pp-what-dashboard-is-for',
              title: 'What Dashboard Is For',
              reason:
                'Dashboard stays on one quiet contextual link only when the shelf is still relevant.',
            },
          ],
        },
        linkage: {
          selectedTopicIds: ['pp-what-dashboard-is-for'],
          selectionReason: 'SURFACE_CONTEXT',
        },
        presentation: {
          maxVisibleTopics: 1,
          emphasis: 'SUBORDINATE',
          shouldRenderShelf: false,
        },
        topics: [
          {
            topicId: 'pp-what-dashboard-is-for',
            title: 'What Dashboard Is For',
            summary: 'Dashboard is PocketPilot\'s focus workspace.',
            difficulty: 'BEGINNER',
            mediaType: 'ARTICLE',
            reason:
              'Dashboard stays on one quiet contextual link only when the shelf is still relevant.',
          },
        ],
      },
    });

    expect(view?.contextualKnowledge).toEqual({
      visible: false,
      title: 'Optional knowledge',
      summary: 'The shelf stays hidden until the prepared context is stronger.',
      originSurface: 'NONE',
      selectionReason: null,
      presentation: {
        maxVisibleTopics: 0,
        emphasis: 'SUBORDINATE',
        shouldRenderShelf: false,
      },
      items: [],
    });
  });

  it('keeps the screen helper on the prepared account, message-policy, and explanation contracts only', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'dashboardScreenView.ts'),
      'utf8',
    );

    expect(source).toMatch(/accountContext\.status !== 'AVAILABLE'/);
    expect(source).toMatch(/messagePolicyLane\?\.policyAvailability/);
    expect(source).toMatch(/policyAvailability\?\.status === 'AVAILABLE'/);
    expect(source).toMatch(/policyAvailability\.messages\[0\]/);
    expect(source).toMatch(/messagePolicyLane\?\.rationaleAvailability \?\? policyAvailability\.rationale/);
    expect(source).toMatch(/createContextualKnowledgeSectionViewData/);
    expect(source).not.toMatch(
      /selectedAccountId|resolveSelectedAccountContext|switchSelectedAccount|setPrimaryAccount|createAccountSwitchingAvailability|createAggregatePortfolioContext|fetchAggregatePortfolioContext|createContextualKnowledgeLane|fetchContextualKnowledgeAvailability|createContextualKnowledgeSelectionContext|selectContextualKnowledgeTopics|createInlineGlossaryHelp|selectInlineGlossaryTerms|createGlossaryTermIndex|createInlineGlossaryAcknowledgementKey|knowledgeCatalog|selectedTopicIds|selectionReason|linkage|KnowledgeTopicScreen|ContextualKnowledgeCard|fetchKnowledgeTopicDetailVM/,
    );
    expect(source).not.toMatch(/kind === 'REFERRAL'/);
    expect(source).not.toMatch(/kind === 'ALERT'/);
    expect(source).not.toMatch(
      /createPreparedMessageInputs|createPreparedMessageRationale|subjectScope|changeStrength|confirmationSupport/,
    );
    expect(source).not.toMatch(
      /createExplanationSummary|signalsTriggered|eventId|providerId|metadata/,
    );
    expect(source).not.toMatch(/strategyFit|aggregate alignment|aggregate fit/i);
  });

  it('passes through the prepared Dashboard referral and rationale without classifying it locally', () => {
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
      rationale: {
        status: 'AVAILABLE',
        rationale: {
          title: 'Why this is here',
          summary:
            'Shown as a referral because Dashboard has useful context, but Snapshot is the steadier first read right now.',
          items: [
            'Snapshot is the surface PocketPilot uses for a calmer first look when top focus is still forming.',
            'Routing notes stay compact instead of turning into alerts.',
          ],
        },
      },
    };

    expect(
      createDashboardScreenViewData(createSurface(), createMessagePolicyLane(messagePolicy)),
    ).toMatchObject({
      message: {
        visible: true,
        kind: 'REFERRAL',
        priority: 'LOW',
        title: 'Snapshot is the steadier fit',
        summary:
          'Dashboard has supporting context but not a strong top-focus item right now. Snapshot is the better place for a calm first read.',
        rationale: messagePolicy.rationale,
      },
    });
    expect(JSON.stringify(messagePolicy)).not.toMatch(/badge|unread|notification|urgent|popup/);
  });

  it('routes Dashboard refresh through the canonical message-policy seam', async () => {
    const surface = createSurface();
    const messagePolicy = createMessagePolicyLane(unavailableMessagePolicy());
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
      messagePolicyLane: messagePolicy,
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

  it('keeps aggregate holdings subordinate and portfolio-only', () => {
    const view = createDashboardScreenViewData(createSurface());

    expect(view?.aggregatePortfolio).toEqual({
      visible: true,
      title: 'Aggregate holdings',
      summary:
        'Across 3 accounts | Portfolio exposure only; strategy truth stays on the current account.',
      totalValueText: 'USD 16500.00 total',
      assets: [
        {
          symbol: 'BTC',
          summary: '0.17 units | USD 10200.00 | 61.8% weight',
        },
        {
          symbol: 'ETH',
          summary: '2.25 units | USD 4200.00 | 25.5% weight',
        },
        {
          symbol: 'SOL',
          summary: '80 units | USD 2100.00 | 12.7% weight',
        },
      ],
    });
    expect(JSON.stringify(view?.aggregatePortfolio)).not.toMatch(
      /watchful|aligned|needs review|fit|execution|risk/i,
    );
  });

  it('hides aggregate holdings when the prepared aggregate seam is unavailable', () => {
    expect(
      createDashboardScreenViewData({
        ...createSurface(),
        aggregatePortfolioContext: {
          status: 'UNAVAILABLE',
          reason: 'NO_AGGREGATABLE_PORTFOLIO_DATA',
        },
      }),
    ).toMatchObject({
      aggregatePortfolio: {
        visible: false,
      },
    });
  });

  it('hides the explanation card when the prepared explanation is unavailable', () => {
    expect(
      createDashboardScreenViewData(
        {
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
          aggregatePortfolioContext: {
            status: 'UNAVAILABLE',
            reason: 'NO_AGGREGATABLE_PORTFOLIO_DATA',
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
          contextualKnowledgeLane: createUnavailableContextualKnowledgeLane(),
          inlineGlossaryHelp: {
            status: 'UNAVAILABLE',
            reason: 'NO_ELIGIBLE_TERMS',
          },
          explanation: {
            status: 'UNAVAILABLE',
            reason: 'NO_EXPLANATION_TARGET',
          },
        },
        createMessagePolicyLane(unavailableMessagePolicy()),
      ),
    ).toMatchObject({
      aggregatePortfolio: {
        visible: false,
      },
      message: {
        visible: false,
      },
      explanation: {
        visible: false,
      },
    });
  });
});
