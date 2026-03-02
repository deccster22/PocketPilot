import type { EstimatedValue } from '@/core/types/quote';

export const certaintyText = (
  value: EstimatedValue,
  labels: { confirmed: string; estimated: string },
): string => {
  if (value.estimated) {
    return labels.estimated;
  }

  return labels.confirmed;
};
