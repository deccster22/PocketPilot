import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('dashboard account switching placement', () => {
  it('keeps one explicit account-switch and primary path on Dashboard only in PX-MA2', () => {
    const dashboardScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'DashboardScreen.tsx'),
      'utf8',
    );
    const accountSwitcherSource = readFileSync(
      join(process.cwd(), 'app', 'components', 'DashboardAccountSwitcher.tsx'),
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

    expect(dashboardScreenSource).toMatch(/DashboardAccountSwitcher/);
    expect(dashboardScreenSource).toMatch(/switchSelectedAccount/);
    expect(dashboardScreenSource).toMatch(/setPrimaryAccount/);
    expect(dashboardScreenSource).not.toMatch(
      /resolveSelectedAccountContext|createAccountSwitchingAvailability|aggregate|all accounts/i,
    );
    expect(accountSwitcherSource).toMatch(/Use this account/);
    expect(accountSwitcherSource).toMatch(/Make primary/);
    expect(snapshotScreenSource).not.toMatch(
      /DashboardAccountSwitcher|switchSelectedAccount|setPrimaryAccount/,
    );
    expect(tradeHubScreenSource).not.toMatch(
      /DashboardAccountSwitcher|switchSelectedAccount|setPrimaryAccount/,
    );
  });
});
