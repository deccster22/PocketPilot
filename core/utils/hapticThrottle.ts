export type HapticThrottleState = Readonly<Record<string, number>>;

export const canFire = (
  state: HapticThrottleState,
  key: string,
  nowMs: number,
  cooldownMs: number,
): boolean => {
  const lastFiredAt = state[key];

  if (lastFiredAt === undefined) {
    return true;
  }

  return nowMs - lastFiredAt >= cooldownMs;
};

export const updateState = (
  state: HapticThrottleState,
  key: string,
  nowMs: number,
): HapticThrottleState => ({
  ...state,
  [key]: nowMs,
});
