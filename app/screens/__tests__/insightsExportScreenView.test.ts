import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createInsightsExportScreenViewData } from '@/app/screens/insightsExportScreenView';

describe('createInsightsExportScreenViewData', () => {
  it('reads prepared export and dispatch contracts without deriving export payload details in app', () => {
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
              dispatchAvailability: {
                status: 'AVAILABLE',
                format: 'PDF_SUMMARY',
                fileLabel: 'last-month-reflection-summary-2026-04-15.pdf',
                canShare: false,
                journalFollowThroughLabel: 'Include linked summary note',
              },
              journalReferenceIncluded: true,
              document: {
                kind: 'SUMMARY',
                sections: [],
                limitationNotes: [],
                journalReference: {
                  title: 'Summary note',
                  linkageLabel: 'Linked to March 2026 summary',
                  updatedAtLabel: 'Updated 2026-04-14 09:30 UTC',
                  body: 'A steadier month still asked for patience.',
                },
              },
            },
          },
        },
        null,
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
      dispatchAvailabilityMessage: null,
      dispatchActionLabel: 'Create export',
      journalFollowThroughLabel: 'Include linked summary note',
      journalFollowThroughSummary: 'The linked summary note will be added as a final PDF section.',
      journalReferenceIncluded: true,
      dispatchResultMessage: null,
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

  it('shows an honest read-only state when dispatch is unavailable', () => {
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
            status: 'AVAILABLE',
            request: {
              format: 'PDF_SUMMARY',
              title: 'Last month reflection summary',
              coveredRangeLabel: 'Covered period: March 2026',
              timezoneLabel: 'UTC',
              payloadSummary: [],
              dispatchAvailability: {
                status: 'UNAVAILABLE',
                reason: 'DISPATCH_NOT_SUPPORTED',
              },
              journalReferenceIncluded: false,
              document: {
                kind: 'SUMMARY',
                sections: [],
                limitationNotes: [],
                journalReference: null,
              },
            },
          },
        },
        null,
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
      requestAvailabilityMessage: null,
      dispatchAvailabilityMessage:
        'This device cannot create this export yet, so the preview remains read-only.',
      dispatchActionLabel: null,
      journalFollowThroughLabel: null,
      journalFollowThroughSummary: null,
      journalReferenceIncluded: false,
      dispatchResultMessage: null,
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
      requestTitle: 'Last month reflection summary',
      coveredRangeLabel: 'Covered period: March 2026',
      timezoneLabel: 'UTC',
      payloadSummary: [],
    });
  });

  it('shows the dispatch result from the prepared contract family', () => {
    expect(
      createInsightsExportScreenViewData(
        {
          generatedAt: '2026-04-15T00:00:00.000Z',
          profile: 'BEGINNER',
          availability: {
            status: 'AVAILABLE',
            options: [],
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
          status: 'AVAILABLE',
          fileLabel: 'last-month-reflection-summary-2026-04-15.pdf',
          mimeType: 'application/pdf',
          timezoneLabel: 'UTC',
          journalReferenceIncluded: true,
        },
        {
          selectedProfile: 'BEGINNER',
          selectedPeriod: 'LAST_MONTH',
          selectedFormat: null,
        },
      ),
    ).toEqual(
      expect.objectContaining({
        requestAvailabilityMessage: 'Choose an export option to preview what would be prepared.',
        dispatchResultMessage:
          'Created last-month-reflection-summary-2026-04-15.pdf. It keeps UTC visible and includes the linked summary note.',
      }),
    );
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
      /createPreparedExportRequest|fetchPreparedExportRequest|dispatchExportRequest|createExportOptionsVM|fetchExportOptionsVM|eventLedger|eventId|strategyId|signalsTriggered|providerId|metadata|score|unread|inbox|badge/,
    );
  });

  it('returns null when the prepared export contracts are unavailable', () => {
    expect(
      createInsightsExportScreenViewData(null, null, null, {
        selectedProfile: 'BEGINNER',
        selectedPeriod: 'LAST_MONTH',
        selectedFormat: null,
      }),
    ).toBeNull();
  });
});
