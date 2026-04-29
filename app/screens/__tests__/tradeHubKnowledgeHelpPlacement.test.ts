import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('trade hub knowledge help placement', () => {
  it('keeps term help slot-based and service-owned in the Trade Hub screen', () => {
    const source = readFileSync(join(process.cwd(), 'app', 'screens', 'TradeHubScreen.tsx'), 'utf8');

    expect(source).toMatch(/findInlineHelpAffordance/);
    expect(source).toMatch(/TRADE_HUB_GUARDRAILS/);
    expect(source).toMatch(/RISK_TOOL_STOP_LOSS_PRICE/);
    expect(source).toMatch(/RISK_TOOL_TARGET_PRICE/);
    expect(source).toMatch(/RISK_TOOL_ACTIVE_RISK_BASIS/);
    expect(source).toMatch(/handleOpenHelpAffordance/);
    expect(source).toMatch(/affordance\.tapTopicId/);
    expect(source).not.toMatch(
      /createTradeHubHelpAffordances|glossary-stop-loss-price|trade-hub-stop-loss-price|CONTENT_REGISTER|docs\/knowledge/,
    );
    expect(source).not.toMatch(/RegExp\(|match\(|exec\(/);
    expect(source).not.toMatch(/includes\('Stop-loss price'\)|includes\('Target price'\)/);
  });

  it('keeps dense numeric summaries free of inline help links and preserves the non-trade boundary', () => {
    const source = readFileSync(join(process.cwd(), 'app', 'screens', 'TradeHubScreen.tsx'), 'utf8');

    expect(source).toMatch(/This screen does not place trades\./);

    const riskItemsStart = source.indexOf('previewView.riskItems.map((item) =>');
    const riskItemsEnd = source.indexOf('{previewView.preparedReferences.visible');
    const riskItemsBlock = source.slice(riskItemsStart, riskItemsEnd);

    expect(riskItemsStart).toBeGreaterThanOrEqual(0);
    expect(riskItemsEnd).toBeGreaterThan(riskItemsStart);
    expect(riskItemsBlock).not.toMatch(/Help|inlineHelpLink|handleOpenHelpAffordance|Pressable/);
  });
});
