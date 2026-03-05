export type EstimatedValue = {
  estimated: boolean;
};

export type Quote = EstimatedValue & {
  symbol: string;
  price: number;
  bid?: number;
  ask?: number;
  source?: string;
  timestamp?: number;
  timestampMs?: number;
};
