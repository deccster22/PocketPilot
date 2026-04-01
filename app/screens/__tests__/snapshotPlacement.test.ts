import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('reorientation placement', () => {
  it('anchors the welcome-back briefing only on Snapshot in this phase', () => {
    const snapshotScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'SnapshotScreen.tsx'),
      'utf8',
    );
    const dashboardScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'DashboardScreen.tsx'),
      'utf8',
    );
    const tradeHubScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'TradeHubScreen.tsx'),
      'utf8',
    );

    expect(snapshotScreenSource).toMatch(/ReorientationSummaryCard/);
    expect(snapshotScreenSource).toMatch(/fetchSnapshotSurfaceVM/);
    expect(snapshotScreenSource).toMatch(/defaultReorientationDismissStore/);
    expect(snapshotScreenSource).not.toMatch(/reason === 'AVAILABLE'/);
    expect(snapshotScreenSource).not.toMatch(/status === 'VISIBLE'/);
    expect(dashboardScreenSource).not.toMatch(/ReorientationSummaryCard/);
    expect(dashboardScreenSource).not.toMatch(/fetchSnapshotSurfaceVM/);
    expect(tradeHubScreenSource).not.toMatch(/ReorientationSummaryCard/);
  });
});
