import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EventHistoryCard } from '@/app/components/EventHistoryCard';
import { InsightsArchiveScreen } from '@/app/screens/InsightsArchiveScreen';
import { InsightsDetailScreen } from '@/app/screens/InsightsDetailScreen';
import { InsightsReflectionScreen } from '@/app/screens/InsightsReflectionScreen';
import { InsightsSummaryScreen } from '@/app/screens/InsightsSummaryScreen';
import { InsightsYearInReviewScreen } from '@/app/screens/InsightsYearInReviewScreen';
import { createInsightsScreenViewData } from '@/app/screens/insightsScreenView';
import { fetchInsightsArchiveVM } from '@/services/insights/fetchInsightsArchiveVM';
import { fetchInsightsHistoryVM } from '@/services/insights/fetchInsightsHistoryVM';
import { fetchPeriodSummaryVM } from '@/services/insights/fetchPeriodSummaryVM';
import { fetchReflectionComparisonVM } from '@/services/insights/fetchReflectionComparisonVM';
import { fetchSummaryArchiveVM } from '@/services/insights/fetchSummaryArchiveVM';
import { fetchYearInReviewVM } from '@/services/insights/fetchYearInReviewVM';
import { markInsightsHistoryViewed } from '@/services/insights/insightsLastViewed';
import type { ReflectionPeriod } from '@/services/insights/types';

type InsightsRoute =
  | 'HOME'
  | 'DETAIL'
  | 'REFLECTION'
  | 'SUMMARY'
  | 'SUMMARY_ARCHIVE'
  | 'YEAR_IN_REVIEW';

const DEFAULT_SUMMARY_PERIOD: ReflectionPeriod = 'LAST_MONTH';

export function InsightsScreen() {
  const [screenNowMs] = useState(() => Date.now());
  const nowProvider = () => screenNowMs;
  const [route, setRoute] = useState<InsightsRoute>('HOME');
  const [selectedSummaryPeriod, setSelectedSummaryPeriod] =
    useState<ReflectionPeriod>(DEFAULT_SUMMARY_PERIOD);
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
  const [reflectionVM] = useState(() =>
    fetchReflectionComparisonVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider,
    }),
  );
  const [summaryVM, setSummaryVM] = useState(() =>
    fetchPeriodSummaryVM({
      surface: 'INSIGHTS_SCREEN',
      nowProvider,
      period: DEFAULT_SUMMARY_PERIOD,
    }),
  );
  const screenView = createInsightsScreenViewData(historyVM, {
    hasArchive: archiveVM.availability.status === 'AVAILABLE',
    hasReflection: historyVM.availability.status === 'AVAILABLE',
    hasSummaries: true,
    hasSummaryArchive: true,
    hasYearInReview: true,
  });

  function openSummaryPeriod(period: ReflectionPeriod) {
    setSelectedSummaryPeriod(period);
    setSummaryVM(
      fetchPeriodSummaryVM({
        surface: 'INSIGHTS_SCREEN',
        nowProvider,
        period,
      }),
    );
    setRoute('SUMMARY');
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

  if (route === 'REFLECTION') {
    return <InsightsReflectionScreen reflectionVM={reflectionVM} onBack={() => setRoute('HOME')} />;
  }

  if (route === 'SUMMARY') {
    return (
      <InsightsSummaryScreen
        summaryVM={summaryVM}
        selectedPeriod={selectedSummaryPeriod}
        onSelectPeriod={openSummaryPeriod}
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
      <InsightsYearInReviewScreen yearInReviewVM={yearInReviewVM} onBack={() => setRoute('HOME')} />
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
            onPress={() => setRoute('REFLECTION')}
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
