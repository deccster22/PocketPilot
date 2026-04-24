import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { StrategyPreviewCardViewData } from '@/app/screens/strategyNavigatorScreenView';

const MAIN_SECTION_COLLAPSED_ITEM_COUNT = 1;
const SUPPORTING_SECTION_COLLAPSED_BULLET_COUNT = 1;
const KNOWLEDGE_SECTION_COLLAPSED_ITEM_COUNT = 1;
const AMBIGUITY_PREFIX = 'Ambiguity remains:';

function createCollapsedSupportingBullets(params: {
  section: StrategyPreviewCardViewData['supportingSections'][number];
}): ReadonlyArray<string> {
  const { section } = params;
  const primaryBullets = section.bullets.slice(0, SUPPORTING_SECTION_COLLAPSED_BULLET_COUNT);

  if (section.sectionId !== 'FIT_CONTRAST') {
    return primaryBullets;
  }

  const ambiguityBullet = section.bullets.find((bullet) =>
    bullet.startsWith(AMBIGUITY_PREFIX),
  );

  if (!ambiguityBullet || primaryBullets.includes(ambiguityBullet)) {
    return primaryBullets;
  }

  return [...primaryBullets, ambiguityBullet];
}

export function StrategyPreviewCard(props: {
  preview: StrategyPreviewCardViewData;
  onOpenKnowledgeTopic?: (topicId: string) => void;
}) {
  const [mainDetailExpanded, setMainDetailExpanded] = useState(false);
  const [supportingDetailExpanded, setSupportingDetailExpanded] = useState(false);
  const [knowledgeExpanded, setKnowledgeExpanded] = useState(false);

  const hasMoreMainDetail = props.preview.mainSections.some(
    (section) => section.items.length > MAIN_SECTION_COLLAPSED_ITEM_COUNT,
  );
  const hasMoreSupportingDetail = props.preview.supportingSections.some((section) => {
    const collapsedBullets = createCollapsedSupportingBullets({ section });
    return section.bullets.length > collapsedBullets.length;
  });
  const hasMoreKnowledgeDetail =
    props.preview.knowledgeSection !== null &&
    props.preview.knowledgeSection.items.length > KNOWLEDGE_SECTION_COLLAPSED_ITEM_COUNT;

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
            {section.body ? (
              <Text numberOfLines={mainDetailExpanded ? undefined : 3} style={styles.body}>
                {section.body}
              </Text>
            ) : null}
            {(mainDetailExpanded
              ? section.items
              : section.items.slice(0, MAIN_SECTION_COLLAPSED_ITEM_COUNT)
            ).map((item, index) => (
              <Text key={`${section.sectionId}-item-${index}`} style={styles.listItem}>
                - {item}
              </Text>
            ))}
          </View>
        ))}
        {hasMoreMainDetail ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setMainDetailExpanded((current) => !current)}
            style={styles.disclosureButton}
          >
            <Text style={styles.disclosureText}>
              {mainDetailExpanded ? 'Show less preview detail' : 'Show more preview detail'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {props.preview.supportingSections.length > 0 ? (
        <View style={styles.supportingGroup}>
          <Text style={styles.supportingGroupLabel}>Supporting context</Text>
          {props.preview.supportingSections.map((section) => (
            <View key={section.sectionId} style={styles.supportingSection}>
              <Text style={styles.supportingSectionLabel}>{section.label}</Text>
              <Text style={styles.supportingTitle}>{section.title}</Text>
              <Text numberOfLines={supportingDetailExpanded ? undefined : 3} style={styles.body}>
                {section.summary}
              </Text>
              {(supportingDetailExpanded
                ? section.bullets
                : createCollapsedSupportingBullets({ section })
              ).map((item, index) => (
                <Text key={`${section.sectionId}-bullet-${index}`} style={styles.listItem}>
                  - {item}
                </Text>
              ))}
            </View>
          ))}
          {hasMoreSupportingDetail ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setSupportingDetailExpanded((current) => !current)}
              style={styles.disclosureButton}
            >
              <Text style={styles.disclosureText}>
                {supportingDetailExpanded ? 'Show less context' : 'Show more context'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {props.preview.knowledgeSection ? (
        <View style={styles.knowledgeSection}>
          <Text style={styles.supportingGroupLabel}>{props.preview.knowledgeSection.title}</Text>
          <Text style={styles.optionalText}>{props.preview.knowledgeSection.summary}</Text>
          {(knowledgeExpanded
            ? props.preview.knowledgeSection.items
            : props.preview.knowledgeSection.items.slice(
                0,
                KNOWLEDGE_SECTION_COLLAPSED_ITEM_COUNT,
              )
          ).map((item) => (
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
          {hasMoreKnowledgeDetail ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setKnowledgeExpanded((current) => !current)}
              style={styles.disclosureButton}
            >
              <Text style={styles.disclosureText}>
                {knowledgeExpanded ? 'Show less reading' : 'Show more reading'}
              </Text>
            </Pressable>
          ) : null}
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
  disclosureButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 999,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  disclosureText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f766e',
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
