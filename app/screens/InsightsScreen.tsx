import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EventHistoryCard } from '@/app/components/EventHistoryCard';
import { createInsightsScreenViewData } from '@/app/screens/insightsScreenView';
import { fetchInsightsHistoryVM } from '@/services/insights/fetchInsightsHistoryVM';

export function InsightsScreen() {
  const screenView = createInsightsScreenViewData(
    fetchInsightsHistoryVM({
      surface: 'INSIGHTS_SCREEN',
    }),
  );

  if (!screenView) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.header}>{screenView.title}</Text>
          <Text style={styles.summary}>{screenView.summary}</Text>
        </View>

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
});
