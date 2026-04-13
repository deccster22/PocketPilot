import { StyleSheet, Text, View } from 'react-native';

import type { SnapshotScreenSinceLastCheckedViewData } from '@/app/screens/snapshotScreenView';

type SnapshotSinceLastCheckedItemViewData = Extract<
  SnapshotScreenSinceLastCheckedViewData,
  { visible: true }
>['items'][number];

function formatEmphasis(emphasis: SnapshotSinceLastCheckedItemViewData['emphasis']): string {
  switch (emphasis) {
    case 'CHANGE':
      return 'Change';
    case 'CONTEXT':
      return 'Context';
    default:
      return 'Neutral';
  }
}

function getEmphasisStyle(
  emphasis: SnapshotSinceLastCheckedItemViewData['emphasis'],
) {
  switch (emphasis) {
    case 'CHANGE':
      return styles.changeBadge;
    case 'CONTEXT':
      return styles.contextBadge;
    default:
      return styles.neutralBadge;
  }
}

export function SinceLastCheckedCard(props: {
  item: SnapshotScreenSinceLastCheckedViewData;
}) {
  if (!props.item.visible) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Prepared changes</Text>
      <Text style={styles.title}>{props.item.title}</Text>
      <Text style={styles.summary}>{props.item.summary}</Text>
      <View style={styles.items}>
        {props.item.items.map((item) => (
          <View key={`${item.title}:${item.summary}`} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={[styles.emphasisBadge, getEmphasisStyle(item.emphasis)]}>
                {formatEmphasis(item.emphasis)}
              </Text>
            </View>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemSummary}>{item.summary}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
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
  items: {
    gap: 8,
  },
  itemCard: {
    gap: 6,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emphasisBadge: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  neutralBadge: {
    color: '#475569',
  },
  changeBadge: {
    color: '#0f766e',
  },
  contextBadge: {
    color: '#4b5563',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  itemSummary: {
    fontSize: 13,
    lineHeight: 19,
    color: '#4b5563',
  },
});
