import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('dashboard explanation placement', () => {
  it('anchors one canonical why note on Dashboard only in PX-E1', () => {
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

    expect(dashboardScreenSource).toMatch(/ExplanationCard/);
    expect(dashboardScreenSource).toMatch(/screenView\?\.explanation\.visible/);
    expect(snapshotScreenSource).not.toMatch(/ExplanationCard/);
    expect(tradeHubScreenSource).not.toMatch(/ExplanationCard/);
  });
});
