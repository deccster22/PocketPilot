import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ContextualKnowledgeCandidate } from '@/services/knowledge/types';

export function ContextualKnowledgeCard(props: {
  items: ReadonlyArray<ContextualKnowledgeCandidate>;
  onOpenTopic: (topicId: string) => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Optional knowledge</Text>
      <Text style={styles.title}>If you want a little more context</Text>
      <Text style={styles.summary}>
        These links stay subordinate to the preview. They explain the current lens without gating
        anything else on this screen.
      </Text>

      {props.items.map((item) => (
        <Pressable
          key={item.topicId}
          accessibilityRole="button"
          onPress={() => props.onOpenTopic(item.topicId)}
          style={styles.itemCard}
        >
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemReason}>{item.reason}</Text>
          <Text style={styles.itemLink}>Open topic</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    borderWidth: 1,
    borderColor: '#dbe4ea',
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    padding: 14,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  summary: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
  itemCard: {
    gap: 4,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  itemReason: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
  itemLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f766e',
  },
});
