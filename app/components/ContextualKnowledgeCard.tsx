import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ContextualKnowledgeSectionViewData } from '@/app/screens/contextualKnowledgeView';

export function ContextualKnowledgeCard(props: {
  contextualKnowledge: ContextualKnowledgeSectionViewData;
  onOpenTopic: (topicId: string) => void;
}) {
  const { contextualKnowledge } = props;
  const emphasisStyle =
    contextualKnowledge.presentation.emphasis === 'STANDARD'
      ? styles.standardCard
      : contextualKnowledge.presentation.emphasis === 'LIGHT'
        ? styles.lightCard
        : styles.subordinateCard;

  return (
    <View style={[styles.card, emphasisStyle]}>
      <Text style={styles.eyebrow}>Knowledge</Text>
      <Text style={styles.title}>{contextualKnowledge.title}</Text>
      <Text style={styles.summary}>{contextualKnowledge.summary}</Text>

      {contextualKnowledge.items.map((item) => (
        <Pressable
          key={item.topicId}
          accessibilityRole="button"
          onPress={() => props.onOpenTopic(item.topicId)}
          style={[
            styles.itemCard,
            contextualKnowledge.presentation.emphasis === 'SUBORDINATE'
              ? styles.subordinateItemCard
              : null,
          ]}
        >
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemReason}>{item.reason}</Text>
          <Text
            style={[
              styles.itemLink,
              contextualKnowledge.presentation.emphasis === 'SUBORDINATE'
                ? styles.subordinateItemLink
                : null,
            ]}
          >
            Open topic
          </Text>
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
  standardCard: {
    borderColor: '#dbe4ea',
    backgroundColor: '#f8fafc',
  },
  lightCard: {
    borderColor: '#d7dde5',
    backgroundColor: '#f9fbfc',
    padding: 13,
  },
  subordinateCard: {
    gap: 8,
    borderColor: '#e2e8f0',
    backgroundColor: '#fbfcfd',
    padding: 12,
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
  subordinateItemCard: {
    padding: 10,
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
  subordinateItemLink: {
    color: '#0f766e',
    opacity: 0.8,
  },
});
