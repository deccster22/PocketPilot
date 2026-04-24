import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { StrategyPreviewCardViewData } from '@/app/screens/strategyNavigatorScreenView';

export function StrategyPreviewCard(props: {
  preview: StrategyPreviewCardViewData;
  onOpenKnowledgeTopic?: (topicId: string) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Prepared walkthrough</Text>
        <Text style={styles.title}>{props.preview.strategyTitle}</Text>
        <View style={styles.scenarioBadge}>
          <Text style={styles.scenarioBadgeText}>{props.preview.scenarioTitle}</Text>
        </View>
        <Text style={styles.summary}>{props.preview.scenarioSummary}</Text>
      </View>

      <View style={styles.focusSection}>
        <Text style={styles.sectionLabel}>{props.preview.focus.label}</Text>
        <Text style={styles.focusHeadline}>{props.preview.focus.headline}</Text>
      </View>

      <View style={styles.mainSectionGroup}>
        {props.preview.mainSections.map((section) => (
          <View key={section.sectionId} style={styles.mainSectionCard}>
            <Text style={styles.sectionLabel}>{section.label}</Text>
            {section.body ? <Text style={styles.body}>{section.body}</Text> : null}
            {section.items.map((item, index) => (
              <Text key={`${section.sectionId}-item-${index}`} style={styles.listItem}>
                - {item}
              </Text>
            ))}
          </View>
        ))}
      </View>

      {props.preview.supportingSections.length > 0 ? (
        <View style={styles.supportingGroup}>
          <Text style={styles.supportingGroupLabel}>Supporting context</Text>
          {props.preview.supportingSections.map((section) => (
            <View key={section.sectionId} style={styles.supportingSection}>
              <Text style={styles.supportingSectionLabel}>{section.label}</Text>
              <Text style={styles.supportingTitle}>{section.title}</Text>
              <Text style={styles.body}>{section.summary}</Text>
              {section.bullets.map((item, index) => (
                <Text key={`${section.sectionId}-bullet-${index}`} style={styles.listItem}>
                  - {item}
                </Text>
              ))}
            </View>
          ))}
        </View>
      ) : null}

      {props.preview.knowledgeSection ? (
        <View style={styles.knowledgeSection}>
          <Text style={styles.supportingGroupLabel}>{props.preview.knowledgeSection.title}</Text>
          <Text style={styles.optionalText}>{props.preview.knowledgeSection.summary}</Text>
          {props.preview.knowledgeSection.items.map((item) => (
            <Pressable
              key={item.topicId}
              accessibilityRole="button"
              disabled={!props.onOpenKnowledgeTopic}
              onPress={() => props.onOpenKnowledgeTopic?.(item.topicId)}
              style={styles.knowledgeItem}
            >
              <Text style={styles.knowledgeTitle}>{item.title}</Text>
              <Text style={styles.knowledgeReason}>{item.reason}</Text>
              <Text style={styles.knowledgeLink}>Open topic</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    borderWidth: 1,
    borderColor: '#d5dee5',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scenarioBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#cce5df',
    borderRadius: 999,
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scenarioBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f766e',
  },
  summary: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
  focusSection: {
    gap: 8,
    borderWidth: 1,
    borderColor: '#dbe7ee',
    borderRadius: 14,
    backgroundColor: '#f8fbfc',
    padding: 14,
  },
  focusHeadline: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    color: '#0f172a',
  },
  mainSectionGroup: {
    gap: 10,
  },
  mainSectionCard: {
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 12,
  },
  supportingGroup: {
    gap: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    padding: 12,
  },
  supportingGroupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
  },
  supportingSection: {
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f2937',
    textTransform: 'uppercase',
  },
  supportingSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  supportingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
    color: '#334155',
  },
  listItem: {
    fontSize: 13,
    lineHeight: 19,
    color: '#334155',
  },
  knowledgeSection: {
    gap: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    padding: 12,
  },
  optionalText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
  knowledgeItem: {
    gap: 4,
    borderWidth: 1,
    borderColor: '#dbe4ea',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 12,
  },
  knowledgeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  knowledgeReason: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
  knowledgeLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f766e',
  },
});
