import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { defaultInsightsExportDispatchAdapter } from '@/providers/insightsExportDispatchProvider';
import { EventHistoryCard } from '@/app/components/EventHistoryCard';
import { InsightsArchiveScreen } from '@/app/screens/InsightsArchiveScreen';
import { InsightsCompareScreen } from '@/app/screens/InsightsCompareScreen';
import { InsightsDetailScreen } from '@/app/screens/InsightsDetailScreen';
import { InsightsExportScreen } from '@/app/screens/InsightsExportScreen';
import { InsightsJournalScreen } from '@/app/screens/InsightsJournalScreen';
import { InsightsSummaryScreen } from '@/app/screens/InsightsSummaryScreen';
import { InsightsYearInReviewScreen } from '@/app/screens/InsightsYearInReviewScreen';
import { createInsightsScreenViewData } from '@/app/screens/insightsScreenView';
import { DEFAULT_USER_PROFILE, type UserProfile } from '@/app/state/profileState';
import { fetchComparisonWindowVM } from '@/services/insights/fetchComparisonWindowVM';
import { fetchExportOptionsVM } from '@/services/insights/fetchExportOptionsVM';
import { fetchInsightsArchiveVM } from '@/services/insights/fetchInsightsArchiveVM';
import { fetchInsightsHistoryVM } from '@/services/insights/fetchInsightsHistoryVM';
import { fetchJournalEntryVM } from '@/services/insights/fetchJournalEntryVM';
import { fetchPeriodSummaryVM } from '@/services/insights/fetchPeriodSummaryVM';
import { fetchPreparedExportRequest } from '@/services/insights/fetchPreparedExportRequest';
import { fetchSummaryArchiveVM } from '@/services/insights/fetchSummaryArchiveVM';
import { fetchYearInReviewVM } from '@/services/insights/fetchYearInReviewVM';
import { markInsightsHistoryViewed } from '@/services/insights/insightsLastViewed';
import { saveJournalEntry } from '@/services/insights/saveJournalEntry';
import { dispatchExportRequest } from '@/services/insights/dispatchExportRequest';
import type {
  ComparisonWindow,
  ExportFormat,
  ExportOptionsVM,
  JournalEntryContext,
  JournalEntryVM,
  PreparedExportDispatchResult,
  PreparedExportRequestVM,
  ReflectionPeriod,
} from '@/services/insights/types';
import { updateJournalEntry } from '@/services/insights/updateJournalEntry';

type InsightsRoute =
  | 'HOME'
  | 'DETAIL'
  | 'JOURNAL'
  | 'COMPARE'
  | 'SUMMARY'
  | 'SUMMARY_ARCHIVE'
  | 'YEAR_IN_REVIEW'
  | 'EXPORT';

const DEFAULT_COMPARISON_WINDOW: ComparisonWindow = 'LAST_90_DAYS_VS_PREVIOUS_90_DAYS';
const DEFAULT_SUMMARY_PERIOD: ReflectionPeriod = 'LAST_MONTH';
const EXPORT_TIMEZONE_LABEL = 'UTC';

type ExportSelectionState = {
  profile: UserProfile;
  format: ExportFormat | null;
  includeJournalReference: boolean;
  optionsVM: ExportOptionsVM;
  requestVM: PreparedExportRequestVM;
};

const GENERAL_JOURNAL_CONTEXT: JournalEntryContext = {
  contextType: 'GENERAL_REFLECTION',
};

function resolvePreferredExportFormat(
  exportOptionsVM: ExportOptionsVM,
  preferredFormat: ExportFormat | null,
): ExportFormat | null {
  if (exportOptionsVM.availability.status === 'UNAVAILABLE') {
    return null;
  }

  if (preferredFormat) {
    const matchingOption = exportOptionsVM.availability.options.find(
      (option) => option.format === preferredFormat && option.isAvailable,
    );

    if (matchingOption) {
      return matchingOption.format;
    }
  }

  return exportOptionsVM.availability.options.find((option) => option.isAvailable)?.format ?? null;
}

