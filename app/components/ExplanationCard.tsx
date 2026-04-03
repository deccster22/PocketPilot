import { StyleSheet, Text, View } from 'react-native';

import type { DashboardScreenViewData } from '@/app/screens/dashboardScreenView';

type ExplanationCardViewData = Extract<DashboardScreenViewData['explanation'], { visible: true }>;

export function ExplanationCard(params: {
  explanation: ExplanationCardViewData;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Why</Text>
        <Text style={styles.title}>{params.explanation.title}</Text>
        <Text style={styles.summary}>{params.explanation.summary}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{params.explanation.confidenceText}</Text>
        <Text style={styles.sectionDetail}>{params.explanation.confidenceNote}</Text>
      </View>

      {params.explanation.lineage.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Lineage</Text>
          {params.explanation.lineage.map((item) => (
            <View key={`${item.label}:${item.detail}`} style={styles.item}>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Text style={styles.itemDetail}>{item.detail}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {params.explanation.limitations.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Limitations</Text>
          {params.explanation.limitations.map((item) => (
            <Text key={item} style={styles.limitation}>
              - {item}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  header: {
    gap: 4,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  summary: {
    fontSize: 13,
    lineHeight: 19,
    color: '#374151',
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  sectionDetail: {
    fontSize: 13,
    lineHeight: 19,
    color: '#374151',
  },
  item: {
    gap: 2,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  itemDetail: {
    fontSize: 13,
    lineHeight: 19,
    color: '#374151',
  },
  limitation: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6b7280',
  },
});
