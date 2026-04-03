import type { EventType } from '@/core/types/marketEvent';
import type { OrientationContext } from '@/services/orientation/createOrientationContext';

import {
  formatAlignmentState,
  formatSubject,
  selectExplanationLineage,
  type ExplanationTarget,
} from './selectExplanationLineage';
import type { ExplanationAvailability, ExplanationConfidence } from './types';

function describeSummaryFocus(eventType: EventType, symbol?: string): string {
  const subject = formatSubject(symbol);

  switch (eventType) {
    case 'DATA_QUALITY':
      return `${subject} is in focus because data quality limits are still shaping the current read.`;
    case 'ESTIMATED_PRICE':
      return `${subject} is in focus because some of the current price context is still estimated.`;
    case 'MOMENTUM_BUILDING':
      return `${subject} is in focus because momentum has continued to build in the current read.`;
    case 'DIP_DETECTED':
      return `${subject} is in focus because a measured pullback is still part of the current read.`;
    default:
      return `${subject} is in focus because recent price movement is still shaping the current read.`;
  }
}

function createSummarySupportSentence(params: {
  alignmentState: string | null;
  supportingHistoryCount: number;
  hasEstimatedContext: boolean;
}): string | null {
  if (params.alignmentState && params.supportingHistoryCount > 0) {
    return `The current state still reads ${params.alignmentState}, and recent interpreted history since the last check continues to support that picture.`;
  }

  if (params.alignmentState && params.hasEstimatedContext) {
    return `The current state still reads ${params.alignmentState}, with part of the supporting price context still estimated.`;
  }

  if (params.alignmentState) {
    return `The current state still reads ${params.alignmentState}.`;
  }

  if (params.supportingHistoryCount > 0) {
    return params.supportingHistoryCount === 1
      ? 'One recent interpreted update since the last check still supports that picture.'
      : 'Recent interpreted history since the last check continues to support that picture.';
  }

  if (params.hasEstimatedContext) {
    return 'Part of the supporting price context is still estimated.';
  }

  return null;
}

function createContextNote(params: {
  alignmentState: string | null;
  supportingHistoryCount: number;
  hasEstimatedContext: boolean;
}): string | undefined {
  const parts: string[] = [];

  if (params.alignmentState === 'watchful') {
    parts.push('The current state remains watchful, so this stays active without reading as settled.');
  } else if (params.alignmentState === 'needs review') {
    parts.push(
      'The current state remains in needs-review territory, so this reads as cautionary context rather than a settled move.',
    );
  } else if (params.alignmentState === 'aligned' && params.supportingHistoryCount > 0) {
    parts.push('The current state still looks aligned with the prepared picture rather than standing on its own.');
  }

  if (params.hasEstimatedContext) {
    parts.push('Some supporting price context remains estimated, which keeps this read provisional.');
  } else if (params.supportingHistoryCount > 1) {
    parts.push(
      `${params.supportingHistoryCount} recent interpreted updates since the last check keep the same picture in view.`,
    );
  }

  if (parts.length === 0) {
    return undefined;
  }

  return parts.slice(0, 2).join(' ');
}

function createSummary(params: {
  target: ExplanationTarget;
  alignmentState: string | null;
  supportingHistoryCount: number;
  hasEstimatedContext: boolean;
}): string {
  const summaryParts = [describeSummaryFocus(params.target.eventType, params.target.symbol)];
  const supportSentence = createSummarySupportSentence({
    alignmentState: params.alignmentState,
    supportingHistoryCount: params.supportingHistoryCount,
    hasEstimatedContext: params.hasEstimatedContext,
  });

  if (supportSentence) {
    summaryParts.push(supportSentence);
  }

  return summaryParts.join(' ');
}

function resolveConfidence(params: {
  hasPrimaryEvent: boolean;
  hasStateContext: boolean;
  hasSupportingHistory: boolean;
  hasConfirmedContext: boolean;
  hasEstimatedContext: boolean;
}): ExplanationConfidence {
  if (
    !params.hasEstimatedContext &&
    params.hasPrimaryEvent &&
    params.hasStateContext &&
    params.hasSupportingHistory &&
    params.hasConfirmedContext
  ) {
    return 'HIGH';
  }

  if (
    (params.hasPrimaryEvent && params.hasStateContext) ||
    (params.hasPrimaryEvent && params.hasSupportingHistory) ||
    (params.hasStateContext && params.hasSupportingHistory)
  ) {
    return 'MODERATE';
  }

  return 'LOW';
}

