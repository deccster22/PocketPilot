import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { InlineGlossaryText } from '@/app/components/InlineGlossaryText';
import type { DashboardScreenViewData } from '@/app/screens/dashboardScreenView';

type ExplanationCardViewData = Extract<DashboardScreenViewData['explanation'], { visible: true }>;

export function ExplanationCard(params: {
  explanation: ExplanationCardViewData;
  onOpenGlossaryTopic?: (params: { topicId: string; acknowledgementKey: string }) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setIsExpanded(false);
  }, [params.explanation.title, params.explanation.summary, params.explanation.confidenceNote]);

  const hasDetail = Boolean(params.explanation.detail);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Why</Text>
        <Text style={styles.title}>{params.explanation.title}</Text>
        <InlineGlossaryText
          text={params.explanation.summary}
          inlineGlossary={params.explanation.inlineGlossary}
          textStyle={styles.summary}
          onOpenTopic={params.onOpenGlossaryTopic}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{params.explanation.confidenceText}</Text>
        <Text style={styles.sectionDetail}>{params.explanation.confidenceNote}</Text>
      </View>

      {hasDetail ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setIsExpanded((current) => !current)}
          style={styles.toggle}
        >
          <Text style={styles.toggleText}>{isExpanded ? 'Less context' : 'More context'}</Text>
        </Pressable>
      ) : null}

      {isExpanded && params.explanation.detail ? (
        <>
          {params.explanation.detail.contextNote ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Context</Text>
              <Text style={styles.sectionDetail}>{params.explanation.detail.contextNote}</Text>
            </View>
          ) : null}

          {params.explanation.detail.lineage.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Lineage</Text>
              {params.explanation.detail.lineage.map((item) => (
                <View key={`${item.label}:${item.detail}`} style={styles.item}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemDetail}>{item.detail}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {params.explanation.detail.limitations.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Limitations</Text>
              {params.explanation.detail.limitations.map((item) => (
                <Text key={item} style={styles.limitation}>
                  - {item}
                </Text>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  header: {
    gap: 4,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  summary: {
    fontSize: 13,
    lineHeight: 19,
    color: '#374151',
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  sectionDetail: {
    fontSize: 13,
    lineHeight: 19,
    color: '#374151',
  },
  toggle: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  item: {
    gap: 2,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  itemDetail: {
    fontSize: 13,
    lineHeight: 19,
    color: '#374151',
  },
  limitation: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6b7280',
  },
});
