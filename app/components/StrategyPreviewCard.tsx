import { StyleSheet, Text, View } from 'react-native';

import type { StrategyPreviewCardViewData } from '@/app/screens/strategyNavigatorScreenView';

export function StrategyPreviewCard(props: { preview: StrategyPreviewCardViewData }) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Prepared walkthrough</Text>
      <Text style={styles.title}>
        {props.preview.strategyTitle} - {props.preview.scenarioTitle}
      </Text>
      <Text style={styles.summary}>{props.preview.scenarioSummary}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Snapshot emphasis</Text>
        <Text style={styles.body}>{props.preview.snapshotHeadline}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Dashboard shift</Text>
        {props.preview.dashboardFocus.map((item) => (
          <Text key={item} style={styles.listItem}>
            - {item}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Market events that would matter</Text>
        {props.preview.eventHighlights.map((item) => (
          <Text key={item} style={styles.listItem}>
            - {item}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Alert posture</Text>
        <Text style={styles.body}>{props.preview.alertPosture}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    borderWidth: 1,
    borderColor: '#d5dee5',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  summary: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f2937',
    textTransform: 'uppercase',
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
  },
  listItem: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
  },
});
