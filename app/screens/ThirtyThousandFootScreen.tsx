import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  createThirtyThousandFootScreenViewData,
} from '@/app/screens/thirtyThousandFootScreenView';
import type { ThirtyThousandFootVM } from '@/services/context/types';

export function ThirtyThousandFootScreen(params: {
  vm: ThirtyThousandFootVM | null;
  onBack: () => void;
}) {
  const screenView = createThirtyThousandFootScreenViewData(params.vm);

  if (!screenView) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable accessibilityRole="button" onPress={params.onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to Snapshot</Text>
        </Pressable>

        <View style={styles.hero}>
          <Text style={styles.header}>{screenView.title}</Text>
          <Text style={styles.summary}>{screenView.summary}</Text>
          {screenView.generatedAtText ? (
            <Text style={styles.generatedAt}>Prepared {screenView.generatedAtText}</Text>
          ) : null}
        </View>

        {screenView.contextTitle ? (
          <View style={styles.contextCard}>
            <Text style={styles.contextTitle}>{screenView.contextTitle}</Text>
            {screenView.contextSummary ? (
              <Text style={styles.contextSummary}>{screenView.contextSummary}</Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.fitCard}>
          <View style={styles.fitHeader}>
            <Text style={styles.fitLabel}>{screenView.fitLabel}</Text>
            <Text style={styles.fitState}>{screenView.fitStateText}</Text>
          </View>
          <Text style={styles.fitSummary}>{screenView.fitSummary}</Text>
        </View>

        {screenView.availabilityMessage ? (
          <View style={styles.unavailableCard}>
            <Text style={styles.unavailableText}>{screenView.availabilityMessage}</Text>
          </View>
        ) : null}

        {screenView.details.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Context details</Text>
            {screenView.details.map((detail) => (
              <View key={detail} style={styles.detailRow}>
                <View style={styles.detailDot} />
                <Text style={styles.detailText}>{detail}</Text>
              </View>
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
  generatedAt: {
    fontSize: 12,
    color: '#64748b',
  },
  contextCard: {
    gap: 6,
    borderWidth: 1,
    borderColor: '#dbe4ea',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 14,
  },
  contextTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  contextSummary: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
  fitCard: {
    gap: 8,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    padding: 14,
  },
  fitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  fitLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  fitState: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  fitSummary: {
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
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderColor: '#dbe4ea',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 14,
  },
  detailDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginTop: 6,
    backgroundColor: '#94a3b8',
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
});
