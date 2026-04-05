# Risk Tool Model (P5-R1)

## Purpose

`RiskToolVM` is the first canonical risk-tool seam for PocketPilot's Trade Hub family.

It gives the user a calm, deterministic sizing summary from:

- one prepared action context when available
- explicit user-supplied entry, stop, target, and risk inputs
- service-owned calculations only

It does not create an order ticket, build a broker payload, or imply execution readiness.

## Contract

The canonical risk-tool contract lives in `services/risk/types.ts`.

The core shapes are:

```ts
type RiskToolInput = {
  accountSize: number | null;
  riskAmount: number | null;
  riskPercent: number | null;
  entryPrice: number | null;
  stopPrice: number | null;
  targetPrice: number | null;
  symbol: string | null;
};

type RiskToolState = 'UNAVAILABLE' | 'INCOMPLETE' | 'READY';

type RiskToolSummary = {
  state: RiskToolState;
  symbol: string | null;
  entryPrice: number | null;
  stopPrice: number | null;
  targetPrice: number | null;
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

The contract is intentionally small:

- no broker-specific fields
- no execution-path fields
- no leverage, margin, or derivatives logic
- no raw provider, signal, or runtime metadata
- no motivational scoring or judgmental copy

## Calculation Rules

P5-R1 keeps formulas explainable:

- `stopDistance = abs(entryPrice - stopPrice)` when both prices are valid and distinct
- `riskAmount = explicit riskAmount` when supplied
- otherwise `riskAmount = accountSize * riskPercent / 100` when both are valid
- `positionSize = riskAmount / stopDistance` when both values are valid
- `rewardRiskRatio` is only populated when stop and target sit on opposite sides of the entry in a way that honestly frames reward versus risk

If a required value is missing or invalid, the tool returns honest nulls.

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
- render prepared values
- format labels for readability

`app/` may not:

- calculate stop distance
- calculate position size
- calculate reward/risk
- infer execution semantics from risk output
- rebuild the summary locally

## Intentional Exclusions

P5-R1 does not add:

- broker APIs
- order dispatch
- leverage or margin tooling
- simulation-heavy P/L surfaces
- portfolio optimization
- tax or compliance calculators
- hidden defaults or automation

This phase is the first rung of the risk-tool lane, not the full ladder.
