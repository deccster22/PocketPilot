export type ExplanationConfidence = 'LOW' | 'MODERATE' | 'HIGH';

export type ExplanationLineageItem = {
  kind: 'MARKET_EVENT' | 'STATE_TRANSITION' | 'CONTEXT';
  label: string;
  detail: string;
  timestamp: string | null;
};

export type ExplanationSummary = {
  title: string;
  summary: string;
  confidence: ExplanationConfidence;
  confidenceNote: string;
  lineage: ReadonlyArray<ExplanationLineageItem>;
  limitations: ReadonlyArray<string>;
};

export type ExplanationAvailability =
  | {
      status: 'UNAVAILABLE';
      reason:
        | 'NO_EXPLANATION_TARGET'
        | 'INSUFFICIENT_INTERPRETED_CONTEXT'
        | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      explanation: ExplanationSummary;
    };
