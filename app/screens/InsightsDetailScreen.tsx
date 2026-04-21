import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { InsightsDetailCard } from '@/app/components/InsightsDetailCard';
import {
  createInsightsDetailScreenViewData,
  type InsightsArchiveSectionOptionViewData,
  type SinceLastCheckedContinuityEntryViewData,
} from '@/app/screens/insightsDetailScreenView';
import type { InsightsArchiveVM } from '@/services/insights/types';

function SectionOptionButton(params: {
  option: InsightsArchiveSectionOptionViewData;
  onPress: (sectionId: string) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => params.onPress(params.option.id)}
      style={[
        styles.sectionOption,
        params.option.isSelected ? styles.sectionOptionSelected : null,
      ]}
    >
      <Text
        style={[
          styles.sectionOptionText,
          params.option.isSelected ? styles.sectionOptionTextSelected : null,
        ]}
      >
        {params.option.title}
      </Text>
    </Pressable>
  );
}

function ContinuityEntryCard(params: { entry: SinceLastCheckedContinuityEntryViewData }) {
  return (
    <View style={styles.continuityEntryCard}>
      <Text style={styles.continuityEntryTitle}>{params.entry.title}</Text>
      <Text style={styles.continuityEntrySummary}>{params.entry.summary}</Text>
      {params.entry.surfacedAtText ? (
        <Text style={styles.continuityEntryMeta}>Surfaced: {params.entry.surfacedAtText}</Text>
      ) : null}
      {params.entry.viewedAtText ? (
        <Text style={styles.continuityEntryMeta}>Viewed: {params.entry.viewedAtText}</Text>
      ) : null}
      {params.entry.items.map((item) => (
        <View key={`${item.title}:${item.summary}`} style={styles.continuityItemRow}>
          <Text style={styles.continuityItemTitle}>{item.title}</Text>
          <Text style={styles.continuityItemSummary}>{item.summary}</Text>
        </View>
      ))}
    </View>
  );
}

export function InsightsDetailScreen(params: {
  archiveVM: InsightsArchiveVM | null;
  onBack: () => void;
  onSelectSection: (sectionId: string) => void;
}) {
  const screenView = createInsightsDetailScreenViewData(params.archiveVM);

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

        {screenView.continuityTitle ? (
          <View style={styles.continuitySection}>
            <Text style={styles.continuityTitle}>{screenView.continuityTitle}</Text>
            {screenView.continuitySummary ? (
              <Text style={styles.continuitySummary}>{screenView.continuitySummary}</Text>
            ) : null}
            {screenView.continuityEntries.map((entry) => (
              <ContinuityEntryCard key={`${entry.title}:${entry.surfacedAtText ?? 'none'}`} entry={entry} />
            ))}
          </View>
        ) : null}

        {screenView.sectionOptions.length > 0 ? (
          <View style={styles.sectionOptionsRow}>
            {screenView.sectionOptions.map((option) => (
              <SectionOptionButton
                key={option.id}
                option={option}
                onPress={params.onSelectSection}
              />
            ))}
          </View>
        ) : null}

        {screenView.selectedSectionTitle ? (
          <Text style={styles.sectionTitle}>{screenView.selectedSectionTitle}</Text>
        ) : null}

        {screenView.items.map((item) => (
          <InsightsDetailCard
            key={`${item.title}:${item.timestampText ?? 'no-time'}`}
            item={item}
          />
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
  continuitySection: {
    gap: 8,
  },
  continuityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  continuitySummary: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
  continuityEntryCard: {
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    padding: 12,
  },
  continuityEntryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  continuityEntrySummary: {
    fontSize: 13,
    lineHeight: 19,
    color: '#334155',
  },
  continuityEntryMeta: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748b',
  },
  continuityItemRow: {
    gap: 2,
  },
  continuityItemTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f766e',
  },
  continuityItemSummary: {
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
  },
  sectionOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sectionOption: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sectionOptionSelected: {
    borderColor: '#0f766e',
    backgroundColor: '#ecfeff',
  },
  sectionOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  sectionOptionTextSelected: {
    color: '#115e59',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
