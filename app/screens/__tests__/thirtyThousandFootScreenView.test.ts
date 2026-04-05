import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createThirtyThousandFootScreenViewData } from '@/app/screens/thirtyThousandFootScreenView';

describe('createThirtyThousandFootScreenViewData', () => {
  it('reads the prepared 30,000 ft VM without deriving macro context in app', () => {
    expect(
      createThirtyThousandFootScreenViewData({
        generatedAt: '2026-04-05T00:00:00.000Z',
        fit: {
          state: 'MIXED',
          summary:
            'Conditions look mixed for this strategy while volatility stays elevated relative to recent conditions.',
        },
        availability: {
          status: 'AVAILABLE',
          title: 'Broader conditions look mixed',
          summary:
            'Volatility or broader structure looks less settled than Snapshot usually needs to show.',
          details: [
            'Volatility is elevated relative to recent conditions.',
            'Broader structure still leans down, but the broader picture remains mixed.',
            'Current strategy fit currently reads mixed under this backdrop.',
          ],
        },
      }),
    ).toEqual({
      title: '30,000 ft view',
      summary: 'A broader context note that stays calm, descriptive, and optional.',
      generatedAtText: '2026-04-05 00:00 UTC',
      availabilityMessage: null,
      contextTitle: 'Broader conditions look mixed',
      contextSummary:
        'Volatility or broader structure looks less settled than Snapshot usually needs to show.',
      fitLabel: 'Strategy fit',
      fitStateText: 'Mixed',
      fitSummary:
        'Conditions look mixed for this strategy while volatility stays elevated relative to recent conditions.',
      details: [
        'Volatility is elevated relative to recent conditions.',
        'Broader structure still leans down, but the broader picture remains mixed.',
        'Current strategy fit currently reads mixed under this backdrop.',
      ],
    });
  });

  it('shows a minimal honest unavailable state when broader context is not ready', () => {
    expect(
      createThirtyThousandFootScreenViewData({
        generatedAt: '2026-04-05T00:00:00.000Z',
        fit: {
          state: 'UNKNOWN',
          summary:
            'There is not enough confirmed interpreted context yet to describe strategy fit clearly.',
        },
        availability: {
          status: 'UNAVAILABLE',
          reason: 'INSUFFICIENT_INTERPRETED_CONTEXT',
        },
      }),
    ).toEqual({
      title: '30,000 ft view',
      summary: 'A broader context note that stays calm, descriptive, and optional.',
      generatedAtText: '2026-04-05 00:00 UTC',
      availabilityMessage: 'There is not enough interpreted context yet to prepare a broader read.',
      contextTitle: null,
      contextSummary: null,
      fitLabel: 'Strategy fit',
      fitStateText: 'Unknown',
      fitSummary:
        'There is not enough confirmed interpreted context yet to describe strategy fit clearly.',
      details: [],
    });
  });

  it('keeps the detail helper on the prepared 30,000 ft VM only', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'thirtyThousandFootScreenView.ts'),
      'utf8',
    );

    expect(source).toMatch(/vm\.availability\.status === 'UNAVAILABLE'/);
    expect(source).toMatch(/vm\.fit\.state/);
    expect(source).not.toMatch(
      /createThirtyThousandFootVM|fetchThirtyThousandFootVM|createStrategyFitSummary|eventId|strategyId|signalsTriggered|providerId|metadata|quoteMeta|notification|alert center|badge|inbox/,
    );
  });

  it('returns null when the prepared 30,000 ft VM is unavailable', () => {
    expect(createThirtyThousandFootScreenViewData(null)).toBeNull();
  });
});