export function InsightsScreen() {
  const [screenNowMs] = useState(() => Date.now());
  const nowProvider = () => screenNowMs;
  const journalNowProvider = () => Date.now();
  function createExportState(params: {
    profile: UserProfile;
    preferredFormat: ExportFormat | null;
    period: ReflectionPeriod;
    includeJournalReference: boolean;
  }): ExportSelectionState {
    const optionsVM = fetchExportOptionsVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider,
      profile: params.profile,
    });
    const format = resolvePreferredExportFormat(optionsVM, params.preferredFormat);

    return {
      profile: params.profile,
      format,
      includeJournalReference: params.includeJournalReference,
      optionsVM,
      requestVM: fetchPreparedExportRequest({
        surface: 'INSIGHTS_SCREEN',
        nowProvider,
        profile: params.profile,
        format,
        period: params.period,
        timezoneLabel: EXPORT_TIMEZONE_LABEL,
        includeJournalReference: params.includeJournalReference,
        dispatchSupported: defaultInsightsExportDispatchAdapter.dispatchSupported,
        canShare: defaultInsightsExportDispatchAdapter.canShare,
      }),
    };
  }
  const [route, setRoute] = useState<InsightsRoute>('HOME');
  const [selectedSummaryPeriod, setSelectedSummaryPeriod] =
    useState<ReflectionPeriod>(DEFAULT_SUMMARY_PERIOD);
  const [journalContext, setJournalContext] = useState<JournalEntryContext>(GENERAL_JOURNAL_CONTEXT);
  const [historyVM] = useState(() =>
    fetchInsightsHistoryVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider,
    }),
  );
  const [archiveVM, setArchiveVM] = useState(() =>
    fetchInsightsArchiveVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider,
    }),
  );
  const [summaryArchiveVM] = useState(() =>
    fetchSummaryArchiveVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider,
    }),
  );
  const [yearInReviewVM] = useState(() =>
    fetchYearInReviewVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider,
    }),
  );
  const [selectedComparisonWindow, setSelectedComparisonWindow] =
    useState<ComparisonWindow>(DEFAULT_COMPARISON_WINDOW);
  const [comparisonWindowVM, setComparisonWindowVM] = useState(() =>
    fetchComparisonWindowVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider,
      window: DEFAULT_COMPARISON_WINDOW,
    }),
  );
  const [journalVM, setJournalVM] = useState<JournalEntryVM>(() =>
    fetchJournalEntryVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider,
      context: GENERAL_JOURNAL_CONTEXT,
    }),
  );
  const [summaryVM, setSummaryVM] = useState(() =>
    fetchPeriodSummaryVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider,
      period: DEFAULT_SUMMARY_PERIOD,
    }),
  );
  const [exportState, setExportState] = useState<ExportSelectionState>(() =>
    createExportState({
      profile: DEFAULT_USER_PROFILE,
      preferredFormat: 'PDF_SUMMARY',
      period: DEFAULT_SUMMARY_PERIOD,
      includeJournalReference: false,
    }),
  );
  const [exportDispatchResult, setExportDispatchResult] =
    useState<PreparedExportDispatchResult | null>(null);
  const [isExportDispatching, setIsExportDispatching] = useState(false);
  const screenView = createInsightsScreenViewData(historyVM, {
    hasJournal: true,
    hasArchive: archiveVM.availability.status === 'AVAILABLE',
    hasReflection: true,
    hasSummaries: true,
    hasSummaryArchive: true,
    hasYearInReview: true,
    hasExport: true,
  });

  function refreshExportState(params: {
    profile?: UserProfile;
    preferredFormat?: ExportFormat | null;
    period?: ReflectionPeriod;
    includeJournalReference?: boolean;
  }) {
    setExportState(
      createExportState({
        profile: params.profile ?? exportState.profile,
        preferredFormat:
          params.preferredFormat === undefined ? exportState.format : params.preferredFormat,
        period: params.period ?? selectedSummaryPeriod,
        includeJournalReference:
          params.includeJournalReference === undefined
            ? exportState.includeJournalReference
            : params.includeJournalReference,
      }),
    );
    setExportDispatchResult(null);
  }

  function selectInsightsPeriod(period: ReflectionPeriod) {
    setSelectedSummaryPeriod(period);
    setSummaryVM(
      fetchPeriodSummaryVM({
        surface: 'INSIGHTS_SCREEN',
        nowProvider,
        period,
      }),
    );
    refreshExportState({
      period,
    });
  }

  function refreshJournalView(context: JournalEntryContext) {
    setJournalContext(context);
    setJournalVM(
      fetchJournalEntryVM({
        surface: 'INSIGHTS_SCREEN',
        nowProvider,
        context,
      }),
    );
  }

  function openJournal(context: JournalEntryContext) {
    refreshJournalView(context);
    setRoute('JOURNAL');
  }

  function openSummaryPeriod(period: ReflectionPeriod) {
    selectInsightsPeriod(period);
    setRoute('SUMMARY');
  }

  function selectComparisonWindow(window: ComparisonWindow) {
    setSelectedComparisonWindow(window);
    setComparisonWindowVM(
      fetchComparisonWindowVM({
        surface: 'INSIGHTS_SCREEN',
        nowProvider,
        window,
      }),
    );
  }

  useEffect(() => {
    markInsightsHistoryViewed({
      viewedAt: historyVM.generatedAt,
    });
  }, [historyVM.generatedAt]);

  if (!screenView) {
    return null;
  }

  if (route === 'DETAIL') {
    return (
      <InsightsDetailScreen
        archiveVM={archiveVM}
        onBack={() => setRoute('HOME')}
        onSelectSection={(selectedSectionId) =>
          setArchiveVM(
            fetchInsightsArchiveVM({
              surface: 'INSIGHTS_SCREEN',
              nowProvider,
              selectedSectionId,
            }),
          )
        }
      />
    );
  }

  if (route === 'JOURNAL') {
    return (
      <InsightsJournalScreen
        journalVM={journalVM}
        onSave={(body) => {
          const result = saveJournalEntry({
            surface: 'INSIGHTS_SCREEN',
            nowProvider: journalNowProvider,
            context: journalContext,
            body,
          });

          if (result.status === 'SAVED') {
            refreshJournalView(journalContext);
          }

          return result;
        }}
        onUpdate={(entryId, body) => {
          const result = updateJournalEntry({
            surface: 'INSIGHTS_SCREEN',
            nowProvider: journalNowProvider,
            context: journalContext,
            entryId,
            body,
          });

          if (result.status === 'UPDATED') {
            refreshJournalView(journalContext);
          }

          return result;
        }}
        onBack={() => setRoute('HOME')}
      />
    );
  }

  if (route === 'COMPARE') {
    return (
      <InsightsCompareScreen
        comparisonVM={comparisonWindowVM}
        selectedWindow={selectedComparisonWindow}
        onSelectWindow={selectComparisonWindow}
        onBack={() => setRoute('HOME')}
      />
    );
  }

  if (route === 'SUMMARY') {
    return (
      <InsightsSummaryScreen
        summaryVM={summaryVM}
        selectedPeriod={selectedSummaryPeriod}
        onSelectPeriod={openSummaryPeriod}
        onOpenJournal={
          summaryVM.availability.status === 'AVAILABLE'
            ? () =>
                openJournal({
                  contextType: 'PERIOD_SUMMARY',
                  period: selectedSummaryPeriod,
                })
            : undefined
        }
        onBack={() => setRoute('HOME')}
      />
    );
  }

  if (route === 'SUMMARY_ARCHIVE') {
    return (
      <InsightsArchiveScreen
        summaryArchiveVM={summaryArchiveVM}
        onBack={() => setRoute('HOME')}
        onOpenSummary={openSummaryPeriod}
      />
    );
  }

  if (route === 'YEAR_IN_REVIEW') {
    return (
      <InsightsYearInReviewScreen
        yearInReviewVM={yearInReviewVM}
        onOpenJournal={
          yearInReviewVM.availability.status === 'AVAILABLE'
            ? () =>
                openJournal({
                  contextType: 'YEAR_IN_REVIEW',
                  period: yearInReviewVM.availability.period,
                })
            : undefined
        }
        onBack={() => setRoute('HOME')}
      />
    );
  }

  if (route === 'EXPORT') {
    return (
      <InsightsExportScreen
        exportOptionsVM={exportState.optionsVM}
        preparedExportRequestVM={exportState.requestVM}
        dispatchResult={exportDispatchResult}
        isDispatching={isExportDispatching}
        selectedProfile={exportState.profile}
        selectedPeriod={selectedSummaryPeriod}
        selectedFormat={exportState.format}
        onSelectProfile={(profile) =>
          refreshExportState({
            profile,
          })
        }
        onSelectPeriod={selectInsightsPeriod}
        onSelectFormat={(format) =>
          refreshExportState({
            preferredFormat: format,
          })
        }
        onToggleJournalReference={() =>
          refreshExportState({
            includeJournalReference: !exportState.includeJournalReference,
          })
        }
        onDispatchExport={async () => {
          setIsExportDispatching(true);

          try {
            setExportDispatchResult(
              await dispatchExportRequest({
                preparedExportRequestVM: exportState.requestVM,
                adapter: defaultInsightsExportDispatchAdapter,
              }),
            );
          } finally {
            setIsExportDispatching(false);
          }
        }}
        onBack={() => setRoute('HOME')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.header}>{screenView.title}</Text>
          <Text style={styles.summary}>{screenView.summary}</Text>
        </View>

        {screenView.continuityNote ? (
          <View style={styles.continuityCard}>
            <Text style={styles.continuityText}>{screenView.continuityNote}</Text>
          </View>
        ) : null}

        {screenView.availabilityMessage ? (
          <View style={styles.unavailableCard}>
            <Text style={styles.unavailableText}>{screenView.availabilityMessage}</Text>
          </View>
        ) : null}

        {screenView.sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => (
              <EventHistoryCard
                key={`${section.id}:${item.title}:${item.timestampText ?? 'no-time'}`}
                item={item}
              />
            ))}
          </View>
        ))}

        {screenView.journalActionLabel ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => openJournal(GENERAL_JOURNAL_CONTEXT)}
            style={styles.archiveButton}
          >
            <Text style={styles.archiveButtonText}>{screenView.journalActionLabel}</Text>
            {screenView.journalActionSummary ? (
              <Text style={styles.archiveButtonSummary}>{screenView.journalActionSummary}</Text>
            ) : null}
          </Pressable>
        ) : null}

        {screenView.archiveActionLabel ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setRoute('DETAIL')}
            style={styles.archiveButton}
          >
            <Text style={styles.archiveButtonText}>{screenView.archiveActionLabel}</Text>
            {screenView.archiveActionSummary ? (
              <Text style={styles.archiveButtonSummary}>{screenView.archiveActionSummary}</Text>
            ) : null}
          </Pressable>
        ) : null}

        {screenView.reflectionActionLabel ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setRoute('COMPARE')}
            style={styles.archiveButton}
          >
            <Text style={styles.archiveButtonText}>{screenView.reflectionActionLabel}</Text>
            {screenView.reflectionActionSummary ? (
              <Text style={styles.archiveButtonSummary}>{screenView.reflectionActionSummary}</Text>
            ) : null}
          </Pressable>
        ) : null}

        {screenView.summaryActionLabel ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setRoute('SUMMARY')}
            style={styles.archiveButton}
          >
            <Text style={styles.archiveButtonText}>{screenView.summaryActionLabel}</Text>
            {screenView.summaryActionSummary ? (
              <Text style={styles.archiveButtonSummary}>{screenView.summaryActionSummary}</Text>
            ) : null}
          </Pressable>
        ) : null}

        {screenView.summaryArchiveActionLabel ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setRoute('SUMMARY_ARCHIVE')}
            style={styles.archiveButton}
          >
            <Text style={styles.archiveButtonText}>{screenView.summaryArchiveActionLabel}</Text>
            {screenView.summaryArchiveActionSummary ? (
              <Text style={styles.archiveButtonSummary}>
                {screenView.summaryArchiveActionSummary}
              </Text>
            ) : null}
          </Pressable>
        ) : null}

        {screenView.yearInReviewActionLabel ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setRoute('YEAR_IN_REVIEW')}
            style={styles.archiveButton}
          >
            <Text style={styles.archiveButtonText}>{screenView.yearInReviewActionLabel}</Text>
            {screenView.yearInReviewActionSummary ? (
              <Text style={styles.archiveButtonSummary}>
                {screenView.yearInReviewActionSummary}
              </Text>
            ) : null}
          </Pressable>
        ) : null}

        {screenView.exportActionLabel ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setRoute('EXPORT')}
            style={styles.archiveButton}
          >
            <Text style={styles.archiveButtonText}>{screenView.exportActionLabel}</Text>
            {screenView.exportActionSummary ? (
              <Text style={styles.archiveButtonSummary}>{screenView.exportActionSummary}</Text>
            ) : null}
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 16,
    gap: 20,
  },
  hero: {
    gap: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  summary: {
    fontSize: 14,
    lineHeight: 21,
    color: '#4b5563',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  continuityCard: {
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  continuityText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#334155',
  },
  unavailableCard: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 14,
  },
  unavailableText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#4b5563',
  },
  archiveButton: {
    gap: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    padding: 14,
  },
  archiveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  archiveButtonSummary: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
});
