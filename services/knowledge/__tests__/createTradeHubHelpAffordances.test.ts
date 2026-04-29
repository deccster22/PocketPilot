import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createTradeHubHelpAffordances } from '@/services/knowledge/createTradeHubHelpAffordances';
import { knowledgeCatalog } from '@/services/knowledge/knowledgeCatalog';

describe('createTradeHubHelpAffordances', () => {
  it('returns only the first-rollout risk tool terms with canonical glossary and topic destinations', () => {
    const result = createTradeHubHelpAffordances({
      profile: 'BEGINNER',
      surface: 'RISK_TOOL',
      activeRiskBasis: 'ACCOUNT_PERCENT',
      includeStopLossPrice: true,
      includeTargetPrice: true,
      includeActiveRiskBasis: true,
    });

    expect(result.status).toBe('AVAILABLE');

    if (result.status !== 'AVAILABLE') {
      throw new Error('Expected risk-tool help affordances to be available.');
    }

    expect(result.affordances.map((affordance) => affordance.term)).toEqual([
      'STOP_LOSS_PRICE',
      'TARGET_PRICE',
      'RISK_PERCENT',
    ]);
    expect(result.affordances).toEqual([
      {
        term: 'STOP_LOSS_PRICE',
        termLabel: 'Stop-loss price',
        surface: 'RISK_TOOL',
        slot: 'RISK_TOOL_STOP_LOSS_PRICE',
        treatment: 'GLOSSARY_THEN_TOPIC',
        destination: {
          glossaryTopicId: 'glossary-stop-loss-price',
          glossaryPath: 'docs/knowledge/glossary/stop-loss-price.md',
          topicId: 'trade-hub-stop-loss-price',
          topicPath: 'docs/knowledge/trade-hub/stop-loss-price.md',
        },
        tapTopicId: 'glossary-stop-loss-price',
        followThroughTopicId: 'trade-hub-stop-loss-price',
      },
      {
        term: 'TARGET_PRICE',
        termLabel: 'Target price',
        surface: 'RISK_TOOL',
        slot: 'RISK_TOOL_TARGET_PRICE',
        treatment: 'GLOSSARY_THEN_TOPIC',
        destination: {
          glossaryTopicId: 'glossary-target-price',
          glossaryPath: 'docs/knowledge/glossary/target-price.md',
          topicId: 'trade-hub-target-price',
          topicPath: 'docs/knowledge/trade-hub/target-price.md',
        },
        tapTopicId: 'glossary-target-price',
        followThroughTopicId: 'trade-hub-target-price',
      },
      {
        term: 'RISK_PERCENT',
        termLabel: 'Risk percent',
        surface: 'RISK_TOOL',
        slot: 'RISK_TOOL_ACTIVE_RISK_BASIS',
        treatment: 'GLOSSARY_THEN_TOPIC',
        destination: {
          glossaryTopicId: 'glossary-risk-percent',
          glossaryPath: 'docs/knowledge/glossary/risk-percent.md',
          topicId: 'trade-hub-risk-percent',
          topicPath: 'docs/knowledge/trade-hub/risk-percent.md',
        },
        tapTopicId: 'glossary-risk-percent',
        followThroughTopicId: 'trade-hub-risk-percent',
      },
    ]);
  });

  it('maps the active fixed-currency basis to risk amount only', () => {
    const result = createTradeHubHelpAffordances({
      profile: 'MIDDLE',
      surface: 'RISK_TOOL',
      activeRiskBasis: 'FIXED_CURRENCY',
      includeActiveRiskBasis: true,
    });

    expect(result).toEqual({
      status: 'AVAILABLE',
      affordances: [
        {
          term: 'RISK_AMOUNT',
          termLabel: 'Risk amount',
          surface: 'RISK_TOOL',
          slot: 'RISK_TOOL_ACTIVE_RISK_BASIS',
          treatment: 'GLOSSARY_THEN_TOPIC',
          destination: {
            glossaryTopicId: 'glossary-risk-amount',
            glossaryPath: 'docs/knowledge/glossary/risk-amount.md',
            topicId: 'trade-hub-risk-amount',
            topicPath: 'docs/knowledge/trade-hub/risk-amount.md',
          },
          tapTopicId: 'glossary-risk-amount',
          followThroughTopicId: 'trade-hub-risk-amount',
        },
      ],
    });
  });

  it('supports a bounded Trade Hub guardrails affordance and no extra terms', () => {
    const result = createTradeHubHelpAffordances({
      profile: 'BEGINNER',
      surface: 'TRADE_HUB',
      includeGuardrails: true,
      includeStopLossPrice: true,
      includeTargetPrice: true,
    });

    expect(result).toEqual({
      status: 'AVAILABLE',
      affordances: [
        {
          term: 'GUARDRAILS',
          termLabel: 'Guardrails',
          surface: 'TRADE_HUB',
          slot: 'TRADE_HUB_GUARDRAILS',
          treatment: 'GLOSSARY_THEN_TOPIC',
          destination: {
            glossaryTopicId: 'glossary-guardrails',
            glossaryPath: 'docs/knowledge/glossary/guardrails.md',
            topicId: 'trade-hub-guardrails',
            topicPath: 'docs/knowledge/trade-hub/guardrails.md',
          },
          tapTopicId: 'glossary-guardrails',
          followThroughTopicId: 'trade-hub-guardrails',
        },
      ],
    });
  });

  it('keeps advanced profile treatment lighter by default', () => {
    expect(
      createTradeHubHelpAffordances({
        profile: 'ADVANCED',
        surface: 'RISK_TOOL',
        includeStopLossPrice: true,
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NOT_ENABLED_FOR_PROFILE',
    });
  });

  it('returns unavailable when no first-rollout slots are enabled', () => {
    expect(
      createTradeHubHelpAffordances({
        profile: 'BEGINNER',
        surface: 'RISK_TOOL',
      }),
    ).toEqual({
      status: 'UNAVAILABLE',
      reason: 'NO_ELIGIBLE_TERMS',
    });
  });

  it('emits tap topic IDs that resolve in the runtime knowledge catalog for every first-rollout term', () => {
    const register = readFileSync(
      join(process.cwd(), 'docs', 'knowledge', '_register', 'CONTENT_REGISTER.csv'),
      'utf8',
    );
    const runtimeTopicIds = new Set(knowledgeCatalog.map((entry) => entry.topicId));
    const surfaces = [
      createTradeHubHelpAffordances({
        profile: 'BEGINNER',
        surface: 'TRADE_HUB',
        includeGuardrails: true,
      }),
      createTradeHubHelpAffordances({
        profile: 'BEGINNER',
        surface: 'RISK_TOOL',
        includeStopLossPrice: true,
        includeTargetPrice: true,
        includeActiveRiskBasis: true,
        activeRiskBasis: 'ACCOUNT_PERCENT',
      }),
      createTradeHubHelpAffordances({
        profile: 'BEGINNER',
        surface: 'RISK_TOOL',
        includeActiveRiskBasis: true,
        activeRiskBasis: 'FIXED_CURRENCY',
      }),
    ];

    const affordances = surfaces.flatMap((availability) =>
      availability.status === 'AVAILABLE' ? availability.affordances : [],
    );
    const firstRolloutTapTopicIds = [
      'glossary-stop-loss-price',
      'glossary-target-price',
      'glossary-risk-amount',
      'glossary-risk-percent',
      'glossary-guardrails',
    ] as const;
    const firstRolloutFollowThroughTopicIds = [
      'trade-hub-stop-loss-price',
      'trade-hub-target-price',
      'trade-hub-risk-amount',
      'trade-hub-risk-percent',
      'trade-hub-guardrails',
    ] as const;

    expect(affordances.length).toBeGreaterThan(0);
    expect(
      affordances.every((affordance) => register.includes(`\"${affordance.tapTopicId}\"`)),
    ).toBe(true);
    expect(affordances.every((affordance) => runtimeTopicIds.has(affordance.tapTopicId))).toBe(true);
    expect(
      affordances.every((affordance) => runtimeTopicIds.has(affordance.followThroughTopicId)),
    ).toBe(true);
    expect(
      firstRolloutTapTopicIds.every(
        (topicId) => register.includes(`\"${topicId}\"`) && runtimeTopicIds.has(topicId),
      ),
    ).toBe(true);
    expect(
      firstRolloutFollowThroughTopicIds.every(
        (topicId) => register.includes(`\"${topicId}\"`) && runtimeTopicIds.has(topicId),
      ),
    ).toBe(true);
  });
});
