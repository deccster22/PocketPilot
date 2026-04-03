import type { InsightsEventKind } from '@/services/insights/types';

export function formatInsightsEventKind(eventKind: InsightsEventKind): string {
  switch (eventKind) {
    case 'ALIGNMENT':
      return 'Alignment';
    case 'VOLATILITY':
      return 'Volatility';
    case 'STATE_CHANGE':
      return 'State change';
    case 'CONTEXT':
      return 'Context';
    default:
      return 'History';
  }
}

export function formatInsightsTimestamp(timestamp: string | null): string | null {
  if (!timestamp || timestamp.length < 16) {
    return timestamp;
  }

  return `${timestamp.slice(0, 10)} ${timestamp.slice(11, 16)} UTC`;
}
