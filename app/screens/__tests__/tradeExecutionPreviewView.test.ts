import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createTradeExecutionPreviewViewData } from '@/app/screens/tradeExecutionPreviewView';

describe('createTradeExecutionPreviewViewData', () => {
  it('reads the prepared execution preview without constructing payloads in the app', () => {
    expect(
      createTradeExecutionPreviewViewData({
        planId: 'plan-btc',
        capabilityResolution: {
          accountId: 'acct-live',
          path: 'BRACKET',
          confirmationPath: 'BRACKET',
          supported: true,
          unavailableReason: null,
        },
        adapterCapability: {
          adapterId: 'adapter-preview-bracket',
          supportsBracket: true,
          supportsOCO: false,
          supportsMarketBuy: true,
          supportsLimitBuy: true,
          supportsStopLoss: true,
          supportsTakeProfit: true,
        },
        pathPreview: {
          planId: 'plan-btc',
          adapterId: 'adapter-preview-bracket',
          confirmationPathType: 'BRACKET',
          payloadType: 'BRACKET',
          label: 'Bracket payload placeholder',
          supported: true,
          executable: false,
        },
        payloadPreview: {
          payloadType: 'BRACKET',
          symbol: 'BTC',
          orderCount: 1,
          fieldsPresent: ['symbol', 'entryOrderType', 'stopLossPrice', 'takeProfitPrice'],
          executable: false,
        },
      }),
    ).toEqual({
      planId: 'plan-btc',
      adapterText: 'Adapter adapter-preview-bracket',
      pathText: 'BRACKET path | Bracket payload placeholder',
      payloadText: 'BRACKET placeholder | 1 order preview',
      fieldsText: 'Fields: symbol, entryOrderType, stopLossPrice, takeProfitPrice',
      executableText: 'Executable is always false in this phase.',
    });
  });

  it('returns null when no prepared execution preview is available', () => {
    expect(createTradeExecutionPreviewViewData(null)).toBeNull();
  });

  it('keeps payload construction logic out of the app screen', () => {
    const screenSource = readFileSync(
      join(process.cwd(), 'app', 'screens', 'TradeHubScreen.tsx'),
      'utf8',
    );

    expect(screenSource).not.toMatch(/createExecutionPayloadPreview/);
    expect(screenSource).not.toMatch(/getExecutionAdapterCapability/);
    expect(screenSource).toMatch(/fetchExecutionPreviewVM/);
  });
});
