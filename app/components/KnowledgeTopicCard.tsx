import { StyleSheet, Text, View } from 'react-native';

import type { KnowledgeTopicRelatedCardViewData } from '@/app/screens/knowledgeTopicScreenView';

export function KnowledgeTopicCard(params: { item: KnowledgeTopicRelatedCardViewData }) {
  return (
    <View style={styles.card}>
      {params.item.metaText ? <Text style={styles.meta}>{params.item.metaText}</Text> : null}
      <Text style={styles.title}>{params.item.title}</Text>
      <Text style={styles.summary}>{params.item.summary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    padding: 14,
  },
  meta: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  summary: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
});
