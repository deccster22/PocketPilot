import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('trade hub prepared reference placement', () => {
  it('keeps prepared-reference rendering compact and subordinate inside Plan Preview', () => {
    const screenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'TradeHubScreen.tsx'),
      'utf8',
    );

    const planPreviewIndex = screenSource.indexOf('<Text style={styles.sectionTitle}>Plan Preview</Text>');
    const preparedReferenceIndex = screenSource.indexOf('previewView.preparedReferences.visible');
    const positionSizingIndex = screenSource.indexOf('previewView.positionSizing.statusText');
    const preparedReferenceRenderBlock = screenSource.slice(
      preparedReferenceIndex,
      preparedReferenceIndex + 900,
    );

    expect(planPreviewIndex).toBeGreaterThanOrEqual(0);
    expect(preparedReferenceIndex).toBeGreaterThan(planPreviewIndex);
    expect(positionSizingIndex).toBeGreaterThan(preparedReferenceIndex);
    expect(screenSource).toMatch(/styles\.subordinateReferenceBlock/);
    expect(screenSource).not.toMatch(/<Text style=\{styles\.sectionTitle\}>Prepared planning levels<\/Text>/);
    expect(preparedReferenceRenderBlock).not.toMatch(/badge|warning|alert|blocker/i);
    expect(screenSource).toMatch(/Use price levels to estimate position size and risk\./);
    expect(screenSource).toMatch(/These are planning inputs only\./);
    expect(screenSource).toMatch(/They do not place an order\./);
    expect(screenSource).toMatch(/Your own values override any prepared planning levels\./);
    expect(screenSource).toMatch(/Guardrails are optional account-level checks for planning\./);
    expect(screenSource).toMatch(/label=\"Entry price\"/);
    expect(screenSource).toMatch(/label=\"Stop-loss price\"/);
    expect(screenSource).toMatch(/label=\"Target price\"/);
    expect(screenSource).not.toMatch(/Entry level|Stop level|Target level/);
    expect(screenSource).not.toMatch(/Entry reference|Stop reference|Target reference|Reference symbol/);
    expect(screenSource).not.toMatch(/Prepared references stay optional starting points/);
  });

  it('keeps prepared-reference render text free of recommendation and profit framing', () => {
    const screenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'TradeHubScreen.tsx'),
      'utf8',
    );

    expect(screenSource).not.toMatch(/\bbest trade|profit opportunity|prediction|recommended\b/i);
    expect(screenSource).not.toMatch(/execute now|place order now|submit order now/i);
  });
});
