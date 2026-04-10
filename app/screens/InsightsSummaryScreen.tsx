import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  createInsightsSummaryScreenViewData,
  type PeriodSummaryOptionViewData,
  type PeriodSummaryItemViewData,
} from '@/app/screens/insightsSummaryScreenView';
import type { PeriodSummaryVM, ReflectionPeriod } from '@/services/insights/types';

function SummaryPeriodButton(params: {
  option: PeriodSummaryOptionViewData;
  onPress: (period: ReflectionPeriod) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => params.onPress(params.option.id)}
      style={[styles.periodOption, params.option.isSelected ? styles.periodOptionSelected : null]}
    >
      <Text
        style={[
          styles.periodOptionText,
          params.option.isSelected ? styles.periodOptionTextSelected : null,
        ]}
      >
        {params.option.label}
      </Text>
    </Pressable>
  );
}

function PeriodSummaryItemCard(params: { item: PeriodSummaryItemViewData }) {
  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemEmphasis}>{params.item.emphasisText}</Text>
      <Text style={styles.itemLabel}>{params.item.label}</Text>
      <Text style={styles.itemValue}>{params.item.value}</Text>
    </View>
  );
}

export function InsightsSummaryScreen(params: {
  summaryVM: PeriodSummaryVM | null;
  selectedPeriod: ReflectionPeriod;
  onSelectPeriod: (period: ReflectionPeriod) => void;
  onBack: () => void;
}) {
  const screenView = createInsightsSummaryScreenViewData(params.summaryVM, {
    selectedPeriod: params.selectedPeriod,
  });

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

        <View style={styles.periodOptionsRow}>
          {screenView.periodOptions.map((option) => (
            <SummaryPeriodButton key={option.id} option={option} onPress={params.onSelectPeriod} />
          ))}
        </View>

        {screenView.availabilityMessage ? (
          <View style={styles.unavailableCard}>
            <Text style={styles.unavailableText}>{screenView.availabilityMessage}</Text>
          </View>
        ) : null}

        {screenView.periodTitle && screenView.periodSummary ? (
          <View style={styles.periodSummaryCard}>
            <Text style={styles.periodSummaryTitle}>{screenView.periodTitle}</Text>
            <Text style={styles.periodSummaryText}>{screenView.periodSummary}</Text>
          </View>
        ) : null}

        {screenView.items.map((item) => (
          <PeriodSummaryItemCard key={`${item.emphasisText}:${item.label}`} item={item} />
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
  periodOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  periodOption: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  periodOptionSelected: {
    borderColor: '#0f766e',
    backgroundColor: '#ecfeff',
  },
  periodOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  periodOptionTextSelected: {
    color: '#115e59',
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
  periodSummaryCard: {
    gap: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 14,
  },
  periodSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  periodSummaryText: {
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
});
