import { StyleSheet, Text, View } from 'react-native';

import type { DebugObservatoryPayload } from '@/services/debug/debugObservatoryService';

type DebugObservatoryPanelProps = {
  payload: DebugObservatoryPayload;
};

function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function Section(props: { title: string; content: unknown }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{props.title}</Text>
      <Text style={styles.jsonBlock}>{prettyJson(props.content)}</Text>
    </View>
  );
}

export function DebugObservatoryPanel({ payload }: DebugObservatoryPanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Debug Observatory</Text>
      <Text style={styles.metaLine}>Timestamp: {payload.timestampMs}</Text>
      <Text style={styles.metaLine}>Symbols: {payload.symbols.join(', ')}</Text>

      <Section title="Runtime Diagnostics" content={payload.runtimeDiagnostics} />
      <Section title="Quote Router Raw" content={payload.quoteResult.meta} />
      <Section title="Quotes" content={payload.quoteResult.quotes} />
      <Section title="Deltas" content={payload.deltas ?? {}} />
      <Section title="Strategy Signals" content={payload.strategySignals ?? []} />
      <Section title="Snapshot Output" content={payload.snapshot ?? null} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  metaLine: {
    fontSize: 12,
    color: '#4b5563',
  },
  section: {
    gap: 6,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  jsonBlock: {
    fontSize: 11,
    color: '#111827',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 8,
    fontFamily: 'Courier',
  },
});
