import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  createInsightsYearInReviewScreenViewData,
  type YearInReviewItemViewData,
} from '@/app/screens/insightsYearInReviewScreenView';
import type { YearInReviewVM } from '@/services/insights/types';

function YearInReviewItemCard(params: { item: YearInReviewItemViewData }) {
  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemEmphasis}>{params.item.emphasisText}</Text>
      <Text style={styles.itemLabel}>{params.item.label}</Text>
      <Text style={styles.itemValue}>{params.item.value}</Text>
    </View>
  );
}

export function InsightsYearInReviewScreen(params: {
  yearInReviewVM: YearInReviewVM | null;
  onOpenJournal?: () => void;
  onBack: () => void;
}) {
  const screenView = createInsightsYearInReviewScreenViewData(params.yearInReviewVM);

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

        {screenView.reviewTitle && screenView.reviewSummary ? (
          <View style={styles.reviewSummaryCard}>
            <Text style={styles.reviewSummaryTitle}>{screenView.reviewTitle}</Text>
            <Text style={styles.reviewSummaryText}>{screenView.reviewSummary}</Text>
          </View>
        ) : null}

        {screenView.items.map((item) => (
          <YearInReviewItemCard key={`${item.emphasisText}:${item.label}`} item={item} />
        ))}

        {screenView.limitations.length > 0 ? (
          <View style={styles.limitationsCard}>
            <Text style={styles.limitationsTitle}>Limitations</Text>
            {screenView.limitations.map((limitation) => (
              <Text key={limitation} style={styles.limitationText}>
                - {limitation}
              </Text>
            ))}
          </View>
        ) : null}

        {params.onOpenJournal ? (
          <Pressable
            accessibilityRole="button"
            onPress={params.onOpenJournal}
            style={styles.journalButton}
          >
            <Text style={styles.journalButtonText}>Open note for this review</Text>
            <Text style={styles.journalButtonSummary}>
              Keep a small optional note tied to this annual review if you want a little more of
              your own context.
            </Text>
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
  reviewSummaryCard: {
    gap: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 14,
  },
  reviewSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  reviewSummaryText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#374151',
  },
  itemCard: {
    gap: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 14,
  },
  itemEmphasis: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f766e',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  itemValue: {
    fontSize: 13,
    lineHeight: 19,
    color: '#374151',
  },
  limitationsCard: {
    gap: 6,
    borderRadius: 12,
    backgroundColor: '#ecfeff',
    padding: 14,
  },
  limitationsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  limitationText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
  },
  journalButton: {
    gap: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    padding: 14,
  },
  journalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  journalButtonSummary: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
});
