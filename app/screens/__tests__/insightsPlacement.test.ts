import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('insights placement', () => {
  it('keeps one canonical Insights history surface as a top-level destination only in this phase', () => {
    const appSource = readFileSync(join(process.cwd(), 'app', 'App.tsx'), 'utf8');
    const insightsScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'InsightsScreen.tsx'),
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
    expect(insightsScreenSource).toMatch(/EventHistoryCard/);
    expect(insightsScreenSource).not.toMatch(
      /createInsightsHistoryVM|createSinceLastChecked|eventLedgerQueries|eventLedgerService|signalsTriggered|eventId|strategyId|providerId|metadata/,
    );
    expect(dashboardScreenSource).not.toMatch(/EventHistoryCard|fetchInsightsHistoryVM/);
    expect(snapshotScreenSource).not.toMatch(/EventHistoryCard|fetchInsightsHistoryVM/);
    expect(tradeHubScreenSource).not.toMatch(/EventHistoryCard|fetchInsightsHistoryVM/);
  });
});
