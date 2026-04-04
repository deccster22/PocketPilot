import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('insights placement', () => {
  it('keeps one canonical Insights surface with a subordinate detail shelf in this phase', () => {
    const appSource = readFileSync(join(process.cwd(), 'app', 'App.tsx'), 'utf8');
    const insightsScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'InsightsScreen.tsx'),
      'utf8',
    );
    const insightsDetailScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'InsightsDetailScreen.tsx'),
      'utf8',
    );
    const insightsReflectionScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'InsightsReflectionScreen.tsx'),
      'utf8',
    );
    const dashboardScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'DashboardScreen.tsx'),
      'utf8',
    );
    const snapshotScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'SnapshotScreen.tsx'),
      'utf8',
    );
    const tradeHubScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'TradeHubScreen.tsx'),
      'utf8',
    );

    expect(appSource).toMatch(/InsightsScreen/);
    expect(appSource).toMatch(/Insights/);
    expect(appSource).toMatch(/activeTab/);
    expect(insightsScreenSource).toMatch(/fetchInsightsHistoryVM/);
    expect(insightsScreenSource).toMatch(/fetchInsightsArchiveVM/);
    expect(insightsScreenSource).toMatch(/fetchReflectionComparisonVM/);
    expect(insightsScreenSource).toMatch(/markInsightsHistoryViewed/);
    expect(insightsScreenSource).toMatch(/InsightsDetailScreen/);
    expect(insightsScreenSource).toMatch(/InsightsReflectionScreen/);
    expect(insightsScreenSource).toMatch(/EventHistoryCard/);
    expect(insightsScreenSource).not.toMatch(
      /createInsightsHistoryVM|createInsightsContinuity|createInsightsArchiveVM|createReflectionComparisonVM|createSinceLastChecked|setLastViewedTimestamp|INSIGHTS_LAST_VIEWED_SURFACE_ID|eventLedgerQueries|eventLedgerService|signalsTriggered|eventId|strategyId|providerId|metadata|score|unread|inbox|badge/,
    );
    expect(insightsDetailScreenSource).toMatch(/createInsightsDetailScreenViewData/);
    expect(insightsDetailScreenSource).toMatch(/InsightsDetailCard/);
    expect(insightsDetailScreenSource).not.toMatch(
      /fetchInsightsArchiveVM|createInsightsArchiveVM|eventLedger|eventId|strategyId|providerId|metadata|unread|inbox|badge/,
    );
    expect(insightsReflectionScreenSource).toMatch(/createInsightsReflectionScreenViewData/);
    expect(insightsReflectionScreenSource).toMatch(/ReflectionSummaryCard/);
    expect(insightsReflectionScreenSource).not.toMatch(
      /fetchReflectionComparisonVM|createReflectionComparisonVM|eventLedger|eventId|strategyId|providerId|metadata|score|unread|inbox|badge/,
    );
    expect(dashboardScreenSource).not.toMatch(/EventHistoryCard|fetchInsightsHistoryVM/);
    expect(snapshotScreenSource).not.toMatch(/EventHistoryCard|fetchInsightsHistoryVM/);
    expect(tradeHubScreenSource).not.toMatch(/EventHistoryCard|fetchInsightsHistoryVM/);
  });
});
