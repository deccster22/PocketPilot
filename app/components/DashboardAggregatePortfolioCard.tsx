import { StyleSheet, Text, View } from 'react-native';

import type { DashboardScreenAggregatePortfolioViewData } from '@/app/screens/dashboardScreenView';

export function DashboardAggregatePortfolioCard(props: {
  aggregatePortfolio: DashboardScreenAggregatePortfolioViewData;
}) {
  if (!props.aggregatePortfolio.visible) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{props.aggregatePortfolio.title}</Text>
      <Text style={styles.summary}>{props.aggregatePortfolio.summary}</Text>
      {props.aggregatePortfolio.totalValueText ? (
        <Text style={styles.totalValue}>{props.aggregatePortfolio.totalValueText}</Text>
      ) : null}
      {props.aggregatePortfolio.assets.map((asset) => (
        <View key={asset.symbol} style={styles.assetRow}>
          <Text style={styles.assetSymbol}>{asset.symbol}</Text>
          <Text style={styles.assetSummary}>{asset.summary}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    borderWidth: 1,
    borderColor: '#dbe4ea',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  summary: {
    fontSize: 13,
    color: '#4b5563',
  },
  totalValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  assetRow: {
    gap: 2,
  },
  assetSymbol: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  assetSummary: {
    fontSize: 12,
    color: '#6b7280',
  },
});
