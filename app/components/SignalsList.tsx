import { StyleSheet, Text, View } from 'react-native';

import type { StrategySignal } from '@/core/strategy/types';

type SignalsListProps = {
  signals: StrategySignal[];
};

export function SignalsList({ signals }: SignalsListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Strategy signals</Text>
      {signals.length === 0 ? (
        <Text style={styles.empty}>No signals for this snapshot.</Text>
      ) : (
        signals.map((signal, index) => (
          <View key={`${signal.strategyId}-${signal.symbol ?? 'none'}-${index}`} style={styles.card}>
            <Text style={styles.cardTitle}>{signal.title}</Text>
            <Text style={styles.message}>{signal.message}</Text>
            {signal.tags && signal.tags.length > 0 ? (
              <View style={styles.tagsRow}>
                {signal.tags.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#ffffff',
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  message: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#f9fafb',
  },
  tagText: {
    fontSize: 11,
    color: '#6b7280',
  },
  empty: {
    fontSize: 13,
    color: '#6b7280',
  },
});
