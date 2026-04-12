import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DashboardAccountSwitcher } from '@/app/components/DashboardAccountSwitcher';
import { DashboardAggregatePortfolioCard } from '@/app/components/DashboardAggregatePortfolioCard';
import { ContextualKnowledgeCard } from '@/app/components/ContextualKnowledgeCard';
import { ExplanationCard } from '@/app/components/ExplanationCard';
import { MessageRationaleNote } from '@/app/components/MessageRationaleNote';
import { ProfileSelector } from '@/app/components/ProfileSelector';
import { KnowledgeTopicScreen } from '@/app/screens/KnowledgeTopicScreen';
import {
  createDashboardScreenViewData,
  refreshDashboardScreenSurface,
} from '@/app/screens/dashboardScreenView';
import { DEFAULT_USER_PROFILE, type UserProfile } from '@/app/state/profileState';
import { setPrimaryAccount } from '@/services/accounts/setPrimaryAccount';
import { switchSelectedAccount } from '@/services/accounts/switchSelectedAccount';
import type { DashboardSurfaceVM } from '@/services/dashboard/dashboardSurfaceService';
import { fetchKnowledgeTopicDetailVM } from '@/services/knowledge/fetchKnowledgeTopicDetailVM';
import type { MessagePolicyLane } from '@/services/messages/types';
import type { ForegroundScanResult } from '@/services/types/scan';

function DashboardZone(props: {
  title: string;
  items: Array<{
    title: string;
    subtitle: string;
    certaintyText: string;
  }>;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{props.title}</Text>
      {props.items.length === 0 ? <Text style={styles.emptyState}>No items prepared.</Text> : null}
      {props.items.map((item) => (
        <View key={`${props.title}:${item.title}:${item.subtitle}`} style={styles.card}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          <Text style={styles.cardMeta}>{item.certaintyText}</Text>
        </View>
      ))}
    </View>
  );
}

export function DashboardScreen() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [surfaceModel, setSurfaceModel] = useState<DashboardSurfaceVM | null>(null);
  const [messagePolicyLane, setMessagePolicyLane] = useState<MessagePolicyLane | null>(null);
  const [selectedKnowledgeTopicId, setSelectedKnowledgeTopicId] = useState<string | null>(null);
  const [baselineScan, setBaselineScan] = useState<ForegroundScanResult>();
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [accountSwitcherExpanded, setAccountSwitcherExpanded] = useState(false);
  const [accountActionPending, setAccountActionPending] = useState(false);

  useEffect(() => {
    let isMounted = true;

    refreshDashboardScreenSurface({ profile, baselineScan })
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setSurfaceModel(result.surface);
        setMessagePolicyLane(result.messagePolicyLane);
        setBaselineScan((currentBaseline) => currentBaseline ?? result.nextBaselineScan);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setSurfaceModel(null);
        setMessagePolicyLane(null);
      });

    return () => {
      isMounted = false;
    };
  }, [profile, baselineScan, refreshNonce]);

  const screenView = useMemo(
    () => createDashboardScreenViewData(surfaceModel, messagePolicyLane),
    [messagePolicyLane, surfaceModel],
  );
  const knowledgeTopicVM = useMemo(
    () =>
      fetchKnowledgeTopicDetailVM({
        surface: 'KNOWLEDGE_LIBRARY',
        topicId: selectedKnowledgeTopicId,
      }),
    [selectedKnowledgeTopicId],
  );

  if (selectedKnowledgeTopicId) {
    return (
      <KnowledgeTopicScreen
        topicVM={knowledgeTopicVM}
        onBack={() => setSelectedKnowledgeTopicId(null)}
        onOpenTopic={setSelectedKnowledgeTopicId}
      />
    );
  }

  async function handleSwitchAccount(accountId: string) {
    if (surfaceModel?.accountContext.status !== 'AVAILABLE') {
      return;
    }

    if (surfaceModel.accountContext.switching?.status !== 'AVAILABLE') {
      return;
    }

    setAccountActionPending(true);

    try {
      const result = await switchSelectedAccount({
        options: surfaceModel.accountContext.switching.options,
        accountId,
      });

      if (result.status === 'UPDATED') {
        setBaselineScan(undefined);
        setRefreshNonce((value) => value + 1);
      }
    } finally {
      setAccountActionPending(false);
    }
  }

  async function handleSetPrimaryAccount(accountId: string) {
    if (surfaceModel?.accountContext.status !== 'AVAILABLE') {
      return;
    }

    if (surfaceModel.accountContext.switching?.status !== 'AVAILABLE') {
      return;
    }

    setAccountActionPending(true);

    try {
      const result = await setPrimaryAccount({
        options: surfaceModel.accountContext.switching.options,
        accountId,
      });

      if (result.status === 'UPDATED') {
        setRefreshNonce((value) => value + 1);
      }
    } finally {
      setAccountActionPending(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>PocketPilot</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dashboard</Text>
          <Text style={styles.label}>Profile</Text>
          <ProfileSelector value={profile} onChange={setProfile} />
          <Text style={styles.label}>Prepared surface for {screenView?.profileLabel ?? profile}</Text>
        </View>
        {screenView?.accountContext.visible ? (
          <DashboardAccountSwitcher
            accountContext={screenView.accountContext}
            expanded={accountSwitcherExpanded}
            busy={accountActionPending}
            onToggleExpanded={() => setAccountSwitcherExpanded((value) => !value)}
            onSwitchAccount={handleSwitchAccount}
            onSetPrimaryAccount={handleSetPrimaryAccount}
          />
        ) : null}
        {screenView?.message.visible ? (
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>{screenView.message.title}</Text>
            <Text style={styles.noteSummary}>{screenView.message.summary}</Text>
            <MessageRationaleNote rationale={screenView.message.rationale} />
          </View>
        ) : null}
        {screenView?.contextualKnowledge.visible ? (
          <View style={styles.section}>
            <ContextualKnowledgeCard
              contextualKnowledge={screenView.contextualKnowledge}
              onOpenTopic={setSelectedKnowledgeTopicId}
            />
          </View>
        ) : null}
        <DashboardZone
          title={screenView?.primeZone.title ?? 'Prime Zone'}
          items={screenView?.primeZone.items ?? []}
        />
        {screenView?.explanation.visible ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Why</Text>
            <ExplanationCard explanation={screenView.explanation} />
          </View>
        ) : null}
        {screenView?.aggregatePortfolio.visible ? (
          <View style={styles.section}>
            <DashboardAggregatePortfolioCard
              aggregatePortfolio={screenView.aggregatePortfolio}
            />
          </View>
        ) : null}
        <DashboardZone
          title={screenView?.secondaryZone.title ?? 'Secondary Zone'}
          items={screenView?.secondaryZone.items ?? []}
        />
        <DashboardZone
          title={screenView?.deepZone.title ?? 'Deep Zone'}
          items={screenView?.deepZone.items ?? []}
        />
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
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  label: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  card: {
    gap: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#374151',
  },
  cardMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  noteCard: {
    gap: 6,
    borderWidth: 1,
    borderColor: '#dbe4ea',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    padding: 12,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  noteSummary: {
    fontSize: 13,
    color: '#4b5563',
  },
  emptyState: {
    fontSize: 13,
    color: '#6b7280',
  },
});
