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
    const insightsSummaryScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'InsightsSummaryScreen.tsx'),
      'utf8',
    );
    const insightsArchiveScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'InsightsArchiveScreen.tsx'),
      'utf8',
    );
    const insightsYearInReviewScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'InsightsYearInReviewScreen.tsx'),
      'utf8',
    );
    const insightsExportScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'InsightsExportScreen.tsx'),
      'utf8',
    );
    const insightsJournalScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'InsightsJournalScreen.tsx'),
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
    expect(insightsScreenSource).toMatch(/fetchPeriodSummaryVM/);
    expect(insightsScreenSource).toMatch(/fetchReflectionComparisonVM/);
    expect(insightsScreenSource).toMatch(/fetchSummaryArchiveVM/);
    expect(insightsScreenSource).toMatch(/fetchYearInReviewVM/);
    expect(insightsScreenSource).toMatch(/fetchExportOptionsVM/);
    expect(insightsScreenSource).toMatch(/fetchPreparedExportRequest/);
    expect(insightsScreenSource).toMatch(/fetchJournalEntryVM/);
    expect(insightsScreenSource).toMatch(/saveJournalEntry/);
    expect(insightsScreenSource).toMatch(/updateJournalEntry/);
    expect(insightsScreenSource).toMatch(/markInsightsHistoryViewed/);
    expect(insightsScreenSource).toMatch(/InsightsArchiveScreen/);
    expect(insightsScreenSource).toMatch(/InsightsDetailScreen/);
    expect(insightsScreenSource).toMatch(/InsightsExportScreen/);
    expect(insightsScreenSource).toMatch(/InsightsJournalScreen/);
    expect(insightsScreenSource).toMatch(/InsightsReflectionScreen/);
    expect(insightsScreenSource).toMatch(/InsightsSummaryScreen/);
    expect(insightsScreenSource).toMatch(/InsightsYearInReviewScreen/);
    expect(insightsScreenSource).toMatch(/EventHistoryCard/);
    expect(insightsScreenSource).not.toMatch(
      /createInsightsHistoryVM|createInsightsContinuity|createInsightsArchiveVM|createPeriodSummaryVM|createReflectionComparisonVM|createSummaryArchiveVM|createYearInReviewVM|createExportOptionsVM|createPreparedExportRequest|createSinceLastChecked|resolveJournalContext|createJournalEntryStoreKey|createReflectionPeriodWindow|createAnnualReviewWindow|setLastViewedTimestamp|INSIGHTS_LAST_VIEWED_SURFACE_ID|eventLedgerQueries|eventLedgerService|signalsTriggered|eventId|strategyId|providerId|metadata|score|unread|inbox|badge/,
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
    expect(insightsSummaryScreenSource).toMatch(/createInsightsSummaryScreenViewData/);
    expect(insightsSummaryScreenSource).toMatch(/selectedPeriod/);
    expect(insightsSummaryScreenSource).toMatch(/onOpenJournal/);
    expect(insightsSummaryScreenSource).not.toMatch(
      /fetchPeriodSummaryVM|createPeriodSummaryVM|fetchJournalEntryVM|saveJournalEntry|updateJournalEntry|resolveJournalContext|createReflectionPeriodWindow|createAnnualReviewWindow|eventLedger|eventId|strategyId|providerId|metadata|score|unread|inbox|badge/,
    );
    expect(insightsArchiveScreenSource).toMatch(/createInsightsArchiveScreenViewData/);
    expect(insightsArchiveScreenSource).toMatch(/onOpenSummary/);
    expect(insightsArchiveScreenSource).not.toMatch(
      /fetchSummaryArchiveVM|createSummaryArchiveVM|fetchPeriodSummaryVM|createPeriodSummaryVM|eventLedger|eventId|strategyId|providerId|metadata|score|unread|inbox|badge/,
    );
    expect(insightsYearInReviewScreenSource).toMatch(/createInsightsYearInReviewScreenViewData/);
    expect(insightsYearInReviewScreenSource).toMatch(/yearInReviewVM/);
    expect(insightsYearInReviewScreenSource).toMatch(/onOpenJournal/);
    expect(insightsYearInReviewScreenSource).not.toMatch(
      /fetchYearInReviewVM|createYearInReviewVM|createPeriodSummaryVM|fetchPeriodSummaryVM|fetchJournalEntryVM|saveJournalEntry|updateJournalEntry|resolveJournalContext|createReflectionPeriodWindow|createAnnualReviewWindow|eventLedger|eventId|strategyId|providerId|metadata|score|unread|inbox|badge/,
    );
    expect(insightsExportScreenSource).toMatch(/createInsightsExportScreenViewData/);
    expect(insightsExportScreenSource).toMatch(/ProfileSelector/);
    expect(insightsExportScreenSource).not.toMatch(
      /fetchPreparedExportRequest|createPreparedExportRequest|fetchExportOptionsVM|createExportOptionsVM|eventLedger|eventId|strategyId|providerId|metadata|score|unread|inbox|badge/,
    );
    expect(insightsJournalScreenSource).toMatch(/createInsightsJournalScreenViewData/);
    expect(insightsJournalScreenSource).toMatch(/Journal note body/);
    expect(insightsJournalScreenSource).not.toMatch(
      /fetchJournalEntryVM|saveJournalEntry|updateJournalEntry|resolveJournalContext|createReflectionPeriodWindow|createAnnualReviewWindow|eventLedger|eventId|strategyId|providerId|metadata|score|unread|inbox|badge/,
    );
    expect(dashboardScreenSource).not.toMatch(/EventHistoryCard|fetchInsightsHistoryVM/);
    expect(snapshotScreenSource).not.toMatch(/EventHistoryCard|fetchInsightsHistoryVM/);
    expect(tradeHubScreenSource).not.toMatch(/EventHistoryCard|fetchInsightsHistoryVM/);
  });
});
