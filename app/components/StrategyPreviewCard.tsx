import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { StrategyPreviewCardViewData } from '@/app/screens/strategyNavigatorScreenView';

export function StrategyPreviewCard(props: {
  preview: StrategyPreviewCardViewData;
  onOpenKnowledgeTopic?: (topicId: string) => void;
}) {
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

      {props.preview.knowledgeItems.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Core concepts behind this preview</Text>
          <Text style={styles.body}>
            Optional reading if you want a little more context without leaving the simulated lane.
          </Text>
          {props.preview.knowledgeItems.map((item) => (
            <Pressable
              key={item.topicId}
              accessibilityRole="button"
              disabled={!props.onOpenKnowledgeTopic}
              onPress={() => props.onOpenKnowledgeTopic?.(item.topicId)}
              style={styles.knowledgeItem}
            >
              <Text style={styles.knowledgeTitle}>{item.title}</Text>
              <Text style={styles.knowledgeReason}>{item.reason}</Text>
              <Text style={styles.knowledgeLink}>Open topic</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
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
  knowledgeItem: {
    gap: 4,
    borderWidth: 1,
    borderColor: '#dbe4ea',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    padding: 12,
  },
  knowledgeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  knowledgeReason: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
  knowledgeLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f766e',
  },
});
