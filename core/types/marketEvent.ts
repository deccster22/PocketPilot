export type EventType =
  | 'DATA_QUALITY'
  | 'ESTIMATED_PRICE'
  | 'MOMENTUM_BUILDING'
  | 'DIP_DETECTED'
  | 'PRICE_MOVEMENT';

export type AlignmentState = 'ALIGNED' | 'WATCHFUL' | 'NEEDS_REVIEW';

export type Certainty = 'confirmed' | 'estimated';

export type MarketEventMetadataValue =
  | string
  | number
  | boolean
  | null
  | MarketEventMetadataValue[]
  | { [key: string]: MarketEventMetadataValue };

export type MarketEventMetadata = Record<string, MarketEventMetadataValue>;

export type MarketEvent = {
  eventId: string;
  timestamp: number;
  accountId: string;
  symbol: string | null;
  strategyId: string;
  eventType: EventType;
  alignmentState: AlignmentState;
  signalsTriggered: string[];
  confidenceScore: number;
  certainty: Certainty;
  price: number | null;
  pctChange: number | null;
  metadata: MarketEventMetadata;
};
