import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { KnowledgeCard } from '@/app/components/KnowledgeCard';
import { KnowledgeTopicScreen } from '@/app/screens/KnowledgeTopicScreen';
import { createKnowledgeLibraryScreenViewData } from '@/app/screens/knowledgeLibraryScreenView';
import { fetchKnowledgeLibraryVM } from '@/services/knowledge/fetchKnowledgeLibraryVM';
import { fetchKnowledgeTopicDetailVM } from '@/services/knowledge/fetchKnowledgeTopicDetailVM';

export function KnowledgeLibraryScreen() {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const libraryVM = fetchKnowledgeLibraryVM({
    surface: 'KNOWLEDGE_LIBRARY',
  });
  const topicVM = fetchKnowledgeTopicDetailVM({
    surface: 'KNOWLEDGE_LIBRARY',
    topicId: selectedTopicId,
  });
  const screenView = createKnowledgeLibraryScreenViewData(libraryVM);

  if (!screenView) {
    return null;
  }

  if (selectedTopicId) {
    return (
      <KnowledgeTopicScreen
        topicVM={topicVM}
        onBack={() => setSelectedTopicId(null)}
        onOpenTopic={setSelectedTopicId}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.header}>{screenView.title}</Text>
          <Text style={styles.summary}>{screenView.summary}</Text>
        </View>

        {screenView.availabilityMessage ? (
          <View style={styles.unavailableCard}>
            <Text style={styles.unavailableText}>{screenView.availabilityMessage}</Text>
          </View>
        ) : null}

        {screenView.sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => (
              <Pressable
                key={item.topicId}
                accessibilityRole="button"
                onPress={() => setSelectedTopicId(item.topicId)}
                style={styles.cardPressable}
              >
                <KnowledgeCard item={item} />
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    color: '#4b5563',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardPressable: {
    borderRadius: 12,
  },
  unavailableCard: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 14,
  },
  unavailableText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#4b5563',
  },
});
