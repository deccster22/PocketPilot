import { StyleSheet, Text, View } from 'react-native';

export type ChangeListItem = {
  symbol: string;
  pct: number;
  estimated: boolean;
};

type ChangeListTileProps = {
  title: string;
  items: ChangeListItem[];
};

export function ChangeListTile({ title, items }: ChangeListTileProps) {
  return (
    <View style={styles.tile}>
      <Text style={styles.title}>{title}</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>No qualifying symbols.</Text>
      ) : (
        items.map((item) => (
          <View key={item.symbol} style={styles.row}>
            <Text style={styles.symbol}>{item.symbol}</Text>
            <Text style={styles.value}>
              {(item.pct * 100).toFixed(1)}%
              {item.estimated ? ' (est.)' : ''}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  symbol: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    color: '#111827',
    fontVariant: ['tabular-nums'],
  },
  empty: {
    fontSize: 13,
    color: '#6b7280',
  },
});
