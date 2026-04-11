import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  createInsightsArchiveScreenViewData,
  type SummaryArchiveEntryViewData,
} from '@/app/screens/insightsArchiveScreenView';
import type { ReflectionPeriod, SummaryArchiveVM } from '@/services/insights/types';

function SummaryArchiveCard(params: {
  entry: SummaryArchiveEntryViewData;
  onPress: (period: ReflectionPeriod) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => params.onPress(params.entry.period)}
      style={styles.entryCard}
    >
      <Text style={styles.entryPeriodLabel}>{params.entry.periodLabel}</Text>
      <Text style={styles.entryTitle}>{params.entry.title}</Text>
      <Text style={styles.entrySummary}>{params.entry.summary}</Text>
      <View style={styles.entryMeta}>
        <Text style={styles.entryMetaText}>{params.entry.coveredRangeLabel}</Text>
        {params.entry.generatedAtLabel ? (
          <Text style={styles.entryMetaText}>{params.entry.generatedAtLabel}</Text>
        ) : null}
      </View>
      <Text style={styles.entryActionText}>{params.entry.actionLabel}</Text>
    </Pressable>
  );
}

export function InsightsArchiveScreen(params: {
  summaryArchiveVM: SummaryArchiveVM | null;
  onBack: () => void;
  onOpenSummary: (period: ReflectionPeriod) => void;
}) {
  const screenView = createInsightsArchiveScreenViewData(params.summaryArchiveVM);

  if (!screenView) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable accessibilityRole="button" onPress={params.onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to Insights</Text>
        </Pressable>

        <View style={styles.hero}>
          <Text style={styles.header}>{screenView.title}</Text>
          <Text style={styles.summary}>{screenView.summary}</Text>
        </View>

        {screenView.availabilityMessage ? (
          <View style={styles.unavailableCard}>
            <Text style={styles.unavailableText}>{screenView.availabilityMessage}</Text>
          </View>
        ) : null}

        {screenView.entries.map((entry) => (
          <SummaryArchiveCard key={entry.archiveId} entry={entry} onPress={params.onOpenSummary} />
        ))}
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
    gap: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
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
  entryCard: {
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    padding: 14,
  },
  entryPeriodLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f766e',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  entrySummary: {
    fontSize: 13,
    lineHeight: 20,
    color: '#374151',
  },
  entryMeta: {
    gap: 4,
  },
  entryMetaText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748b',
  },
  entryActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#115e59',
  },
});
