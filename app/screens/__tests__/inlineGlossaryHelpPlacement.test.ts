import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('inline glossary help placement', () => {
  it('keeps term matching in services while app routes taps through the existing topic detail path', () => {
    const dashboardScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'DashboardScreen.tsx'),
      'utf8',
    );
    const tradeHubScreenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'TradeHubScreen.tsx'),
      'utf8',
    );
    const explanationCardSource = readFileSync(
      join(process.cwd(), 'app', 'components', 'ExplanationCard.tsx'),
      'utf8',
    );
    const inlineGlossaryTextSource = readFileSync(
      join(process.cwd(), 'app', 'components', 'InlineGlossaryText.tsx'),
      'utf8',
    );

    expect(dashboardScreenSource).toMatch(/KnowledgeTopicScreen/);
    expect(dashboardScreenSource).toMatch(/fetchKnowledgeTopicDetailVM/);
    expect(dashboardScreenSource).toMatch(/acknowledgeInlineGlossaryTerms/);
    expect(dashboardScreenSource).toMatch(/onOpenGlossaryTopic/);
    expect(dashboardScreenSource).toMatch(/handleOpenKnowledgeTopic\(topicId/);
    expect(dashboardScreenSource).toMatch(/originSurface: 'DASHBOARD'/);

    expect(tradeHubScreenSource).toMatch(/KnowledgeTopicScreen/);
    expect(tradeHubScreenSource).toMatch(/fetchKnowledgeTopicDetailVM/);
    expect(tradeHubScreenSource).toMatch(/InlineGlossaryText/);
    expect(tradeHubScreenSource).toMatch(/screenView\?\.safetyInlineGlossary/);
    expect(tradeHubScreenSource).toMatch(/acknowledgeInlineGlossaryTerms/);
    expect(tradeHubScreenSource).toMatch(/handleOpenKnowledgeTopic\(topicId/);
    expect(tradeHubScreenSource).toMatch(/originSurface: 'TRADE_HUB'/);

    expect(explanationCardSource).toMatch(/InlineGlossaryText/);
    expect(explanationCardSource).toMatch(/onOpenGlossaryTopic/);
    expect(explanationCardSource).not.toMatch(
      /createInlineGlossaryHelp|selectInlineGlossaryTerms|createGlossaryTermIndex|createInlineGlossaryAcknowledgementKey|knowledgeCatalog|RegExp\(/,
    );
    expect(inlineGlossaryTextSource).not.toMatch(
      /createInlineGlossaryHelp|selectInlineGlossaryTerms|createGlossaryTermIndex|createInlineGlossaryAcknowledgementKey|knowledgeCatalog|match\(|exec\(/,
    );
    expect(dashboardScreenSource).not.toMatch(
      /createInlineGlossaryHelp|selectInlineGlossaryTerms|createGlossaryTermIndex|createInlineGlossaryAcknowledgementKey|knowledgeCatalog/,
    );
    expect(tradeHubScreenSource).not.toMatch(
      /createInlineGlossaryHelp|selectInlineGlossaryTerms|createGlossaryTermIndex|createInlineGlossaryAcknowledgementKey|knowledgeCatalog/,
    );
  });
});
