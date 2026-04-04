import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ReflectionSummaryCard } from '@/app/components/ReflectionSummaryCard';
import { createInsightsReflectionScreenViewData } from '@/app/screens/insightsReflectionScreenView';
import type { ReflectionComparisonVM } from '@/services/insights/types';

function ReflectionWindowCard(params: {
  label: string;
  title: string;
  rangeText: string | null;
}) {
  return (
    <View style={styles.windowCard}>
      <Text style={styles.windowLabel}>{params.label}</Text>
      <Text style={styles.windowTitle}>{params.title}</Text>
      {params.rangeText ? <Text style={styles.windowRange}>{params.rangeText}</Text> : null}
    </View>
  );
}

export function InsightsReflectionScreen(params: {
  reflectionVM: ReflectionComparisonVM | null;
  onBack: () => void;
}) {
  const screenView = createInsightsReflectionScreenViewData(params.reflectionVM);

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

        {screenView.windows.length > 0 ? (
          <View style={styles.windowRow}>
            {screenView.windows.map((window) => (
              <ReflectionWindowCard
                key={window.id}
                label={window.label}
                title={window.title}
                rangeText={window.rangeText}
              />
            ))}
          </View>
        ) : null}

        {screenView.items.map((item) => (
          <ReflectionSummaryCard key={`${item.emphasisText}:${item.title}`} item={item} />
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
  windowRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  windowCard: {
    flexGrow: 1,
    minWidth: 150,
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    padding: 14,
  },
  windowLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  windowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  windowRange: {
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
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
