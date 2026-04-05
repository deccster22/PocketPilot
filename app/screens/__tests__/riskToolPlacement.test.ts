import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('risk tool placement', () => {
  it('keeps risk calculations in services and out of the Trade Hub screen', () => {
    const screenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'TradeHubScreen.tsx'),
      'utf8',
    );

    expect(screenSource).toMatch(/fetchRiskToolVM/);
    expect(screenSource).not.toMatch(/createRiskToolVM/);
    expect(screenSource).not.toMatch(/selectRiskReferences/);
    expect(screenSource).not.toMatch(/riskAmount\s*\/\s*stopDistance/);
    expect(screenSource).not.toMatch(/Math\.abs\(/);
  });
});
