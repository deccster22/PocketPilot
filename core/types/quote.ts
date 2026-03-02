export type EstimatedValue = {
  estimated: boolean;
};

export type Quote = EstimatedValue & {
  symbol: string;
  price: number;
  source: string;
  timestampMs: number;
};
