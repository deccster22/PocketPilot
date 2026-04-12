import { createMessagePolicyVM } from '@/services/messages/createMessagePolicyVM';
import type {
  MessagePolicyDashboardContext,
  MessagePolicyLane,
  MessagePolicySnapshotContext,
  MessagePolicyTradeHubContext,
  MessageSurfaceEligibility,
} from '@/services/messages/types';

type CreateMessagePolicyLaneParams = {
  surface: MessageSurfaceEligibility;
  snapshot?: MessagePolicySnapshotContext | null;
  dashboard?: MessagePolicyDashboardContext | null;
  tradeHub?: MessagePolicyTradeHubContext | null;
};

export function createMessagePolicyLane(
  params: CreateMessagePolicyLaneParams,
): MessagePolicyLane {
  const policyAvailability = createMessagePolicyVM(params);

  return {
    policyAvailability,
    rationaleAvailability: policyAvailability.rationale,
  };
}
