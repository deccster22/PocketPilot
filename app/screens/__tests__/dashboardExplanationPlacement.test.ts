import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('dashboard explanation placement', () => {
  it('keeps one canonical why note on Dashboard only in PX-E2', () => {
    const dashboardScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'DashboardScreen.tsx'),
      'utf8',
    );
    const dashboardScreenViewSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'dashboardScreenView.ts'),
      'utf8',
    );
    const explanationCardSource = readFileSync(
      join(process.cwd(), 'app', 'components', 'ExplanationCard.tsx'),
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

    expect(dashboardScreenSource).toMatch(/ExplanationCard/);
    expect(dashboardScreenSource).toMatch(/screenView\?\.explanation\.visible/);
    expect(dashboardScreenViewSource).toMatch(/surface\.explanation\.explanation/);
    expect(dashboardScreenViewSource).not.toMatch(/createExplanationSummary|signalsTriggered|eventId|providerId|metadata/);
    expect(explanationCardSource).toMatch(/params\.explanation\.detail/);
    expect(explanationCardSource).not.toMatch(/createExplanationSummary|fetchDashboardExplanationVM|signalsTriggered|eventId|providerId|metadata/);
    expect(snapshotScreenSource).not.toMatch(/ExplanationCard/);
    expect(tradeHubScreenSource).not.toMatch(/ExplanationCard/);
  });
});