function createConfidenceNote(params: {
  confidence: ExplanationConfidence;
  hasEstimatedContext: boolean;
  hasStateContext: boolean;
  hasSupportingHistory: boolean;
}): string {
  switch (params.confidence) {
    case 'HIGH':
      return 'Confidence is high because the latest interpreted move, the current state, and recent history support the same reading. It reflects evidence support, not a guaranteed outcome.';
    case 'MODERATE':
      if (params.hasEstimatedContext) {
        return 'Confidence is moderate because more than one prepared input supports this reading, but some supporting context remains estimated. It reflects evidence support, not a guaranteed outcome.';
      }

      if (params.hasStateContext && params.hasSupportingHistory) {
        return 'Confidence is moderate because both the current state and recent history support this reading. It reflects evidence support, not a guaranteed outcome.';
      }

      return 'Confidence is moderate because more than one prepared input supports this reading. It reflects evidence support, not a guaranteed outcome.';
    default:
      return 'Confidence is low because this reading rests on a narrow prepared picture right now. It reflects evidence support, not a guaranteed outcome.';
  }
}

function createLimitations(params: {
  hasEstimatedContext: boolean;
  hasSupportingHistory: boolean;
}): string[] {
  const limitations = ['This explanation reflects current interpreted conditions only.'];

  if (params.hasEstimatedContext) {
    limitations.push('Some supporting price context remains estimated.');
  } else if (!params.hasSupportingHistory) {
    limitations.push('Recent interpreted history is still light for this picture.');
  }

  return limitations.slice(0, 2);
}

export function createExplanationSummary(params: {
  surface: 'DASHBOARD_PRIME';
  target?: ExplanationTarget | null;
  currentEvent?: Parameters<typeof selectExplanationLineage>[0]['currentEvent'];
  orientationContext: Pick<OrientationContext, 'currentState' | 'historyContext'>;
}): ExplanationAvailability {
  if (params.surface !== 'DASHBOARD_PRIME') {
    return {
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_SURFACE',
    };
  }

  if (!params.target) {
    return {
      status: 'UNAVAILABLE',
      reason: 'NO_EXPLANATION_TARGET',
    };
  }

  const alignmentState =
    formatAlignmentState(params.target.alignmentState) ??
    formatAlignmentState(params.orientationContext.currentState.strategyAlignment);
  const effectiveCertainty =
    params.target.certainty ?? params.orientationContext.currentState.certainty ?? null;
  const lineage = selectExplanationLineage({
    target: params.target,
    currentEvent: params.currentEvent,
    orientationContext: params.orientationContext,
  });
  const hasEstimatedContext =
    effectiveCertainty === 'estimated' || lineage.hasEstimatedHistoryContext;

  if (lineage.items.length === 0) {
    return {
      status: 'UNAVAILABLE',
      reason: 'INSUFFICIENT_INTERPRETED_CONTEXT',
    };
  }

  const confidence = resolveConfidence({
    hasPrimaryEvent: Boolean(lineage.primaryEvent),
    hasStateContext: lineage.hasStateContext,
    hasSupportingHistory: lineage.supportingHistoryCount > 0,
    hasConfirmedContext: effectiveCertainty === 'confirmed',
    hasEstimatedContext,
  });

  return {
    status: 'AVAILABLE',
    explanation: {
      title: params.target.symbol ? `Why ${params.target.symbol} is in focus` : 'Why this is in focus',
      summary: createSummary({
        target: params.target,
        alignmentState,
        supportingHistoryCount: lineage.supportingHistoryCount,
        hasEstimatedContext,
      }),
      contextNote: createContextNote({
        alignmentState,
        supportingHistoryCount: lineage.supportingHistoryCount,
        hasEstimatedContext,
      }),
      confidence,
      confidenceNote: createConfidenceNote({
        confidence,
        hasEstimatedContext,
        hasStateContext: lineage.hasStateContext,
        hasSupportingHistory: lineage.supportingHistoryCount > 0,
      }),
      lineage: lineage.items,
      limitations: createLimitations({
        hasEstimatedContext,
        hasSupportingHistory: lineage.supportingHistoryCount > 0,
      }),
    },
  };
}
