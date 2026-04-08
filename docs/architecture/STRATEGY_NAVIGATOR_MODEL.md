# Strategy Navigator Model (P9-S1)

## Purpose

`services/strategyNavigator/` owns PocketPilot's first canonical Strategy Navigator lane.

In P9-S1 it exists to:

- let a user choose one strategy and one finite simulated scenario
- show how PocketPilot would reinterpret the same backdrop through that strategy
- stay calm, descriptive, and educational
- reduce commitment anxiety without becoming advice or a trading simulator

It does not exist to:

- simulate live markets
- leak raw strategy signals
- imply readiness, execution, or profit likelihood
- couple preview logic to Trade Hub or broker paths

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
};
```

Rules:

- one canonical preview contract
- one selected strategy at a time
- one finite scenario catalog
- no execution fields
- no broker or provider fields
- no profit, score, or forecast fields
- no raw signal arrays, event IDs, or runtime metadata

## Fetch And Build Path

P9-S1 uses one canonical service path:

`core strategy catalog -> strategyPreviewScenarios -> createStrategyNavigatorVM -> fetchStrategyNavigatorVM`

`app/` consumes that prepared VM through `StrategyNavigatorScreen`.

## Scenario Rules

The initial scenario catalog is intentionally small:

- Dip with expanding volatility
- Trend continuation
- Mixed reversal attempt
- Range compression

These are interpretation exercises, not market fanfiction.
They exist to create clear contrast between strategies with deterministic wording and no live dependency.

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

## App Boundary

`app/` may:

- render prepared strategy and scenario options
- render prepared preview sections
- render one prepared contextual knowledge affordance when services mark it available
- format simple display labels and timestamps

`app/` may not:

- import the strategy catalog directly
- shape scenario meaning locally
- derive event importance locally
- derive contextual-knowledge relevance locally
- build recommendation or execution language

## Relationship To Later Work

P9-S1 is the first rung of the Strategy Navigator family.

Later `P9` work can extend this seam with:

- richer surface transformations when the product has a stronger reason for them
- deeper or broader strategy-specific contextual links into Knowledge after the current proof path has proven stable
- more nuanced interpreted scenarios when the current catalog has proven useful

Those later steps should deepen the same service-owned seam rather than replacing it with a simulator, an advice engine, or a broker handoff.
