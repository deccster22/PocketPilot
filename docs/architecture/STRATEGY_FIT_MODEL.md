# Strategy Fit Model (PX-C2)

## Purpose

`services/context/createStrategyFitSummary.ts` remains PocketPilot's canonical Strategy Fit seam.

It answers:

- how favourable are current interpreted conditions for this strategy?

It does not answer:

- should the user trade?
- should the user switch strategies?
- should PocketPilot override core alignment state?

## Contract

```ts
type StrategyFitState = 'FAVOURABLE' | 'MIXED' | 'UNFAVOURABLE' | 'UNKNOWN';

type StrategyFitSummary = {
  state: StrategyFitState;
  summary: string;
};
```

Rules:

- one canonical fit contract
- descriptive only
- account-scoped
- secondary to core alignment state
- `UNKNOWN` is better than invented confidence
- no percentages, probability language, or recommendation fields

## Prepared Input Seam

PX-C2 adds one richer interpreted-input seam above Snapshot and OrientationContext:

```ts
type PreparedContextInputs = {
  alignmentState: AlignmentState | null;
  contextStrength: 'THIN' | 'BASELINE' | 'SUPPORTED';
  currentState: 'UP' | 'DOWN' | 'FLAT' | null;
  hasEstimatedContext: boolean;
  volatilityContext: { state: 'CALM' | 'ELEVATED' | 'EXPANDING' } | null;
  structureContext: { posture: 'STABLE' | 'MIXED' | 'STRAINED' } | null;
  conditionState: 'ORDERLY' | 'MIXED' | 'STRESSED' | 'UNKNOWN';
  fitSupport: 'SUPPORTED' | 'NEUTRAL' | 'STRAINED' | 'UNKNOWN';
  historicalGrounding: { state: 'LIGHT' | 'SUPPORTED' | 'ACTIVE' } | null;
};
```

This seam is:

- service-owned
- sparse and interpretable
- additive to PX-C1 rather than a competing model

## Input Seams

PX-C2 fit uses interpreted service seams only:

- prepared Snapshot 24h change and current-state direction
- prepared strategy alignment
- interpreted market events from `SnapshotVM`
- interpreted Since Last Checked history through `OrientationContext`

It does not consume:

- raw signal arrays
- provider metadata
- runtime diagnostics
- app-side assembled context

## Builder Rules

PX-C2 deepens fit carefully:

- calm aligned structure can still read `FAVOURABLE`
- elevated volatility or mixed structure can keep fit at `MIXED`
- strained structure or expanding volatility can push fit to `UNFAVOURABLE`
- thin, estimated-only, or data-quality-dominated context can stay `UNKNOWN`

This keeps fit more descriptive without pretending it is already a full regime model.

## Relationship To Snapshot And 30,000 ft

Strategy Fit does not replace Snapshot's core triad.
It remains a secondary descriptive note that feeds the broader-context lane.

PX-C2 keeps fit as its own canonical service object while letting `PreparedContextInputs` improve the quality of that description without moving interpretation into `app/`.
