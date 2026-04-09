# Strategy Navigator Model (P9-S1, P9-S2, P9-S3, P9-S4)

## Purpose

`services/strategyNavigator/` owns PocketPilot's canonical Strategy Navigator lane.

`P9-S1` established the first simulated preview seam.
`P9-S2` deepened that same seam with one service-owned preview-to-knowledge follow-through path.
`P9-S3` adds one service-owned preview-explanation layer that explains why a strategy reacts to the simulated scenario the way it does.
`P9-S4` deepens the finite scenario layer with interpreted scenario traits plus one service-owned scenario-contrast seam that explains what changes for that strategy in this kind of simulated backdrop.

The lane now exists to:

- let a user choose one strategy and one finite simulated scenario
- show how PocketPilot would reinterpret the same backdrop through that strategy
- show how that strategy's emphasis changes versus calmer or alternative conditions for that same scenario family
- explain why that simulated backdrop matters to the selected strategy in calm worldview terms
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

type StrategyPreviewScenarioTraits = {
  volatilityState: string | null;
  structureState: string | null;
  conditionState: string | null;
};

type StrategyPreviewScenario = {
  scenarioId: StrategyPreviewScenarioId;
  title: string;
  summary: string;
  traits?: StrategyPreviewScenarioTraits;
};

type StrategyPreviewFocus = {
  snapshotHeadline: string;
  dashboardFocus: readonly string[];
  eventHighlights: readonly string[];
  alertPosture: string;
};

type StrategyPreviewExplanation = {
  title: string;
  summary: string;
  bullets: readonly string[];
};

type StrategyPreviewExplanationAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_EXPLANATION_AVAILABLE' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      content: StrategyPreviewExplanation;
    };

type StrategyPreviewContrast = {
  title: string;
  summary: string;
  bullets: readonly string[];
};

type StrategyPreviewContrastAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_CONTRAST_AVAILABLE' | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      content: StrategyPreviewContrast;
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
  explanation: StrategyPreviewExplanationAvailability;
  contrast: StrategyPreviewContrastAvailability;
  knowledgeFollowThrough?: StrategyPreviewKnowledgeFollowThrough;
};
```

Rules:

- one canonical preview contract
- one canonical preview-explanation contract
- one canonical preview-contrast contract
- one canonical preview-to-knowledge follow-through contract
- one selected strategy at a time
- one finite scenario catalog
- no execution fields
- no broker or provider fields
- no profit, score, or forecast fields
- no raw signal arrays, event IDs, runtime metadata, or docs paths

## Fetch And Build Path

The current canonical service path is:

`core strategy catalog -> strategyPreviewScenarios -> createStrategyNavigatorVM -> fetchStrategyNavigatorVM`

`fetchStrategyNavigatorVM` is the single app-facing entry point.
`app/` consumes the prepared VM through `StrategyNavigatorScreen`.

Within `createStrategyNavigatorVM`, the same service-owned lane now calls:

- `createStrategyPreviewExplanation`
- `createStrategyPreviewContrast`
- `selectStrategyPreviewKnowledge`

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

## Preview Contrast Rules

`P9-S4` adds one subordinate contrast shelf inside the same Strategy Navigator VM.

The contrast answers three questions only:

- what is different about this scenario for the selected strategy
- what the strategy pays more attention to here
- what becomes less central here

The contrast must:

- stay short, calm, and educational
- reuse the finite scenario catalog and interpreted scenario traits
- describe emphasis shifts rather than outcomes
- remain subordinate to the preview itself
- return `UNAVAILABLE` honestly when the seam does not have enough prepared context

The contrast must not:

- imply a recommendation or readiness state
- promise that the scenario resolves a certain way
- expose raw signal lists, provider diagnostics, or runtime metadata
- turn Strategy Preview into a live simulator or broad strategy battle surface

## Preview Explanation Rules

`P9-S3` adds one subordinate explanation shelf inside the same Strategy Navigator VM.

The explanation answers three questions only:

- what the strategy is noticing in the simulated backdrop
- why those conditions matter to that strategy's worldview
- which interpreted MarketEvents become more relevant through that lens

The explanation must:

- stay short, calm, and educational
- reuse prepared preview focus rather than create a second simulator
- describe interpretation priorities rather than outcomes
- return `UNAVAILABLE` honestly when the seam does not have enough prepared context

The explanation must not:

- advise action
- imply forecast confidence
- expose raw signal lists, provider diagnostics, or runtime metadata
- turn Strategy Preview into a generic explanation system for other surfaces

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
- render prepared preview-contrast content when `contrast.status === 'AVAILABLE'`
- render prepared preview-explanation content when `explanation.status === 'AVAILABLE'`
- render prepared knowledge follow-through items when `knowledgeFollowThrough.status === 'AVAILABLE'`
- open prepared topic detail by `topicId`
- format simple display labels and timestamps

`app/` may not:

- import the strategy catalog directly
- shape scenario meaning locally
- derive event importance locally
- derive preview contrast wording locally
- derive preview explanation wording locally
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

## Relationship To Explanation

`PX-E1` and `PX-E2` still own Dashboard's generic interpreted explanation seam in `services/explanation/`.

`P9-S3` intentionally does not move Strategy Preview onto that Dashboard-owned contract.
Instead, preview-specific explanation now lives inside `services/strategyNavigator/` because this surface needs:

- simulated scenario awareness
- strategy-worldview wording
- prepared preview-focus reuse

That keeps Strategy Preview explanatory without turning the shared Dashboard why seam into a cross-surface catch-all.

## Relationship To Later Work

`P9-S1`, `P9-S2`, `P9-S3`, and `P9-S4` are the first four rungs of the Strategy Navigator family.

Later `P9` work can extend this seam with:

- richer scenario framing when the finite starter catalog proves stable
- deeper scenario contrast depth when the current contrast seam proves useful
- richer explanation depth when the current preview explanation proves useful
- richer surface transformations when the product has a stronger reason for them
- broader or deeper knowledge integration when the current follow-through proves useful
- more nuanced interpreted scenarios when the starter catalog has proven stable

Those later steps should deepen the same service-owned seam rather than replacing it with a simulator, an advice engine, or a broker handoff.
