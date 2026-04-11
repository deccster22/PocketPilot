import type { DashboardSurfaceVM } from '@/services/dashboard/dashboardSurfaceService';
import { fetchContextualKnowledgeAvailability } from '@/services/knowledge/fetchContextualKnowledgeAvailability';
import type {
  InsightsArchiveVM,
  InsightsHistoryWithContinuityVM,
  ReflectionComparisonVM,
} from '@/services/insights/types';
import type { MessagePolicyAvailability } from '@/services/messages/types';
import { fetchStrategyNavigatorVM } from '@/services/strategyNavigator/fetchStrategyNavigatorVM';

describe('fetchContextualKnowledgeAvailability', () => {
  it('builds contextual Strategy Preview candidates from the prepared preview VM', () => {
    const strategyNavigatorVM = fetchStrategyNavigatorVM({
      surface: 'STRATEGY_NAVIGATOR',
      selectedStrategyId: 'dip_buying',
      selectedScenarioId: 'DIP_VOLATILITY',
      nowProvider: () => Date.parse('2026-04-09T00:00:00.000Z'),
    });

    expect(
      fetchContextualKnowledgeAvailability({
        surface: 'STRATEGY_PREVIEW',
        strategyNavigatorVM,
      }),
    ).toEqual({
      status: 'AVAILABLE',
      surface: 'STRATEGY_PREVIEW',
      items: [
        {
          topicId: 'strategy-buy-the-dip',
          title: 'Buy the Dip',
          reason:
            'This selected lens is focused on pullbacks, stabilisation, and whether weakness still fits the broader picture.',
        },
        {
          topicId: 'pp-estimated-vs-confirmed-context',
          title: 'Estimated vs Confirmed Context',
          reason:
            'This scenario is intentionally unsettled, so certainty boundaries matter before the move itself.',
        },
        {
          topicId: 'pp-what-strategy-preview-strategy-navigator-is-for',
          title: 'What Strategy Preview / Strategy Navigator Is For',
          reason:
            'This surface is an exploratory bridge between learning and commitment, so the preview explainer is the cleanest baseline context.',
        },
      ],
    });
  });

  it('returns insufficient interpreted context honestly when the preview VM has not selected a strategy yet', () => {
    const strategyNavigatorVM = fetchStrategyNavigatorVM({
      surface: 'STRATEGY_NAVIGATOR',
      selectedStrategyId: null,
      selectedScenarioId: 'DIP_VOLATILITY',
      nowProvider: () => Date.parse('2026-04-09T00:00:00.000Z'),
    });

    expect(
      fetchContextualKnowledgeAvailability({
        surface: 'STRATEGY_PREVIEW',
        strategyNavigatorVM,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'INSUFFICIENT_INTERPRETED_CONTEXT',
    });
  });

  it('builds dashboard candidates from prepared dashboard and message-policy seams without app-side selection logic', () => {
    const dashboardSurface = {
      model: {
        primeZone: {
          items: [
            {
              accountId: 'primary',
              symbol: 'BTC',
              strategyId: 'dip_buying',
              eventType: 'ESTIMATED_PRICE',
              timestamp: 1,
              certainty: 'estimated',
            },
          ],
        },
        secondaryZone: {
          items: [],
        },
        deepZone: {
          items: [],
        },
        meta: {
          profile: 'BEGINNER',
          hasPrimeItems: true,
          hasSecondaryItems: false,
          hasDeepItems: false,
        },
      },
    } as unknown as DashboardSurfaceVM;
    const messagePolicy: MessagePolicyAvailability = {
      status: 'AVAILABLE',
      messages: [
        {
          kind: 'REFERRAL',
          title: 'Helpful context',
          summary: 'One quiet knowledge link is available.',
          priority: 'LOW',
          surface: 'DASHBOARD',
          dismissible: true,
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
      fetchContextualKnowledgeAvailability({
        surface: 'DASHBOARD',
        dashboardSurface,
        messagePolicy,
      }),
    ).toEqual({
      status: 'AVAILABLE',
      surface: 'DASHBOARD',
      items: [
        {
          topicId: 'strategy-buy-the-dip',
          title: 'Buy the Dip',
          reason:
            'This selected lens is focused on pullbacks, stabilisation, and whether weakness still fits the broader picture.',
        },
        {
          topicId: 'pp-estimated-vs-confirmed-context',
          title: 'Estimated vs Confirmed Context',
          reason:
            'The current interpreted event is explicitly provisional, so the estimated-versus-confirmed boundary matters most.',
        },
        {
          topicId: 'pp-what-knowledge-links-are-for',
          title: 'What Knowledge Links Are For',
          reason:
            'This message posture is pointing toward optional explanation, so the knowledge-link contract itself is the clearest explainer.',
        },
      ],
    });
  });

  it('builds insights candidates from prepared reflection seams while keeping the result optional', () => {
    const insightsHistory = {
      generatedAt: '2026-04-09T00:00:00.000Z',
      availability: {
        status: 'AVAILABLE',
        sections: [],
      },
      continuity: {
        state: 'NEW_HISTORY_AVAILABLE',
        viewedAt: '2026-04-08T00:00:00.000Z',
        newestEventAt: '2026-04-09T00:00:00.000Z',
        newItemCount: 2,
        summary: 'Two new items are available.',
      },
    } as InsightsHistoryWithContinuityVM;
    const insightsArchive = {
      generatedAt: '2026-04-09T00:00:00.000Z',
      availability: {
        status: 'AVAILABLE',
        sections: [],
      },
      selectedSectionId: null,
    } as InsightsArchiveVM;
    const reflectionComparison = {
      generatedAt: '2026-04-09T00:00:00.000Z',
      availability: {
        status: 'AVAILABLE',
        leftWindow: {
          id: 'earlier',
          title: 'Earlier',
          startAt: '2026-03-01T00:00:00.000Z',
          endAt: '2026-03-31T23:59:59.000Z',
        },
        rightWindow: {
          id: 'recent',
          title: 'Recent',
          startAt: '2026-04-01T00:00:00.000Z',
          endAt: '2026-04-09T00:00:00.000Z',
        },
        items: [],
        limitations: [],
      },
    } as ReflectionComparisonVM;
    const result = fetchContextualKnowledgeAvailability({
      surface: 'INSIGHTS',
      insightsHistory,
      insightsArchive,
      reflectionComparison,
    });

    expect(result).toMatchObject({
      status: 'AVAILABLE',
      surface: 'INSIGHTS',
    });

    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected contextual Insights knowledge to be available.');
    }

    expect(result.items.map((item) => item.topicId)).toEqual(
      expect.arrayContaining([
        'pp-what-since-last-checked-is-for',
        'pp-what-summary-archive-is-for',
      ]),
    );
  });

  it('keeps unsupported surfaces explicit instead of widening contextual rollout everywhere', () => {
    expect(
      fetchContextualKnowledgeAvailability({
        surface: 'TRADE_HUB',
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    });
  });

  it('stays deterministic for identical inputs', () => {
    const strategyNavigatorVM = fetchStrategyNavigatorVM({
      surface: 'STRATEGY_NAVIGATOR',
      selectedStrategyId: 'trend_following',
      selectedScenarioId: 'TREND_CONTINUATION',
      nowProvider: () => Date.parse('2026-04-09T00:00:00.000Z'),
    });
    const params = {
      surface: 'STRATEGY_PREVIEW' as const,
      strategyNavigatorVM,
    };

    expect(fetchContextualKnowledgeAvailability(params)).toEqual(
      fetchContextualKnowledgeAvailability(params),
    );
  });
});
