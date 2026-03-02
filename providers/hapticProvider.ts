import * as ExpoHaptics from 'expo-haptics';

import { canFire, type HapticThrottleState, updateState } from '@/core/utils/hapticThrottle';

type HapticsAdapter = {
  notificationAsync: (type: ExpoHaptics.NotificationFeedbackType) => Promise<void>;
};

export class HapticProvider {
  private state: HapticThrottleState = {};

  private readonly haptics: HapticsAdapter;

  constructor(hapticsAdapter: HapticsAdapter = ExpoHaptics) {
    this.haptics = hapticsAdapter;
  }

  async fireEvent(params: {
    symbol: string;
    event: string;
    nowMs: number;
    cooldownMs: number;
    type?: ExpoHaptics.NotificationFeedbackType;
  }): Promise<boolean> {
    const key = `${params.symbol}:${params.event}`;

    if (!canFire(this.state, key, params.nowMs, params.cooldownMs)) {
      return false;
    }

    this.state = updateState(this.state, key, params.nowMs);
    await this.haptics.notificationAsync(
      params.type ?? ExpoHaptics.NotificationFeedbackType.Success,
    );

    return true;
  }
}
