import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('snapshot briefing placement', () => {
  it('anchors one canonical Snapshot message zone, one calm Since Last Checked section, and one 30,000 ft path only on Snapshot in this phase', () => {
    const snapshotScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'SnapshotScreen.tsx'),
      'utf8',
    );
    const snapshotBriefingCardSource = readFileSync(
      join(process.cwd(), 'app', 'components', 'SnapshotBriefingCard.tsx'),
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
    expect(snapshotScreenSource).toMatch(/SinceLastCheckedCard/);
    expect(snapshotScreenSource).toMatch(/ThirtyThousandFootScreen/);
    expect(snapshotScreenSource).toMatch(/AppState/);
    expect(snapshotScreenSource).toMatch(/refreshSnapshotScreenSurface/);
    expect(snapshotScreenSource).toMatch(/setRoute\('THIRTY_THOUSAND_FOOT'\)/);
    expect(snapshotScreenSource).toMatch(/defaultReorientationDismissStore/);
    expect(snapshotScreenSource).not.toMatch(/inbox|badge|toast|notification center|modal/i);
    expect(snapshotScreenSource).not.toMatch(/Alert\.alert|popup|warning/i);
    expect(snapshotScreenSource).not.toMatch(/ReorientationSummaryCard/);
    expect(snapshotScreenSource).not.toMatch(/reorientationSummaryView/);
    expect(snapshotScreenSource).not.toMatch(/useFocusEffect|useIsFocused/);
    expect(snapshotScreenSource).not.toMatch(/reorientation\.status === 'VISIBLE'/);
    expect(snapshotScreenSource).not.toMatch(/eventsSinceLastViewed|createOrientationBriefingItems/);
    expect(snapshotBriefingCardSource).toMatch(/MessageRationaleNote/);
    expect(snapshotBriefingCardSource).not.toMatch(/modal|toast|inbox|badge|notification center/i);
    expect(dashboardScreenSource).toMatch(/MessageRationaleNote/);
    expect(dashboardScreenSource).not.toMatch(/SnapshotBriefingCard/);
    expect(dashboardScreenSource).not.toMatch(/SinceLastCheckedCard/);
    expect(dashboardScreenSource).not.toMatch(/ThirtyThousandFootScreen/);
    expect(dashboardScreenSource).not.toMatch(/fetchSnapshotSurfaceVM/);
    expect(dashboardScreenSource).not.toMatch(/modal|toast|inbox|badge|notification center/i);
    expect(tradeHubScreenSource).toMatch(/MessageRationaleNote/);
    expect(tradeHubScreenSource).not.toMatch(/SnapshotBriefingCard/);
    expect(tradeHubScreenSource).not.toMatch(/SinceLastCheckedCard/);
    expect(tradeHubScreenSource).not.toMatch(/ThirtyThousandFootScreen/);
    expect(tradeHubScreenSource).not.toMatch(/modal|toast|inbox|badge|notification center/i);
  });
});
