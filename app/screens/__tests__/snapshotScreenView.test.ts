import { createSnapshotScreenViewData } from '@/app/screens/snapshotScreenView';
import type { SnapshotVM } from '@/services/snapshot/snapshotService';

describe('createSnapshotScreenViewData', () => {
  it('uses the SnapshotModel path instead of legacy bridge fields', () => {
    const snapshot = {
      model: {
        profile: 'ADVANCED',
        core: {
          currentState: {
            label: 'Current State',
            value: 'Up',
            trendDirection: 'UP',
          },
          change24h: {
            label: 'Last 24h Change',
            value: 0.12,
          },
          strategyStatus: {
            label: 'Strategy Status',
            value: 'Aligned',
          },
        },
        secondary: {
          bundleName: 'Model Bundle',
          portfolioValue: 321.12,
        },
      },
      bundleName: 'Legacy Bundle',
      portfolioValue: 999,
      change24h: -0.5,
      strategyAlignment: 'Needs review',
      scan: {} as SnapshotVM['scan'],
      signals: [],
      marketEvents: [],
      eventStream: { accountId: 'acct-1', timestamp: 1, events: [] },
      orientationContext: {
        currentState: {},
        historyContext: {
          eventsSinceLastViewed: [],
          sinceLastChecked: null,
        },
      },
    } as SnapshotVM;

    expect(createSnapshotScreenViewData(snapshot)).toEqual({
      currentStateLabel: 'Current State',
      currentStateValue: 'Up',
      change24hLabel: 'Last 24h Change',
      change24hValue: '12.00%',
      strategyStatusLabel: 'Strategy Status',
      strategyStatusValue: 'Aligned',
      bundleName: 'Model Bundle',
      portfolioValueText: '321.12',
    });
  });

  it('returns null when the prepared model is unavailable', () => {
    expect(createSnapshotScreenViewData(null)).toBeNull();
  });

  it('keeps the canonical core visible for beginner snapshots even without secondary context', () => {
    const snapshot = {
      model: {
        profile: 'BEGINNER',
        core: {
          currentState: {
            label: 'Current State',
            value: 'Flat',
            trendDirection: 'FLAT',
          },
          change24h: {
            label: 'Last 24h Change',
            value: 0,
          },
          strategyStatus: {
            label: 'Strategy Status',
            value: 'Aligned',
          },
        },
      },
      bundleName: '',
      portfolioValue: 0,
      change24h: 0,
      strategyAlignment: 'Aligned',
      scan: {} as SnapshotVM['scan'],
      signals: [],
      marketEvents: [],
      eventStream: { accountId: 'acct-1', timestamp: 1, events: [] },
      orientationContext: {
        currentState: {},
        historyContext: {
          eventsSinceLastViewed: [],
          sinceLastChecked: null,
        },
      },
    } as SnapshotVM;

    expect(createSnapshotScreenViewData(snapshot)).toEqual({
      currentStateLabel: 'Current State',
      currentStateValue: 'Flat',
      change24hLabel: 'Last 24h Change',
      change24hValue: '0.00%',
      strategyStatusLabel: 'Strategy Status',
      strategyStatusValue: 'Aligned',
      bundleName: undefined,
      portfolioValueText: undefined,
    });
  });
});
