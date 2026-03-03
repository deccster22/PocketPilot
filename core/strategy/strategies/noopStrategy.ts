import type { Strategy } from '@/core/strategy/types';

export const noopStrategy: Strategy = {
  id: 'noop',
  name: 'No-op Strategy',
  evaluate: () => [],
};
