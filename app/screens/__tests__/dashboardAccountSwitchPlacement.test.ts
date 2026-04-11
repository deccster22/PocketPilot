import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('dashboard account switching placement', () => {
  it('keeps explicit account control and one subordinate aggregate holdings proof path on Dashboard only', () => {
    const dashboardScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'DashboardScreen.tsx'),
      'utf8',
    );
    const accountSwitcherSource = readFileSync(
      join(process.cwd(), 'app', 'components', 'DashboardAccountSwitcher.tsx'),
      'utf8',
    );
    const aggregateCardSource = readFileSync(
      join(process.cwd(), 'app', 'components', 'DashboardAggregatePortfolioCard.tsx'),
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
    expect(dashboardScreenSource).toMatch(/DashboardAggregatePortfolioCard/);
    expect(dashboardScreenSource).toMatch(/switchSelectedAccount/);
    expect(dashboardScreenSource).toMatch(/setPrimaryAccount/);
    expect(dashboardScreenSource).not.toMatch(
      /resolveSelectedAccountContext|createAccountSwitchingAvailability|createAggregatePortfolioContext|fetchAggregatePortfolioContext|all accounts/i,
    );
    expect(accountSwitcherSource).toMatch(/Use this account/);
    expect(accountSwitcherSource).toMatch(/Make primary/);
    expect(aggregateCardSource).toMatch(/aggregatePortfolio\.title/);
    expect(aggregateCardSource).toMatch(/aggregatePortfolio\.assets\.map/);
    expect(snapshotScreenSource).not.toMatch(
      /DashboardAccountSwitcher|DashboardAggregatePortfolioCard|switchSelectedAccount|setPrimaryAccount/,
    );
    expect(tradeHubScreenSource).not.toMatch(
      /DashboardAccountSwitcher|DashboardAggregatePortfolioCard|switchSelectedAccount|setPrimaryAccount/,
    );
  });
});
