export function pctChange(params: { previous: number; current: number }): number | null {
  const { previous, current } = params;

  if (!Number.isFinite(previous) || !Number.isFinite(current)) {
    return null;
  }

  if (previous === 0) {
    return null;
  }

  return (current - previous) / previous;
}
