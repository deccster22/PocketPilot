import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('knowledge library placement', () => {
  it('keeps one canonical Knowledge surface with a subordinate topic detail shelf in this phase', () => {
    const appSource = readFileSync(join(process.cwd(), 'app', 'App.tsx'), 'utf8');
    const knowledgeLibraryScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'KnowledgeLibraryScreen.tsx'),
      'utf8',
    );
    const knowledgeTopicScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'KnowledgeTopicScreen.tsx'),
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
    expect(knowledgeLibraryScreenSource).toMatch(/fetchKnowledgeTopicDetailVM/);
    expect(knowledgeLibraryScreenSource).toMatch(/KnowledgeCard/);
    expect(knowledgeLibraryScreenSource).toMatch(/KnowledgeTopicScreen/);
    expect(knowledgeLibraryScreenSource).not.toMatch(
      /knowledgeCatalog|KnowledgeCatalogEntry|KnowledgeNode|createKnowledgeLibraryVM|createKnowledgeTopicDetailVM|canonicalPath|docs\/knowledge|unlock|required reading|complete to continue/i,
    );
    expect(knowledgeTopicScreenSource).toMatch(/createKnowledgeTopicScreenViewData/);
    expect(knowledgeTopicScreenSource).toMatch(/KnowledgeTopicCard/);
    expect(knowledgeTopicScreenSource).not.toMatch(
      /fetchKnowledgeTopicDetailVM|createKnowledgeTopicDetailVM|knowledgeCatalog|canonicalPath|docs\/knowledge|markdown|unlock|required reading|complete to continue/i,
    );
    expect(dashboardScreenSource).not.toMatch(
      /KnowledgeCard|KnowledgeTopicScreen|fetchKnowledgeTopicDetailVM/,
    );
    expect(snapshotScreenSource).not.toMatch(
      /KnowledgeCard|KnowledgeTopicScreen|fetchKnowledgeTopicDetailVM/,
    );
    expect(tradeHubScreenSource).not.toMatch(
      /KnowledgeCard|KnowledgeTopicScreen|fetchKnowledgeTopicDetailVM/,
    );
  });
});
