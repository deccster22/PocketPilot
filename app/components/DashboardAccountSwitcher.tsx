import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DashboardScreenAccountContextViewData } from '@/app/screens/dashboardScreenView';

type VisibleDashboardAccountContextViewData = Extract<
  DashboardScreenAccountContextViewData,
  { visible: true }
>;

type DashboardAccountSwitcherProps = {
  accountContext: VisibleDashboardAccountContextViewData;
  expanded: boolean;
  busy?: boolean;
  onToggleExpanded: () => void;
  onSwitchAccount: (accountId: string) => void;
  onSetPrimaryAccount: (accountId: string) => void;
};

export function DashboardAccountSwitcher(props: DashboardAccountSwitcherProps) {
  return (
    <View style={styles.noteCard}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.noteTitle}>{props.accountContext.title}</Text>
          <Text style={styles.noteSummary}>{props.accountContext.summary}</Text>
        </View>
        {props.accountContext.switcher.visible ? (
          <Pressable
            accessibilityRole="button"
            disabled={props.busy}
            onPress={props.onToggleExpanded}
            style={[styles.toggleButton, props.busy && styles.buttonDisabled]}
          >
            <Text style={styles.toggleButtonText}>{props.expanded ? 'Hide' : 'Switch'}</Text>
          </Pressable>
        ) : null}
      </View>
      {props.accountContext.switcher.visible && props.expanded ? (
        <View style={styles.switcherSection}>
          <Text style={styles.switcherTitle}>{props.accountContext.switcher.title}</Text>
          <Text style={styles.switcherSummary}>{props.accountContext.switcher.summary}</Text>
          {props.accountContext.switcher.options.map((option) => (
            <View key={option.accountId} style={styles.optionCard}>
              <View style={styles.optionHeader}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <View style={styles.badgeRow}>
                  {option.isSelected ? (
                    <Text style={[styles.badge, styles.selectedBadge]}>Current</Text>
                  ) : null}
                  {option.isPrimary ? <Text style={styles.badge}>Primary</Text> : null}
                </View>
              </View>
              {option.summary ? <Text style={styles.optionSummary}>{option.summary}</Text> : null}
              <View style={styles.actionRow}>
                {!option.isSelected ? (
                  <Pressable
                    accessibilityRole="button"
                    disabled={props.busy}
                    onPress={() => props.onSwitchAccount(option.accountId)}
                    style={[styles.actionButton, props.busy && styles.buttonDisabled]}
                  >
                    <Text style={styles.actionButtonText}>Use this account</Text>
                  </Pressable>
                ) : null}
                {!option.isPrimary ? (
                  <Pressable
                    accessibilityRole="button"
                    disabled={props.busy}
                    onPress={() => props.onSetPrimaryAccount(option.accountId)}
                    style={[styles.secondaryActionButton, props.busy && styles.buttonDisabled]}
                  >
                    <Text style={styles.secondaryActionButtonText}>Make primary</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  noteCard: {
    gap: 10,
    borderWidth: 1,
    borderColor: '#dbe4ea',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 6,
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
  toggleButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  switcherSection: {
    gap: 10,
    paddingTop: 4,
  },
  switcherTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  switcherSummary: {
    fontSize: 12,
    color: '#6b7280',
  },
  optionCard: {
    gap: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 12,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  optionSummary: {
    fontSize: 12,
    color: '#4b5563',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    color: '#334155',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectedBadge: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    borderRadius: 999,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d4ed8',
  },
  secondaryActionButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryActionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
