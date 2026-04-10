import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProfileSelector } from '@/app/components/ProfileSelector';
import {
  createInsightsExportScreenViewData,
  type ExportOptionViewData,
  type ExportPayloadSummaryItemViewData,
  type ExportPeriodOptionViewData,
} from '@/app/screens/insightsExportScreenView';
import type { UserProfile } from '@/core/profile/types';
import type {
  ExportFormat,
  ExportOptionsVM,
  PreparedExportRequestVM,
  ReflectionPeriod,
} from '@/services/insights/types';

function ExportPeriodButton(params: {
  option: ExportPeriodOptionViewData;
  onPress: (period: ReflectionPeriod) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => params.onPress(params.option.id)}
      style={[styles.periodOption, params.option.isSelected ? styles.periodOptionSelected : null]}
    >
      <Text
        style={[
          styles.periodOptionText,
          params.option.isSelected ? styles.periodOptionTextSelected : null,
        ]}
      >
        {params.option.label}
      </Text>
    </Pressable>
  );
}

function ExportOptionCard(params: {
  option: ExportOptionViewData;
  onPress: (format: ExportFormat) => void;
}) {
  const isDisabled = !params.option.isAvailable;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={() => params.onPress(params.option.format)}
      style={[
        styles.optionCard,
        params.option.isSelected ? styles.optionCardSelected : null,
        isDisabled ? styles.optionCardDisabled : null,
      ]}
    >
      <Text style={styles.optionLabel}>{params.option.label}</Text>
      <Text style={styles.optionDescription}>{params.option.description}</Text>
      {params.option.availabilityText ? (
        <Text style={isDisabled ? styles.optionUnavailableText : styles.optionAvailableText}>
          {params.option.availabilityText}
        </Text>
      ) : null}
    </Pressable>
  );
}

function ExportPayloadSummaryRow(params: {
  item: ExportPayloadSummaryItemViewData;
}) {
  return (
    <View style={styles.payloadRow}>
      <Text style={styles.payloadLabel}>{params.item.label}</Text>
      <Text style={styles.payloadValue}>{params.item.value}</Text>
    </View>
  );
}

export function InsightsExportScreen(params: {
  exportOptionsVM: ExportOptionsVM | null;
  preparedExportRequestVM: PreparedExportRequestVM | null;
  selectedProfile: UserProfile;
  selectedPeriod: ReflectionPeriod;
  selectedFormat: ExportFormat | null;
  onSelectProfile: (profile: UserProfile) => void;
  onSelectPeriod: (period: ReflectionPeriod) => void;
  onSelectFormat: (format: ExportFormat) => void;
  onBack: () => void;
}) {
  const screenView = createInsightsExportScreenViewData(
    params.exportOptionsVM,
    params.preparedExportRequestVM,
    {
      selectedProfile: params.selectedProfile,
      selectedPeriod: params.selectedPeriod,
      selectedFormat: params.selectedFormat,
    },
  );

  if (!screenView) {
    return null;
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

        <View style={styles.profileCard}>
          <Text style={styles.profileLabel}>{screenView.profileLabel}</Text>
          <ProfileSelector value={params.selectedProfile} onChange={params.onSelectProfile} />
        </View>

        <View style={styles.periodOptionsRow}>
          {screenView.periodOptions.map((option) => (
            <ExportPeriodButton key={option.id} option={option} onPress={params.onSelectPeriod} />
          ))}
        </View>

        {screenView.availabilityMessage ? (
          <View style={styles.unavailableCard}>
            <Text style={styles.unavailableText}>{screenView.availabilityMessage}</Text>
          </View>
        ) : null}

        {screenView.options.map((option) => (
          <ExportOptionCard key={option.format} option={option} onPress={params.onSelectFormat} />
        ))}

        {screenView.requestAvailabilityMessage && !screenView.requestTitle ? (
          <View style={styles.unavailableCard}>
            <Text style={styles.unavailableText}>{screenView.requestAvailabilityMessage}</Text>
          </View>
        ) : null}

        {screenView.requestTitle ? (
          <View style={styles.previewCard}>
            <Text style={styles.previewEyebrow}>Prepared preview</Text>
            <Text style={styles.previewTitle}>{screenView.requestTitle}</Text>
            {screenView.coveredRangeLabel ? (
              <Text style={styles.previewMeta}>{screenView.coveredRangeLabel}</Text>
            ) : null}
            {screenView.timezoneLabel ? (
              <Text style={styles.previewMeta}>Timezone: {screenView.timezoneLabel}</Text>
            ) : null}
            {screenView.payloadSummary.map((item) => (
              <ExportPayloadSummaryRow key={`${item.label}:${item.value}`} item={item} />
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
  profileCard: {
    gap: 10,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 14,
  },
  profileLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  periodOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  periodOption: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  periodOptionSelected: {
    borderColor: '#0f766e',
    backgroundColor: '#ecfeff',
  },
  periodOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  periodOptionTextSelected: {
    color: '#115e59',
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
  optionCard: {
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    padding: 14,
  },
  optionCardSelected: {
    borderColor: '#0f766e',
    backgroundColor: '#f0fdfa',
  },
  optionCardDisabled: {
    opacity: 0.72,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#374151',
  },
  optionAvailableText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#115e59',
  },
  optionUnavailableText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748b',
  },
  previewCard: {
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    padding: 14,
  },
  previewEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f766e',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  previewMeta: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748b',
  },
  payloadRow: {
    gap: 4,
  },
  payloadLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  payloadValue: {
    fontSize: 13,
    lineHeight: 19,
    color: '#374151',
  },
});
