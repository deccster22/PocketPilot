import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { SnapshotScreenMessageViewData } from '@/app/screens/snapshotScreenView';

export function SnapshotBriefingCard(params: {
  message: SnapshotScreenMessageViewData;
  onDismiss?: () => void;
}) {
  if (!params.message.visible) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.headline}>{params.message.title}</Text>
          <Text style={styles.summary}>{params.message.summary}</Text>
        </View>
        {params.onDismiss ? (
          <Pressable onPress={params.onDismiss} style={styles.dismissButton}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </Pressable>
        ) : null}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  headline: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    color: '#111827',
  },
  summary: {
    fontSize: 13,
    lineHeight: 19,
    color: '#374151',
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
});
