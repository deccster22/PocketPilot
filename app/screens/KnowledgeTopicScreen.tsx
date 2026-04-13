import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { KnowledgeTopicCard } from '@/app/components/KnowledgeTopicCard';
import { createKnowledgeTopicScreenViewData } from '@/app/screens/knowledgeTopicScreenView';
import type { KnowledgeTopicDetailVM } from '@/services/knowledge/types';

export function KnowledgeTopicScreen(params: {
  topicVM: KnowledgeTopicDetailVM | null;
  onBack: () => void;
  onOpenTopic: (topicId: string) => void;
}) {
  const screenView = createKnowledgeTopicScreenViewData(params.topicVM);

  if (!screenView) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable accessibilityRole="button" onPress={params.onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to Knowledge</Text>
        </Pressable>

        <View style={styles.hero}>
          {screenView.difficultyText ? (
            <Text style={styles.difficultyBadge}>{screenView.difficultyText}</Text>
          ) : null}
          <Text style={styles.header}>{screenView.title}</Text>
          <Text style={styles.summary}>{screenView.summary}</Text>
        </View>

        {screenView.contextFraming ? (
          <View style={styles.contextFramingCard}>
            <Text style={styles.contextFramingLabel}>Context</Text>
            <Text style={styles.contextFramingTitle}>{screenView.contextFraming.title}</Text>
            <Text style={styles.contextFramingSummary}>{screenView.contextFraming.summary}</Text>
            <Text style={styles.contextFramingMeta}>
              Origin: {screenView.contextFraming.originSurfaceText}
            </Text>
            {screenView.contextFraming.linkageReasonsText ? (
              <Text style={styles.contextFramingMeta}>
                Linkage: {screenView.contextFraming.linkageReasonsText}
              </Text>
            ) : null}
          </View>
        ) : null}

        {screenView.availabilityMessage ? (
          <View style={styles.unavailableCard}>
            <Text style={styles.unavailableText}>{screenView.availabilityMessage}</Text>
          </View>
        ) : null}

        {screenView.sections.map((section) => (
          <View key={section.heading} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.heading}</Text>
            {section.body.map((paragraph, index) => (
              <Text key={`${section.heading}:${index}`} style={styles.sectionBody}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}

        {screenView.relatedTopics.length > 0 ? (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>Related topics</Text>
            {screenView.relatedTopics.map((topic) => (
              <Pressable
                key={topic.topicId}
                accessibilityRole="button"
                onPress={() => params.onOpenTopic(topic.topicId)}
                style={styles.relatedPressable}
              >
                <KnowledgeTopicCard item={topic} />
              </Pressable>
            ))}
          </View>
        ) : null}
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
    gap: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  hero: {
    gap: 8,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#ecfeff',
    color: '#155e75',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    textTransform: 'uppercase',
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
  contextFramingCard: {
    gap: 8,
    borderWidth: 1,
    borderColor: '#dbe4ea',
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    padding: 14,
  },
  contextFramingLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  contextFramingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  contextFramingSummary: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
  contextFramingMeta: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748b',
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
  sectionCard: {
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbe4ee',
    backgroundColor: '#ffffff',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 21,
    color: '#334155',
  },
  relatedSection: {
    gap: 10,
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  relatedPressable: {
    borderRadius: 12,
  },
});
