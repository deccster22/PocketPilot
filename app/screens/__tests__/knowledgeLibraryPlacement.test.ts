import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('knowledge library placement', () => {
  it('keeps the first library surface as one top-level destination without spraying contextual links elsewhere', () => {
    const appSource = readFileSync(join(process.cwd(), 'app', 'App.tsx'), 'utf8');
    const knowledgeLibraryScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'KnowledgeLibraryScreen.tsx'),
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

    expect(appSource).toMatch(/KnowledgeLibraryScreen/);
    expect(appSource).toMatch(/Knowledge/);
    expect(appSource).toMatch(/activeTab/);
    expect(knowledgeLibraryScreenSource).toMatch(/fetchKnowledgeLibraryVM/);
    expect(knowledgeLibraryScreenSource).toMatch(/KnowledgeCard/);
    expect(knowledgeLibraryScreenSource).not.toMatch(/knowledgeCatalog|KnowledgeNode/);
    expect(dashboardScreenSource).not.toMatch(/KnowledgeCard|fetchKnowledgeLibraryVM/);
    expect(snapshotScreenSource).not.toMatch(/KnowledgeCard|fetchKnowledgeLibraryVM/);
    expect(tradeHubScreenSource).not.toMatch(/KnowledgeCard|fetchKnowledgeLibraryVM/);
  });
});
