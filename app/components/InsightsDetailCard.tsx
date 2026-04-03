import { StyleSheet, Text, View } from 'react-native';

import type { InsightsDetailCardViewData } from '@/app/screens/insightsDetailScreenView';

export function InsightsDetailCard(params: {
  item: InsightsDetailCardViewData;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.metaRow}>
        <Text style={styles.metaBadge}>{params.item.eventKindText}</Text>
        {params.item.symbolText ? <Text style={styles.metaBadge}>{params.item.symbolText}</Text> : null}
        {params.item.timestampText ? (
          <Text style={styles.timestamp}>{params.item.timestampText}</Text>
        ) : null}
      </View>
      <Text style={styles.title}>{params.item.title}</Text>
      <Text style={styles.summary}>{params.item.summary}</Text>
      {params.item.detailNoteText ? <Text style={styles.detailNote}>{params.item.detailNoteText}</Text> : null}
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
    alignItems: 'center',
  },
  metaBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  timestamp: {
    fontSize: 11,
    color: '#6b7280',
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
  detailNote: {
    fontSize: 13,
    lineHeight: 19,
    color: '#4b5563',
  },
});
