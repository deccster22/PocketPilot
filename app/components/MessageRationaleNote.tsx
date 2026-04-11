import { StyleSheet, Text, View } from 'react-native';

import type { MessageRationaleAvailability } from '@/services/messages/types';

export function MessageRationaleNote(props: {
  rationale: MessageRationaleAvailability | null | undefined;
}) {
  if (props.rationale?.status !== 'AVAILABLE') {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{props.rationale.rationale.title}</Text>
      <Text style={styles.summary}>{props.rationale.rationale.summary}</Text>
      {props.rationale.rationale.items.map((item) => (
        <Text key={item} style={styles.item}>
          - {item}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    padding: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  summary: {
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
  },
  item: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748b',
  },
});
