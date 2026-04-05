# Risk Tool Model (P5-R2)

## Purpose

`RiskToolVM` is the canonical risk-tool seam for PocketPilot's Trade Hub family.

P5-R1 established the first deterministic sizing lane.
P5-R2 deepens that same lane by allowing service-owned prepared references to assist entry, stop, and target framing when they are honestly available.

It gives the user a calm, deterministic sizing summary from:

- one prepared action context when available
- explicit user-supplied entry, stop, target, and risk inputs
- optional prepared quote and plan references selected in services
- service-owned calculations only

It does not create an order ticket, build a broker payload, or imply execution readiness.

## Contract

The canonical risk-tool contract lives in `services/risk/types.ts`.

The core shapes are:

```ts
type RiskReferenceSource = 'USER_INPUT' | 'PREPARED_QUOTE' | 'PREPARED_PLAN' | 'UNAVAILABLE';

type RiskReferenceValue = {
  value: number | null;
  source: RiskReferenceSource;
};

type RiskToolInput = {
  accountSize: number | null;
  riskAmount: number | null;
  riskPercent: number | null;
  entryPrice: number | null;
  stopPrice: number | null;
  targetPrice: number | null;
  symbol: string | null;
  allowPreparedReferences?: boolean;
};

type RiskToolState = 'UNAVAILABLE' | 'INCOMPLETE' | 'READY';

type RiskToolSummary = {
  state: RiskToolState;
  symbol: string | null;
  entryPrice: number | null;
  stopPrice: number | null;
  targetPrice: number | null;
  entryReference: RiskReferenceValue;
  stopReference: RiskReferenceValue;
  targetReference: RiskReferenceValue;
  stopDistance: number | null;
  riskAmount: number | null;
  riskPercent: number | null;
  positionSize: number | null;
  rewardRiskRatio: number | null;
  notes: ReadonlyArray<string>;
};

type RiskToolVM = {
  generatedAt: string | null;
  summary: RiskToolSummary;
};
```

The contract stays intentionally small:

- no broker-specific fields
- no execution-path fields
- no leverage, margin, or derivatives logic
- no raw provider, signal, or runtime metadata
- no motivational scoring or judgmental copy

## Reference Selection Rules

P5-R2 adds one canonical selector in `services/risk/selectRiskReferences.ts`.

That selector keeps the reference rules explicit:

- explicit user values always win
- prepared references are only used when `allowPreparedReferences !== false`
- prepared plan references outrank prepared quote references when both exist for the same field
- prepared quote assistance is currently limited to the current price as an entry reference
- stop and target references are only taken from prepared plan context when that context honestly provides them
- unavailable values stay `UNAVAILABLE`; the seam does not invent stop or target numbers

Prepared references are product-legible, not implementation-noisy.
The user should be able to see whether a value came from:

- their own input
- a prepared current reference
- a prepared plan reference
- nowhere yet

## Calculation Rules

P5-R2 keeps formulas explainable:

- `stopDistance = abs(entryPrice - stopPrice)` when both prices are valid and distinct
- `riskAmount = explicit riskAmount` when supplied
- otherwise `riskAmount = accountSize * riskPercent / 100` when both are valid
- `positionSize = riskAmount / stopDistance` when both values are valid
- `rewardRiskRatio` is only populated when stop and target sit on opposite sides of the entry in a way that honestly frames reward versus risk

If a required value is missing or invalid, the tool returns honest nulls.
Prepared references do not change the math.
They only change which service-owned reference values are available for the same deterministic formulas.

## State Rules

- `UNAVAILABLE` means there is no sensible prepared or explicit risk context to show.
- `INCOMPLETE` means some context exists, but the summary is not grounded enough for full sizing.
- `READY` means entry, stop, and risk basis are present enough to support calm sizing output.

`READY` here does not mean:

- execution ready
- broker compatible
- order-ready
- approved by PocketPilot

It means only that the risk summary itself is sufficiently grounded.

## Placement In The P5 Spine

The risk tool is a sibling seam inside the existing Trade Hub family:

`MarketEvent -> OrientationContext -> ProtectionPlan -> TradeHubSurfaceModel -> ConfirmationSession -> RiskToolVM -> ExecutionPreviewVM -> ExecutionReadiness -> SubmissionIntentResult -> ExecutionAdapterAttemptResult -> app`

That placement matters:

- `ProtectionPlan` remains the canonical action-framing object
- `ConfirmationSession` remains the selected-plan ownership seam
- `RiskToolVM` complements those seams with disciplined sizing support
- execution-preview and readiness seams remain separate and authoritative for execution-bound language

## App Boundary

`app/` may:

- collect explicit user inputs
- call `fetchRiskToolVM`
- render prepared values and source labels
- format labels for readability

`app/` may not:

- calculate stop distance
- calculate position size
- calculate reward/risk
- choose between user and prepared reference sources
- interpret raw provider/runtime quote facts
- infer execution semantics from risk output
- rebuild the summary locally

## Intentional Exclusions

P5-R2 does not add:

- broker APIs
- order dispatch
- direct execution prefills
- broker-style calculator flows
- leverage or margin tooling
- simulation-heavy P/L surfaces
- hidden defaults or automation
- stop or target invention from quote data alone

This phase is the second rung of the risk-tool lane, not the full ladder.
