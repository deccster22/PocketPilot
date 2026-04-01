import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { SnapshotScreenBriefingViewData } from '@/app/screens/snapshotScreenView';
import type { SnapshotBriefingKind } from '@/services/orientation/types';

function getEyebrow(kind: SnapshotBriefingKind) {
  return kind === 'REORIENTATION' ? 'Welcome Back' : 'Since Last Checked';
}

export function SnapshotBriefingCard(params: {
  briefing: SnapshotScreenBriefingViewData;
  onDismiss?: () => void;
}) {
  if (!params.briefing.visible) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{getEyebrow(params.briefing.kind)}</Text>
          <Text style={styles.headline}>{params.briefing.title}</Text>
          {params.briefing.subtitle ? <Text style={styles.meta}>{params.briefing.subtitle}</Text> : null}
        </View>
        {params.onDismiss ? (
          <Pressable onPress={params.onDismiss} style={styles.dismissButton}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </Pressable>
        ) : null}
      </View>
      {params.briefing.items.map((item) => (
        <View key={`${item.label}:${item.detail}`} style={styles.item}>
          <Text style={styles.itemLabel}>{item.label}</Text>
          <Text style={styles.itemDetail}>{item.detail}</Text>
        </View>
      ))}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  headline: {
    fontSize: 15,
    lineHeight: 21,
    color: '#111827',
  },
  meta: {
    fontSize: 12,
    color: '#6b7280',
  },
  dismissButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
  },
  dismissText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  item: {
    gap: 2,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  itemDetail: {
    fontSize: 13,
    lineHeight: 19,
    color: '#374151',
  },
});
