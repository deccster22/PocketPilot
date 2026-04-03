import { StyleSheet, Text, View } from 'react-native';

import type { KnowledgeLibraryCardViewData } from '@/app/screens/knowledgeLibraryScreenView';

export function KnowledgeCard(params: {
  item: KnowledgeLibraryCardViewData;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.metaRow}>
        <Text style={styles.metaBadge}>{params.item.difficultyText}</Text>
        <Text style={styles.metaBadge}>{params.item.mediaTypeText}</Text>
      </View>
      <Text style={styles.title}>{params.item.title}</Text>
      <Text style={styles.summary}>{params.item.summary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
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
});
