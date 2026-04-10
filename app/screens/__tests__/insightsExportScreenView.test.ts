import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createInsightsExportScreenViewData } from '@/app/screens/insightsExportScreenView';

describe('createInsightsExportScreenViewData', () => {
  it('reads prepared export contracts without deriving export payload details in app', () => {
    expect(
      createInsightsExportScreenViewData(
        {
          generatedAt: '2026-04-15T00:00:00.000Z',
          profile: 'ADVANCED',
          availability: {
            status: 'AVAILABLE',
            options: [
              {
                format: 'PDF_SUMMARY',
                label: 'PDF summary',
                description: 'A calm formatted export of prepared reflection notes.',
                isAvailable: true,
              },
              {
                format: 'CSV_EVENT_LEDGER',
                label: 'CSV event ledger',
                description: 'An event-level export of ledger rows in the selected period.',
                isAvailable: false,
                unavailableReason: 'Available on the Advanced profile.',
              },
            ],
          },
        },
        {
          generatedAt: '2026-04-15T00:00:00.000Z',
          availability: {
            status: 'AVAILABLE',
            request: {
              format: 'PDF_SUMMARY',
              title: 'Last month reflection summary',
              coveredRangeLabel: 'Covered period: March 2026',
              timezoneLabel: 'UTC',
              payloadSummary: [
                {
                  label: 'Contains',
                  value: 'A calm formatted cover plus the selected prepared summary.',
                },
              ],
            },
          },
        },
        {
          selectedProfile: 'ADVANCED',
          selectedPeriod: 'LAST_MONTH',
          selectedFormat: 'PDF_SUMMARY',
        },
      ),
    ).toEqual({
      title: 'Export reflection',
      summary:
        'Prepare a calm export of reflection material that is already ready under Insights. Each option stays explicit about what it contains.',
      profileLabel: 'Advanced profile',
      availabilityMessage: null,
      requestAvailabilityMessage: null,
      periodOptions: [
        {
          id: 'LAST_MONTH',
          label: 'Last month',
          isSelected: true,
        },
        {
          id: 'LAST_QUARTER',
          label: 'Last quarter',
          isSelected: false,
        },
      ],
      options: [
        {
          format: 'PDF_SUMMARY',
          label: 'PDF summary',
          description: 'A calm formatted export of prepared reflection notes.',
          availabilityText: 'Ready now',
          isAvailable: true,
          isSelected: true,
        },
        {
          format: 'CSV_EVENT_LEDGER',
          label: 'CSV event ledger',
          description: 'An event-level export of ledger rows in the selected period.',
          availabilityText: 'Available on the Advanced profile.',
          isAvailable: false,
          isSelected: false,
        },
      ],
      requestTitle: 'Last month reflection summary',
      coveredRangeLabel: 'Covered period: March 2026',
      timezoneLabel: 'UTC',
      payloadSummary: [
        {
          label: 'Contains',
          value: 'A calm formatted cover plus the selected prepared summary.',
        },
      ],
    });
  });

  it('shows a minimal honest unavailable state when exports are not ready', () => {
    expect(
      createInsightsExportScreenViewData(
        {
          generatedAt: '2026-04-15T00:00:00.000Z',
          profile: 'BEGINNER',
          availability: {
            status: 'UNAVAILABLE',
            reason: 'NO_EXPORTABLE_CONTENT',
          },
        },
        {
          generatedAt: '2026-04-15T00:00:00.000Z',
          availability: {
            status: 'UNAVAILABLE',
            reason: 'NO_EXPORT_SELECTED',
          },
        },
        {
          selectedProfile: 'BEGINNER',
          selectedPeriod: 'LAST_QUARTER',
          selectedFormat: null,
        },
      ),
    ).toEqual({
      title: 'Export reflection',
      summary:
        'Prepare a calm export of reflection material that is already ready under Insights. Each option stays explicit about what it contains.',
      profileLabel: 'Beginner profile',
      availabilityMessage: 'There is not enough prepared reflection content to export yet.',
      requestAvailabilityMessage: 'Choose an export option to preview what would be prepared.',
      periodOptions: [
        {
          id: 'LAST_MONTH',
          label: 'Last month',
          isSelected: false,
        },
        {
          id: 'LAST_QUARTER',
          label: 'Last quarter',
          isSelected: true,
        },
      ],
      options: [],
      requestTitle: null,
      coveredRangeLabel: null,
      timezoneLabel: null,
      payloadSummary: [],
    });
  });

  it('keeps the export screen helper on prepared export VMs only', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'screens', 'insightsExportScreenView.ts'),
      'utf8',
    );

    expect(source).toMatch(/selectedProfile/);
    expect(source).toMatch(/selectedPeriod/);
    expect(source).toMatch(/selectedFormat/);
    expect(source).not.toMatch(
      /createPreparedExportRequest|fetchPreparedExportRequest|createExportOptionsVM|fetchExportOptionsVM|eventLedger|eventId|strategyId|signalsTriggered|providerId|metadata|score|unread|inbox|badge/,
    );
  });

  it('returns null when the prepared export contracts are unavailable', () => {
    expect(
      createInsightsExportScreenViewData(null, null, {
        selectedProfile: 'BEGINNER',
        selectedPeriod: 'LAST_MONTH',
        selectedFormat: null,
      }),
    ).toBeNull();
  });
});
