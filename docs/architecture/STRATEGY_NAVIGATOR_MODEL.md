# Strategy Navigator Model (P9-S1, P9-S2)

## Purpose

`services/strategyNavigator/` owns PocketPilot's canonical Strategy Navigator lane.

`P9-S1` established the first simulated preview seam.
`P9-S2` deepens that same seam with one service-owned preview-to-knowledge follow-through path.

The lane now exists to:

- let a user choose one strategy and one finite simulated scenario
- show how PocketPilot would reinterpret the same backdrop through that strategy
- optionally offer a small set of prepared knowledge next steps if the user wants more context
- stay calm, descriptive, educational, and non-directive

It still does not exist to:

- simulate live markets
- leak raw strategy signals
- imply readiness, execution, or profit likelihood
- couple preview logic to Trade Hub, brokers, or dispatch paths
- become a markdown browser, onboarding funnel, or recommendation engine

## Contract

```ts
type StrategyPreviewScenarioId =
  | 'DIP_VOLATILITY'
  | 'TREND_CONTINUATION'
  | 'MIXED_REVERSAL'
  | 'RANGE_COMPRESSION';

type StrategyPreviewScenario = {
  scenarioId: StrategyPreviewScenarioId;
  title: string;
  summary: string;
};

type StrategyPreviewFocus = {
  snapshotHeadline: string;
  dashboardFocus: readonly string[];
  eventHighlights: readonly string[];
  alertPosture: string;
};

type StrategyPreviewKnowledgeLink = {
  topicId: string;
  title: string;
  reason: string;
};

type StrategyPreviewKnowledgeFollowThrough =
  | {
      status: 'UNAVAILABLE';
      reason:
        | 'NO_RELEVANT_KNOWLEDGE'
        | 'NOT_ENABLED_FOR_SURFACE'
        | 'KNOWLEDGE_UNAVAILABLE';
    }
  | {
      status: 'AVAILABLE';
      items: readonly StrategyPreviewKnowledgeLink[];
    };

type StrategyPreviewAvailability =
  | {
      status: 'UNAVAILABLE';
      reason:
        | 'NO_STRATEGY_SELECTED'
        | 'NO_SCENARIO_AVAILABLE'
        | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      strategyId: string;
      scenario: StrategyPreviewScenario;
      focus: StrategyPreviewFocus;
    };

type StrategyNavigatorVM = {
  title: string;
  summary: string;
  generatedAt: string | null;
  selectedStrategyId: string | null;
  selectedScenarioId: StrategyPreviewScenarioId | null;
  strategyOptions: readonly StrategyPreviewStrategyOption[];
  scenarios: readonly StrategyPreviewScenario[];
  availability: StrategyPreviewAvailability;
  knowledgeFollowThrough?: StrategyPreviewKnowledgeFollowThrough;
};
```

Rules:

- one canonical preview contract
- one canonical preview-to-knowledge follow-through contract
- one selected strategy at a time
- one finite scenario catalog
- no execution fields
- no broker or provider fields
- no profit, score, or forecast fields
- no raw signal arrays, event IDs, runtime metadata, or docs paths

## Fetch And Build Path

The current canonical service path is:

`core strategy catalog -> strategyPreviewScenarios -> createStrategyNavigatorVM -> selectStrategyPreviewKnowledge -> fetchStrategyNavigatorVM`

`fetchStrategyNavigatorVM` is the single app-facing entry point.
`app/` consumes the prepared VM through `StrategyNavigatorScreen`.

## Preview Rules

The preview answers four questions only:

- how Snapshot would read the scenario
- what would move the Dashboard emphasis
- which interpreted MarketEvents would matter
- how alert posture would broadly feel

The preview must not answer:

- what to trade
- whether the strategy is likely to profit
- whether the user is ready to execute
- what a broker or adapter would do next

## Knowledge Follow-Through Rules

`P9-S2` adds one narrow bridge from preview to knowledge.

The selector may use:

- selected strategy
- selected scenario
- prepared preview focus text
- canonical knowledge catalog metadata

The selector must:

- prefer strategy-linked and core-concept topics first
- return only a few stronger items
- keep reasons calm and explanatory
- return `UNAVAILABLE` honestly when knowledge is missing or not genuinely relevant

The selector must not:

- browse raw docs paths
- expose markdown source
- require reading before the preview is useful
- build a broad recommendation engine
- imply that knowledge completion unlocks readiness

## App Boundary

`app/` may:

- render prepared strategy and scenario options
- render prepared preview sections
- render prepared knowledge follow-through items when `knowledgeFollowThrough.status === 'AVAILABLE'`
- open prepared topic detail by `topicId`
- format simple display labels and timestamps

`app/` may not:

- import the strategy catalog directly
- shape scenario meaning locally
- derive event importance locally
- derive knowledge relevance locally
- read markdown files or docs paths
- build recommendation or execution language

## Relationship To Knowledge

`P7-K3` still owns the generic knowledge contextual-eligibility seam in `services/knowledge/`.

`P9-S2` intentionally does not reuse that generic path as the final Strategy Preview contract.
Instead, preview-specific follow-through now lives inside `services/strategyNavigator/` so the same service owns:

- preview interpretation
- preview knowledge selection
- preview VM shaping

That keeps the preview lane cohesive while still consuming the shared canonical knowledge catalog.

## Relationship To Later Work

`P9-S1` and `P9-S2` are the first two rungs of the Strategy Navigator family.

Later `P9` work can extend this seam with:

- richer surface transformations when the product has a stronger reason for them
- broader or deeper knowledge integration when the current follow-through proves useful
- more nuanced interpreted scenarios when the starter catalog has proven stable

Those later steps should deepen the same service-owned seam rather than replacing it with a simulator, an advice engine, or a broker handoff.
