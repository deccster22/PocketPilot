import { useEffect, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { createInsightsJournalScreenViewData } from '@/app/screens/insightsJournalScreenView';
import type {
  JournalEntrySaveResult,
  JournalEntryUpdateResult,
  JournalEntryVM,
} from '@/services/insights/types';

export function InsightsJournalScreen(params: {
  journalVM: JournalEntryVM | null;
  onSave: (body: string) => JournalEntrySaveResult;
  onUpdate: (entryId: string, body: string) => JournalEntryUpdateResult;
  onBack: () => void;
}) {
  const screenView = createInsightsJournalScreenViewData(params.journalVM);
  const [isEditing, setIsEditing] = useState(
    () =>
      params.journalVM?.availability.status === 'AVAILABLE' &&
      params.journalVM.availability.entry === null,
  );
  const [draftBody, setDraftBody] = useState(
    () =>
      params.journalVM?.availability.status === 'AVAILABLE'
        ? params.journalVM.availability.entry?.body ?? ''
        : '',
  );

  useEffect(() => {
    if (params.journalVM?.availability.status !== 'AVAILABLE') {
      setIsEditing(false);
      setDraftBody('');
      return;
    }

    setIsEditing(params.journalVM.availability.entry === null);
    setDraftBody(params.journalVM.availability.entry?.body ?? '');
  }, [params.journalVM]);

  if (!screenView) {
    return null;
  }

  const existingEntry =
    params.journalVM?.availability.status === 'AVAILABLE' ? params.journalVM.availability.entry : null;
  const canSubmit = draftBody.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit || params.journalVM?.availability.status !== 'AVAILABLE') {
      return;
    }

    if (params.journalVM.availability.entry) {
      const result = params.onUpdate(params.journalVM.availability.entry.entryId, draftBody);

      if (result.status === 'UPDATED') {
        setIsEditing(false);
      }

      return;
    }

    const result = params.onSave(draftBody);

    if (result.status === 'SAVED') {
      setIsEditing(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable accessibilityRole="button" onPress={params.onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to Insights</Text>
        </Pressable>

        <View style={styles.hero}>
          <Text style={styles.header}>{screenView.title}</Text>
          <Text style={styles.summary}>{screenView.summary}</Text>
        </View>

        {screenView.noteTitle ? (
          <View style={styles.contextCard}>
            <Text style={styles.contextTitle}>{screenView.noteTitle}</Text>
            {screenView.linkageLabel ? (
              <Text style={styles.contextMeta}>{screenView.linkageLabel}</Text>
            ) : null}
            {screenView.updatedAtLabel ? (
              <Text style={styles.contextMeta}>{screenView.updatedAtLabel}</Text>
            ) : null}
          </View>
        ) : null}

        {screenView.availabilityMessage ? (
          <View style={styles.unavailableCard}>
            <Text style={styles.unavailableText}>{screenView.availabilityMessage}</Text>
          </View>
        ) : null}

        {!screenView.availabilityMessage && !isEditing && screenView.body ? (
          <View style={styles.noteCard}>
            <Text style={styles.noteBody}>{screenView.body}</Text>
          </View>
        ) : null}

        {!screenView.availabilityMessage && !isEditing && screenView.emptyStateTitle ? (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateTitle}>{screenView.emptyStateTitle}</Text>
            {screenView.emptyStateSummary ? (
              <Text style={styles.emptyStateSummary}>{screenView.emptyStateSummary}</Text>
            ) : null}
          </View>
        ) : null}

        {!screenView.availabilityMessage && isEditing ? (
          <View style={styles.editorCard}>
            {screenView.editorTitle ? (
              <Text style={styles.editorTitle}>{screenView.editorTitle}</Text>
            ) : null}
            <TextInput
              accessibilityLabel="Journal note body"
              multiline
              onChangeText={setDraftBody}
              placeholder={screenView.editorPlaceholder ?? undefined}
              placeholderTextColor="#94a3b8"
              style={styles.editorInput}
              textAlignVertical="top"
              value={draftBody}
            />
            <View style={styles.editorActions}>
              <Pressable
                accessibilityRole="button"
                onPress={handleSubmit}
                style={[styles.primaryButton, !canSubmit ? styles.primaryButtonDisabled : null]}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    !canSubmit ? styles.primaryButtonTextDisabled : null,
                  ]}
                >
                  {screenView.submitActionLabel}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setDraftBody(existingEntry?.body ?? '');
                  setIsEditing(false);
                }}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>
                  {existingEntry ? 'Cancel' : 'Leave blank'}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {!screenView.availabilityMessage && !isEditing && screenView.primaryActionLabel ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsEditing(true)}
            style={styles.primaryActionButton}
          >
            <Text style={styles.primaryActionButtonText}>{screenView.primaryActionLabel}</Text>
          </Pressable>
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
  contextCard: {
    gap: 4,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 14,
  },
  contextTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  contextMeta: {
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
  noteCard: {
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 14,
  },
  noteBody: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1f2937',
  },
  emptyStateCard: {
    gap: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 14,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  emptyStateSummary: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
  },
  editorCard: {
    gap: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 14,
  },
  editorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  editorInput: {
    minHeight: 160,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#1f2937',
  },
  editorActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryButton: {
    borderRadius: 999,
    backgroundColor: '#0f766e',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  primaryButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f8fafc',
  },
  primaryButtonTextDisabled: {
    color: '#f8fafc',
  },
  secondaryButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  primaryActionButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#0f766e',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  primaryActionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f8fafc',
  },
});
