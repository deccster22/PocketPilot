import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('snapshot briefing placement', () => {
  it('anchors one canonical Snapshot message zone only on Snapshot in this phase', () => {
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

    expect(snapshotScreenSource).toMatch(/SnapshotBriefingCard/);
    expect(snapshotScreenSource).toMatch(/AppState/);
    expect(snapshotScreenSource).toMatch(/refreshSnapshotScreenSurface/);
    expect(snapshotScreenSource).toMatch(/defaultReorientationDismissStore/);
    expect(snapshotScreenSource).not.toMatch(/inbox|badge|toast|notification center|modal/i);
    expect(snapshotScreenSource).not.toMatch(/ReorientationSummaryCard/);
    expect(snapshotScreenSource).not.toMatch(/reorientationSummaryView/);
    expect(snapshotScreenSource).not.toMatch(/useFocusEffect|useIsFocused/);
    expect(snapshotScreenSource).not.toMatch(/reorientation\.status === 'VISIBLE'/);
    expect(snapshotScreenSource).not.toMatch(/sinceLastChecked/);
    expect(dashboardScreenSource).not.toMatch(/SnapshotBriefingCard/);
    expect(dashboardScreenSource).not.toMatch(/fetchSnapshotSurfaceVM/);
    expect(tradeHubScreenSource).not.toMatch(/SnapshotBriefingCard/);
  });
});
