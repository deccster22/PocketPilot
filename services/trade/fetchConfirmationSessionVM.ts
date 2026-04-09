import type { UserProfile } from '@/core/profile/types';
import { enforceAccountScopedTruth } from '@/services/accounts/enforceAccountScopedTruth';
import type { SelectedAccountContext } from '@/services/accounts/types';
import type { EventLedgerQueries } from '@/services/events/eventLedgerQueries';
import type { EventLedgerService } from '@/services/events/eventLedgerService';
import type { LastViewedState } from '@/services/orientation/lastViewedState';
import { createConfirmationFlow } from '@/services/trade/createConfirmationFlow';
import { createConfirmationFlowActions } from '@/services/trade/createConfirmationFlowActions';
import { normalisePreparedRiskReferences } from '@/services/trade/createPreparedRiskReferences';
import { createProtectionPlans } from '@/services/trade/createProtectionPlans';
import { createTradePlanConfirmationShell } from '@/services/trade/createTradePlanConfirmationShell';
import { createTradePlanPreview } from '@/services/trade/createTradePlanPreview';
import { getAccountCapabilities } from '@/services/trade/getAccountCapabilities';
import { resolveExecutionCapability } from '@/services/trade/resolveExecutionCapability';
import { resolveSelectedTradePlan } from '@/services/trade/resolveSelectedTradePlan';
import { selectAccountScopedProtectionPlans } from '@/services/trade/selectAccountScopedProtectionPlans';
import type {
  ConfirmationSession,
  ConfirmationSessionActions,
  ProtectionPlan,
} from '@/services/trade/types';
import type { ForegroundScanResult } from '@/services/types/scan';
import { fetchSurfaceContext } from '@/services/upstream/fetchSurfaceContext';

export type ConfirmationSessionVM = {
  session: ConfirmationSession;
  actions: ConfirmationSessionActions;
  scan: ForegroundScanResult;
};

export async function fetchConfirmationSessionVM(params: {
  profile: UserProfile;
  selectedPlanId?: string;
  baselineScan?: ForegroundScanResult;
  nowProvider?: () => number;
  eventLedger?: EventLedgerService;
  eventLedgerQueries?: EventLedgerQueries;
  lastViewedTimestamp?: number;
  lastViewedState?: Pick<LastViewedState, 'getLastViewedTimestamp'>;
}): Promise<ConfirmationSessionVM> {
  const upstream = await fetchSurfaceContext({
    profile: params.profile,
    baselineScan: params.baselineScan,
    nowProvider: params.nowProvider,
    eventLedger: params.eventLedger,
    eventLedgerQueries: params.eventLedgerQueries,
    lastViewedTimestamp: params.lastViewedTimestamp,
    lastViewedState: params.lastViewedState,
  });
  const protectionPlans = selectAccountScopedProtectionPlans({
    selectedAccountContext: upstream.selectedAccountContext,
    protectionPlans: createProtectionPlans({
      orientationContext: upstream.orientationContext,
      marketEvents: upstream.marketEvents,
    }),
  });
  const capabilityCache = new Map<string, Awaited<ReturnType<typeof getAccountCapabilities>>>();
  const selectedAccount =
    upstream.selectedAccountContext.status === 'AVAILABLE'
      ? upstream.selectedAccountContext.account
      : null;
  let currentSession = await buildConfirmationSession({
    plan:
      params.selectedPlanId === undefined
        ? resolveSelectedTradePlan({
            protectionPlans,
            profile: params.profile,
            selectedPlanId: params.selectedPlanId,
          })
        : resolveSessionPlan({
            planId: params.selectedPlanId,
            protectionPlans,
            profile: params.profile,
          }),
    capabilityCache,
    selectedAccount,
  });

  const actions: ConfirmationSessionActions = {
    acknowledgeStep(stepId) {
      if (!currentSession.flow || !currentSession.shell) {
        return currentSession;
      }

      currentSession = {
        ...currentSession,
        flow: createConfirmationFlowActions({ shell: currentSession.shell }).acknowledgeStep(
          currentSession.flow,
          stepId,
        ),
      };

      return currentSession;
    },

    unacknowledgeStep(stepId) {
      if (!currentSession.flow || !currentSession.shell) {
        return currentSession;
      }

      currentSession = {
        ...currentSession,
        flow: createConfirmationFlowActions({ shell: currentSession.shell }).unacknowledgeStep(
          currentSession.flow,
          stepId,
        ),
      };

      return currentSession;
    },

    resetFlow() {
      if (!currentSession.shell) {
        return currentSession;
      }

      currentSession = {
        ...currentSession,
        flow: createConfirmationFlowActions({ shell: currentSession.shell }).resetFlow(
          currentSession.flow ?? createConfirmationFlow({ shell: currentSession.shell }),
        ),
      };

      return currentSession;
    },

    async selectPlan(planId) {
      currentSession = await buildConfirmationSession({
        plan:
          planId === null
            ? null
            : resolveSessionPlan({
                planId,
                protectionPlans,
                profile: params.profile,
              }),
        capabilityCache,
        selectedAccount,
      });

      return currentSession;
    },
  };

  return {
    session: currentSession,
    actions,
    scan: upstream.scan,
  };
}

function resolveSessionPlan(params: {
  planId: string;
  protectionPlans: ReadonlyArray<ProtectionPlan>;
  profile: UserProfile;
}): ProtectionPlan | null {
  return resolveSelectedTradePlan({
    protectionPlans: params.protectionPlans,
    profile: params.profile,
    selectedPlanId: params.planId,
  });
}

async function buildConfirmationSession(params: {
  plan: ProtectionPlan | null;
  capabilityCache: Map<string, Awaited<ReturnType<typeof getAccountCapabilities>>>;
  selectedAccount: SelectedAccountContext | null;
}): Promise<ConfirmationSession> {
  if (!params.plan) {
    return {
      planId: null,
      accountId: null,
      executionCapability: null,
      preparedRiskReferences: null,
      preview: null,
      shell: null,
      flow: null,
    };
  }

  const preview = createTradePlanPreview(params.plan);
  const cachedCapabilities = params.capabilityCache.get(params.plan.accountId);
  const capabilities =
    cachedCapabilities ?? (await getAccountCapabilities(params.plan.accountId));

  params.capabilityCache.set(params.plan.accountId, capabilities);
  const executionCapability = resolveExecutionCapability(capabilities);

  const shell = createTradePlanConfirmationShell({
    plan: params.plan,
    capabilityResolution: executionCapability,
  });

  const session: ConfirmationSession = {
    planId: params.plan.planId,
    accountId: params.plan.accountId,
    executionCapability,
    preparedRiskReferences: normalisePreparedRiskReferences(params.plan.preparedRiskReferences),
    preview,
    shell,
    flow: createConfirmationFlow({ shell }),
  };

  if (!params.selectedAccount) {
    return session;
  }

  return enforceAccountScopedTruth({
    label: 'Execution support',
    selectedAccount: params.selectedAccount,
    accountIds: [params.plan.accountId, executionCapability.accountId],
    value: session,
  });
}
