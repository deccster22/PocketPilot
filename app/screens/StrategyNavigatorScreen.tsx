import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { KnowledgeTopicScreen } from '@/app/screens/KnowledgeTopicScreen';
import { StrategyPreviewCard } from '@/app/components/StrategyPreviewCard';
import { createStrategyNavigatorScreenViewData } from '@/app/screens/strategyNavigatorScreenView';
import { fetchKnowledgeTopicDetailVM } from '@/services/knowledge/fetchKnowledgeTopicDetailVM';
import { fetchStrategyNavigatorVM } from '@/services/strategyNavigator/fetchStrategyNavigatorVM';
import type { StrategyPreviewScenarioId } from '@/services/strategyNavigator/types';

type StrategyNavigatorRoute = 'HOME' | 'KNOWLEDGE_TOPIC';

type StrategySelectionButtonProps = {
  title: string;
  summary: string;
  metaText: string;
  selected: boolean;
  onPress(): void;
};

function StrategySelectionButton(props: StrategySelectionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.onPress}
      style={[styles.selectorCard, props.selected ? styles.selectorCardSelected : null]}
    >
      <Text style={[styles.selectorMeta, props.selected ? styles.selectorMetaSelected : null]}>
        {props.metaText}
      </Text>
      <Text style={[styles.selectorTitle, props.selected ? styles.selectorTitleSelected : null]}>
        {props.title}
      </Text>
      <Text
        style={[styles.selectorSummary, props.selected ? styles.selectorSummarySelected : null]}
      >
        {props.summary}
      </Text>
    </Pressable>
  );
}

type ScenarioSelectionButtonProps = {
  title: string;
  summary: string;
  selected: boolean;
  onPress(): void;
};

function ScenarioSelectionButton(props: ScenarioSelectionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.onPress}
      style={[styles.scenarioCard, props.selected ? styles.scenarioCardSelected : null]}
    >
      <Text style={[styles.scenarioTitle, props.selected ? styles.scenarioTitleSelected : null]}>
        {props.title}
      </Text>
      <Text
        style={[styles.scenarioSummary, props.selected ? styles.scenarioSummarySelected : null]}
      >
        {props.summary}
      </Text>
    </Pressable>
  );
}

export function StrategyNavigatorScreen() {
  const [route, setRoute] = useState<StrategyNavigatorRoute>('HOME');
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] =
    useState<StrategyPreviewScenarioId>('DIP_VOLATILITY');
  const [selectedKnowledgeTopicId, setSelectedKnowledgeTopicId] = useState<string | null>(null);

  const vm = useMemo(
    () =>
      fetchStrategyNavigatorVM({
        surface: 'STRATEGY_NAVIGATOR',
        selectedStrategyId,
        selectedScenarioId,
      }),
    [selectedScenarioId, selectedStrategyId],
  );
  const screenView = useMemo(() => createStrategyNavigatorScreenViewData(vm), [vm]);
  const knowledgeTopicVM = useMemo(
    () =>
      fetchKnowledgeTopicDetailVM({
        surface: 'STRATEGY_PREVIEW',
        topicId: selectedKnowledgeTopicId,
      }),
    [selectedKnowledgeTopicId],
  );

  function handleOpenKnowledgeTopic(topicId: string) {
    setSelectedKnowledgeTopicId(topicId);
    setRoute('KNOWLEDGE_TOPIC');
  }

  if (!screenView) {
    return null;
  }

  if (route === 'KNOWLEDGE_TOPIC') {
    return (
      <KnowledgeTopicScreen
        topicVM={knowledgeTopicVM}
        onBack={() => setRoute('HOME')}
        onOpenTopic={handleOpenKnowledgeTopic}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.header}>{screenView.title}</Text>
          <Text style={styles.summary}>{screenView.summary}</Text>
          <Text style={styles.guidance}>{screenView.guidanceText}</Text>
          {screenView.generatedAtText ? (
            <Text style={styles.generatedAt}>Prepared {screenView.generatedAtText}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose a strategy</Text>
          <Text style={styles.sectionSummary}>
            Pick one lens at a time so the contrast stays calm and easy to read.
          </Text>
          {screenView.strategyOptions.map((strategy) => (
            <StrategySelectionButton
              key={strategy.strategyId}
              metaText={strategy.archetypeText}
              onPress={() => setSelectedStrategyId(strategy.strategyId)}
              selected={strategy.selected}
              summary={strategy.summary}
              title={strategy.title}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose a scenario</Text>
          <Text style={styles.sectionSummary}>
            These are finite simulated backdrops, not live feeds or forecasts.
          </Text>
          {screenView.scenarioOptions.map((scenario) => (
            <ScenarioSelectionButton
              key={scenario.scenarioId}
              onPress={() => setSelectedScenarioId(scenario.scenarioId)}
              selected={scenario.selected}
              summary={scenario.summary}
              title={scenario.title}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          {screenView.preview ? (
            <StrategyPreviewCard
              onOpenKnowledgeTopic={handleOpenKnowledgeTopic}
              preview={screenView.preview}
            />
          ) : (
            <View style={styles.unavailableCard}>
              <Text style={styles.unavailableText}>
                {screenView.availabilityMessage ?? 'Strategy Preview is not available right now.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7faf8',
  },
  container: {
    padding: 16,
    gap: 20,
  },
  hero: {
    gap: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  summary: {
    fontSize: 14,
    lineHeight: 21,
    color: '#475569',
  },
  guidance: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
  },
  generatedAt: {
    fontSize: 12,
    color: '#64748b',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSummary: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
  },
  selectorCard: {
    gap: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    backgroundColor: '#ffffff',
    padding: 14,
  },
  selectorCardSelected: {
    borderColor: '#0f766e',
    backgroundColor: '#f0fdfa',
  },
  selectorMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  selectorMetaSelected: {
    color: '#0f766e',
  },
  selectorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  selectorTitleSelected: {
    color: '#134e4a',
  },
  selectorSummary: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
  selectorSummarySelected: {
    color: '#115e59',
  },
  scenarioCard: {
    gap: 4,
    borderWidth: 1,
    borderColor: '#d6d3d1',
    borderRadius: 14,
    backgroundColor: '#ffffff',
    padding: 14,
  },
  scenarioCardSelected: {
    borderColor: '#9a3412',
    backgroundColor: '#fff7ed',
  },
  scenarioTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  scenarioTitleSelected: {
    color: '#9a3412',
  },
  scenarioSummary: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
  scenarioSummarySelected: {
    color: '#9a3412',
  },
  unavailableCard: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    backgroundColor: '#ffffff',
    padding: 14,
  },
  unavailableText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
  },
});
