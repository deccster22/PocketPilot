import type { UserProfile } from '@/core/profile/types';
import type {
  TradeHubHelpAffordance,
  TradeHubHelpAffordanceAvailability,
  TradeHubHelpAffordanceSlot,
  TradeHubHelpAffordanceSurface,
  TradeHubHelpAffordanceTerm,
  TradeHubHelpDestination,
} from '@/services/knowledge/types';
import type { RiskBasis } from '@/services/trade/types';

type TradeHubHelpContext = {
  profile: UserProfile;
  surface: TradeHubHelpAffordanceSurface;
  activeRiskBasis?: RiskBasis | null;
  includeStopLossPrice?: boolean;
  includeTargetPrice?: boolean;
  includeGuardrails?: boolean;
  includeActiveRiskBasis?: boolean;
};

const SUPPORTED_PROFILES: ReadonlySet<UserProfile> = new Set(['BEGINNER', 'MIDDLE']);

const TERM_LABELS: Readonly<Record<TradeHubHelpAffordanceTerm, string>> = {
  STOP_LOSS_PRICE: 'Stop-loss price',
  TARGET_PRICE: 'Target price',
  RISK_AMOUNT: 'Risk amount',
  RISK_PERCENT: 'Risk percent',
  GUARDRAILS: 'Guardrails',
};

const TERM_DESTINATIONS: Readonly<Record<TradeHubHelpAffordanceTerm, TradeHubHelpDestination>> = {
  STOP_LOSS_PRICE: {
    glossaryTopicId: 'glossary-stop-loss-price',
    glossaryPath: 'docs/knowledge/glossary/stop-loss-price.md',
    topicId: 'trade-hub-stop-loss-price',
    topicPath: 'docs/knowledge/trade-hub/stop-loss-price.md',
  },
  TARGET_PRICE: {
    glossaryTopicId: 'glossary-target-price',
    glossaryPath: 'docs/knowledge/glossary/target-price.md',
    topicId: 'trade-hub-target-price',
    topicPath: 'docs/knowledge/trade-hub/target-price.md',
  },
  RISK_AMOUNT: {
    glossaryTopicId: 'glossary-risk-amount',
    glossaryPath: 'docs/knowledge/glossary/risk-amount.md',
    topicId: 'trade-hub-risk-amount',
    topicPath: 'docs/knowledge/trade-hub/risk-amount.md',
  },
  RISK_PERCENT: {
    glossaryTopicId: 'glossary-risk-percent',
    glossaryPath: 'docs/knowledge/glossary/risk-percent.md',
    topicId: 'trade-hub-risk-percent',
    topicPath: 'docs/knowledge/trade-hub/risk-percent.md',
  },
  GUARDRAILS: {
    glossaryTopicId: 'glossary-guardrails',
    glossaryPath: 'docs/knowledge/glossary/guardrails.md',
    topicId: 'trade-hub-guardrails',
    topicPath: 'docs/knowledge/trade-hub/guardrails.md',
  },
};

function createAffordance(params: {
  term: TradeHubHelpAffordanceTerm;
  surface: TradeHubHelpAffordanceSurface;
  slot: TradeHubHelpAffordanceSlot;
}): TradeHubHelpAffordance {
  const destination = TERM_DESTINATIONS[params.term];

  return {
    term: params.term,
    termLabel: TERM_LABELS[params.term],
    surface: params.surface,
    slot: params.slot,
    treatment: 'GLOSSARY_THEN_TOPIC',
    destination,
    tapTopicId: destination.glossaryTopicId,
    followThroughTopicId: destination.topicId,
  };
}

function resolveActiveRiskBasisTerm(
  basis: RiskBasis | null | undefined,
): TradeHubHelpAffordanceTerm | null {
  if (!basis) {
    return null;
  }

  if (basis === 'FIXED_CURRENCY') {
    return 'RISK_AMOUNT';
  }

  if (basis === 'ACCOUNT_PERCENT' || basis === 'POSITION_PERCENT') {
    return 'RISK_PERCENT';
  }

  return null;
}

function createUnavailable(
  reason: Extract<TradeHubHelpAffordanceAvailability, { status: 'UNAVAILABLE' }>['reason'],
): TradeHubHelpAffordanceAvailability {
  return {
    status: 'UNAVAILABLE',
    reason,
  };
}

export function createTradeHubHelpAffordances(
  params: TradeHubHelpContext,
): TradeHubHelpAffordanceAvailability {
  if (!SUPPORTED_PROFILES.has(params.profile)) {
    return createUnavailable('NOT_ENABLED_FOR_PROFILE');
  }

  const affordances: TradeHubHelpAffordance[] = [];

  if (params.surface === 'TRADE_HUB') {
    if (params.includeGuardrails) {
      affordances.push(
        createAffordance({
          term: 'GUARDRAILS',
          surface: params.surface,
          slot: 'TRADE_HUB_GUARDRAILS',
        }),
      );
    }
  } else if (params.surface === 'RISK_TOOL') {
    if (params.includeStopLossPrice) {
      affordances.push(
        createAffordance({
          term: 'STOP_LOSS_PRICE',
          surface: params.surface,
          slot: 'RISK_TOOL_STOP_LOSS_PRICE',
        }),
      );
    }

    if (params.includeTargetPrice) {
      affordances.push(
        createAffordance({
          term: 'TARGET_PRICE',
          surface: params.surface,
          slot: 'RISK_TOOL_TARGET_PRICE',
        }),
      );
    }

    if (params.includeActiveRiskBasis) {
      const activeRiskTerm = resolveActiveRiskBasisTerm(params.activeRiskBasis);

      if (activeRiskTerm) {
        affordances.push(
          createAffordance({
            term: activeRiskTerm,
            surface: params.surface,
            slot: 'RISK_TOOL_ACTIVE_RISK_BASIS',
          }),
        );
      }
    }
  } else {
    return createUnavailable('NOT_ENABLED_FOR_SURFACE');
  }

  if (affordances.length === 0) {
    return createUnavailable('NO_ELIGIBLE_TERMS');
  }

  return {
    status: 'AVAILABLE',
    affordances,
  };
}
