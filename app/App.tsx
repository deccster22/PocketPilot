import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { DashboardScreen } from '@/app/screens/DashboardScreen';
import { InsightsScreen } from '@/app/screens/InsightsScreen';
import { KnowledgeLibraryScreen } from '@/app/screens/KnowledgeLibraryScreen';
import { StrategyNavigatorScreen } from '@/app/screens/StrategyNavigatorScreen';
import { TradeHubScreen } from '@/app/screens/TradeHubScreen';

type AppTab =
  | 'DASHBOARD'
  | 'STRATEGY_NAVIGATOR'
  | 'TRADE_HUB'
  | 'INSIGHTS'
  | 'KNOWLEDGE_LIBRARY';

const APP_TABS: ReadonlyArray<{ id: AppTab; label: string }> = [
  {
    id: 'DASHBOARD',
    label: 'Dashboard',
  },
  {
    id: 'STRATEGY_NAVIGATOR',
    label: 'Preview',
  },
  {
    id: 'TRADE_HUB',
    label: 'Trade Hub',
  },
  {
    id: 'INSIGHTS',
    label: 'Insights',
  },
  {
    id: 'KNOWLEDGE_LIBRARY',
    label: 'Knowledge',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('DASHBOARD');

  return (
    <View style={styles.appShell}>
      <View style={styles.screenContainer}>
        {activeTab === 'DASHBOARD' ? (
          <DashboardScreen />
        ) : activeTab === 'STRATEGY_NAVIGATOR' ? (
          <StrategyNavigatorScreen />
        ) : activeTab === 'TRADE_HUB' ? (
          <TradeHubScreen />
        ) : activeTab === 'INSIGHTS' ? (
          <InsightsScreen />
        ) : (
          <KnowledgeLibraryScreen />
        )}
      </View>
      <View style={styles.tabBar}>
        {APP_TABS.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{
                selected: isActive,
              }}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tabButton, isActive ? styles.activeTabButton : null]}
            >
              <Text style={[styles.tabText, isActive ? styles.activeTabText : null]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 12,
  },
  activeTabButton: {
    borderColor: '#1d4ed8',
    backgroundColor: '#eff6ff',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  activeTabText: {
    color: '#1d4ed8',
  },
});
