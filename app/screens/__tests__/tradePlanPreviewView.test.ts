import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createTradePlanPreviewViewData } from '@/app/screens/tradePlanPreviewView';

describe('createTradePlanPreviewViewData', () => {
  it('reads the prepared trade plan preview contract without adding execution logic', () => {
    const view = createTradePlanPreviewViewData({
      planId: 'primary-plan',
      headline: {
        intentType: 'ACCUMULATE',
        symbol: 'BTC',
        actionState: 'READY',
      },
      rationale: {
        summary:
          'Accumulation setup is supported by confirmed momentum building. Focus symbol: BTC.',
        primaryEventId: 'event-1',
        supportingEventIds: ['event-1', 'event-2'],
        supportingEventCount: 2,
      },
      constraints: {
        requiresConfirmation: true,
        maxPositionSize: 0.1,
      },
      readiness: {
        alignment: 'ALIGNED',
        certainty: 'HIGH',
      },
      placeholders: {
        orderPreviewAvailable: false,
        executionPreviewAvailable: false,
      },
      preparedTradeReferences: {
        status: 'AVAILABLE',
        references: [
          {
            kind: 'STOP',
            label: 'Prepared stop-loss level',
            value: '95',
            sourceLabel: 'Source: prepared plan context',
            limitations: ['Optional planning context from the selected plan. Your own values remain authoritative.'],
          },
          {
            kind: 'TARGET',
            label: 'Prepared target level',
            value: '112',
            sourceLabel: 'Source: supported strategy context',
            limitations: [
              'Optional planning context from the selected plan. Your own values remain authoritative.',
              'Derived from supported strategy context and omitted when context is thin.',
            ],
          },
        ],
      },
      risk: {
        activeBasis: 'ACCOUNT_PERCENT',
        activeBasisLabel: 'Account %',
        basisAvailability: {
          status: 'AVAILABLE',
          selectedBasis: 'ACCOUNT_PERCENT',
          options: [
            {
              basis: 'ACCOUNT_PERCENT',
              label: 'Account %',
              isSelected: true,
            },
            {
              basis: 'FIXED_CURRENCY',
              label: 'Fixed currency',
              isSelected: false,
            },
            {
              basis: 'POSITION_PERCENT',
              label: 'Position %',
              isSelected: false,
            },
          ],
        },
        context: {
          status: 'AVAILABLE',
          basis: 'ACCOUNT_PERCENT',
          headline: 'Account % risk frame',
          summary:
            'Shows the capped loss from this prepared plan as a share of current account value using prepared planning levels only.',
          items: [
            {
              label: 'Risk per trade',
              value: '0.50%',
            },
            {
              label: 'Max loss at cap',
              value: '$50.00',
            },
          ],
        },
      },
      positionSizing: {
        status: 'AVAILABLE',
        output: {
          sizeLabel: 'Position size (Account %)',
          sizeValue: '10 units at $1,000.00 cap',
          maxLossLabel: 'Max loss at stop',
          maxLossValue: '$50.00',
          notes: [
            'Prepared entry $100.00 to stop $95.00.',
            'Support-only readout; no order path is opened here.',
          ],
        },
      },
      riskInputGuidance: {
        status: 'AVAILABLE',
        guidance: {
          title: 'Prepared risk context incomplete',
          summary:
            'PocketPilot can finish sizing and max-loss framing once the selected plan carries the missing context.',
          items: ['Prepared entry and stop-loss prices', 'Prepared position cap'],
        },
      },
    });

    expect(view).toEqual({
      planId: 'primary-plan',
      intentLabel: 'Accumulate',
      symbolLabel: 'BTC',
      actionStateText: 'Ready for confirmation',
      rationaleSummary:
        'Accumulation setup is supported by confirmed momentum building. Focus symbol: BTC.',
      rationaleTraceText: '2 supporting events | primary event event-1',
      readinessText: 'aligned alignment | high certainty',
      constraintsText: 'Confirmation required | max position size 0.1',
      riskBasisText: 'Risk basis: Account %',
      riskStatusText: 'Prepared risk context available',
      riskHeadline: 'Account % risk frame',
      riskSummary:
        'Shows the capped loss from this prepared plan as a share of current account value using prepared planning levels only.',
      riskItems: [
        {
          label: 'Risk per trade',
          value: '0.50%',
        },
        {
          label: 'Max loss at cap',
          value: '$50.00',
        },
      ],
      preparedReferences: {
        visible: true,
        title: 'Prepared planning levels',
        rows: [
          {
            kind: 'STOP',
            label: 'Prepared stop-loss level',
            value: '95',
            sourceLabel: 'Source: prepared plan context',
          },
          {
            kind: 'TARGET',
            label: 'Prepared target level',
            value: '112',
            sourceLabel: 'Source: supported strategy context',
          },
        ],
        limitationText: 'Optional planning context from the selected plan. Your own values remain authoritative.',
        unavailableText: null,
      },
      riskInputGuidance: {
        status: 'AVAILABLE',
        guidance: {
          title: 'Prepared risk context incomplete',
          summary:
            'PocketPilot can finish sizing and max-loss framing once the selected plan carries the missing context.',
          items: ['Prepared entry and stop-loss prices', 'Prepared position cap'],
        },
      },
      positionSizing: {
        statusText: 'Prepared sizing available',
        headline: 'Position size (Account %)',
        summary: 'Shows the prepared position size and stop-based max loss from this selected plan.',
        details: [
          {
            label: 'Position size',
            value: '10 units at $1,000.00 cap',
          },
          {
            label: 'Max loss at stop',
            value: '$50.00',
          },
        ],
        notes: [
          'Prepared entry $100.00 to stop $95.00.',
          'Support-only readout; no order path is opened here.',
        ],
      },
      confirmationText:
        'This is a framed plan preview only. A future confirmation step is still required.',
      placeholderText: 'Order and execution previews are placeholder-only in this phase.',
    });
  });

  it('returns null when no prepared preview is available', () => {
    expect(createTradePlanPreviewViewData(null)).toBeNull();
  });

  it('shows one quiet unavailable prepared-reference line when context is thin', () => {
    const view = createTradePlanPreviewViewData({
      planId: 'thin-context-plan',
      headline: {
        intentType: 'ACCUMULATE',
        symbol: 'BTC',
        actionState: 'CAUTION',
      },
      rationale: {
        summary: 'Prepared context is mixed and cannot support one clear stop/target set.',
        primaryEventId: 'event-thin',
        supportingEventIds: ['event-thin'],
        supportingEventCount: 1,
      },
      constraints: {
        requiresConfirmation: true,
      },
      readiness: {
        alignment: 'NEUTRAL',
        certainty: 'LOW',
      },
      placeholders: {
        orderPreviewAvailable: false,
        executionPreviewAvailable: false,
      },
      preparedTradeReferences: {
        status: 'UNAVAILABLE',
        reason: 'THIN_CONTEXT',
      },
      risk: {
        activeBasis: 'ACCOUNT_PERCENT',
        activeBasisLabel: 'Account %',
        basisAvailability: {
          status: 'AVAILABLE',
          selectedBasis: 'ACCOUNT_PERCENT',
          options: [
            {
              basis: 'ACCOUNT_PERCENT',
              label: 'Account %',
              isSelected: true,
            },
          ],
        },
        context: null,
      },
      positionSizing: {
        status: 'UNAVAILABLE',
        reason: 'INSUFFICIENT_INPUTS',
      },
      riskInputGuidance: {
        status: 'UNAVAILABLE',
        reason: 'NO_GUIDANCE_NEEDED',
      },
    });

    expect(view?.preparedReferences).toEqual({
      visible: true,
      title: 'Prepared planning levels',
      rows: [],
      limitationText: null,
      unavailableText: 'This setup does not provide enough context for prepared stop-loss or target levels yet.',
    });
  });

  it('keeps non-informative unavailable prepared-reference states collapsed', () => {
    const view = createTradePlanPreviewViewData({
      planId: 'no-reference-plan',
      headline: {
        intentType: 'HOLD',
        symbol: 'ETH',
        actionState: 'WAIT',
      },
      rationale: {
        summary: 'No prepared stop/target context is expected for this plan.',
        primaryEventId: 'event-hold',
        supportingEventIds: ['event-hold'],
        supportingEventCount: 1,
      },
      constraints: {
        requiresConfirmation: true,
      },
      readiness: {
        alignment: 'NEUTRAL',
        certainty: 'LOW',
      },
      placeholders: {
        orderPreviewAvailable: false,
        executionPreviewAvailable: false,
      },
      preparedTradeReferences: {
        status: 'UNAVAILABLE',
        reason: 'NO_STRATEGY_REFERENCE',
      },
      risk: {
        activeBasis: 'ACCOUNT_PERCENT',
        activeBasisLabel: 'Account %',
        basisAvailability: {
          status: 'AVAILABLE',
          selectedBasis: 'ACCOUNT_PERCENT',
          options: [
            {
              basis: 'ACCOUNT_PERCENT',
              label: 'Account %',
              isSelected: true,
            },
          ],
        },
        context: null,
      },
      positionSizing: {
        status: 'UNAVAILABLE',
        reason: 'INSUFFICIENT_INPUTS',
      },
      riskInputGuidance: {
        status: 'UNAVAILABLE',
        reason: 'NO_GUIDANCE_NEEDED',
      },
    });

    expect(view?.preparedReferences).toEqual({
      visible: false,
    });
  });

  it('keeps position-sizing math out of the app view helper', () => {
    const source = readFileSync(join(process.cwd(), 'app', 'screens', 'tradePlanPreviewView.ts'), 'utf8');

    expect(source).not.toMatch(/Math\.abs/);
    expect(source).not.toMatch(/positionValue\s*\/\s*entryPrice/);
    expect(source).not.toMatch(/maxLoss\s*\/\s*accountValue/);
    expect(source).toMatch(/preview\.riskInputGuidance\s*\?\?/);
    expect(source).not.toMatch(/entryPrice\s*===\s*null/);
    expect(source).not.toMatch(/stopPrice\s*===\s*null/);
    expect(source).not.toMatch(/accountContext/);
    expect(source).toMatch(/createPositionSizingViewData/);
    expect(source).toMatch(/normalisePreparedTradeReferencesAvailability/);
    expect(source).toMatch(/describePreparedTradeReferencesUnavailableReason/);
    expect(source).toMatch(/shouldRenderPreparedTradeReferencesUnavailableReason/);
    expect(source).not.toMatch(/Source: prepared plan context/);
    expect(source).not.toMatch(/Unavailable because prepared stop\/target context is thin or ambiguous/);
  });

  it('keeps prepared-reference wording free of recommendation, prediction, and profit language', () => {
    const view = createTradePlanPreviewViewData({
      planId: 'language-check-plan',
      headline: {
        intentType: 'ACCUMULATE',
        symbol: 'BTC',
        actionState: 'READY',
      },
      rationale: {
        summary: 'Prepared planning levels are shown for calm planning context only.',
        primaryEventId: 'event-language',
        supportingEventIds: ['event-language'],
        supportingEventCount: 1,
      },
      constraints: {
        requiresConfirmation: true,
      },
      readiness: {
        alignment: 'ALIGNED',
        certainty: 'HIGH',
      },
      placeholders: {
        orderPreviewAvailable: false,
        executionPreviewAvailable: false,
      },
      preparedTradeReferences: {
        status: 'AVAILABLE',
        references: [
          {
            kind: 'STOP',
            label: 'Prepared stop-loss level',
            value: '95',
            sourceLabel: 'Source: prepared plan context',
            limitations: ['Optional planning context from the selected plan. Your own values remain authoritative.'],
          },
        ],
      },
      risk: {
        activeBasis: 'ACCOUNT_PERCENT',
        activeBasisLabel: 'Account %',
        basisAvailability: {
          status: 'AVAILABLE',
          selectedBasis: 'ACCOUNT_PERCENT',
          options: [
            {
              basis: 'ACCOUNT_PERCENT',
              label: 'Account %',
              isSelected: true,
            },
          ],
        },
        context: null,
      },
      positionSizing: {
        status: 'UNAVAILABLE',
        reason: 'INSUFFICIENT_INPUTS',
      },
      riskInputGuidance: {
        status: 'UNAVAILABLE',
        reason: 'NO_GUIDANCE_NEEDED',
      },
    });

    const text = JSON.stringify(view?.preparedReferences);

    expect(text).not.toMatch(/\bbest trade|profit|opportunity|predict|prediction|recommended\b/i);
  });
});
