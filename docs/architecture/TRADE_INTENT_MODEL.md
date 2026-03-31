# Trade Intent Model (P5-11)

## Purpose

`ProtectionPlan` is the canonical action-framing object for the P5 action layer.

It converts interpreted market context into a small, structured plan that can be carried forward into later decision surfaces without exposing raw strategy internals.

This phase defines what a good action shape looks like. It does not execute anything.

## What A ProtectionPlan Is

`ProtectionPlan` is a deterministic service-layer object with:

- a stable identity
- a scoped account, strategy, and optional symbol target
- an intent type such as `ACCUMULATE`, `HOLD`, or `WAIT`
- explicit rationale references back to the originating market events
- a small risk profile for certainty and alignment
- minimal constraints for safe downstream framing

The object is intentionally structured and explainable. It is not narrative generation.

## What It Is Not

`ProtectionPlan` is not:

- a trade execution instruction
- financial advice
- a sizing engine
- a probability or scoring model
- a raw signal dump
- a UI contract

P5-1 keeps the object minimal so later phases can render or refine it without moving decision logic into `app/`.

## Relationship To OrientationContext

`OrientationContext` remains the system's orientation seam.

`ProtectionPlan` sits one layer after orientation assembly:

`MarketEvent -> EventLedger -> OrientationContext -> ProtectionPlan`

In this phase:

- `OrientationContext` provides current interpreted state and history boundaries
- `MarketEvent[]` provides the concrete event set for intent mapping
- `createProtectionPlans` deterministically translates those inputs into a small set of action frames

The mapping is explicit rather than heuristic:

- `DATA_QUALITY` or `ESTIMATED_PRICE` leads to `WAIT`
- `DIP_DETECTED` leads to `ACCUMULATE`
- `MOMENTUM_BUILDING` leads to `ACCUMULATE`
- conflicting dip and momentum events in the same scope lead to `HOLD`
- plain `PRICE_MOVEMENT` leads to `HOLD`

## Determinism Rules

The trade-intent seam follows the same deterministic rules as the rest of PocketPilot:

- no ambient time
- no randomness
- no hidden state
- no network or storage access
- same inputs always produce the same plans

Plan identifiers, rationale references, ordering, and `createdAt` are all derived from the input events.

## Decision To Action Boundary

P5-1 introduces the first Action-layer contract without creating a trading engine.

This seam exists so later phases can:

- render action framing in a dedicated surface
- add safeguards around user intent confirmation
- attach execution adapters only after product and governance phases explicitly allow it

Until then, the model remains informational and read-only.

## Relationship To Trade Hub Surface, Preview, And Confirmation Shell

P5-2 adds `TradeHubSurfaceModel` as the UI-facing presentation contract built on top of `ProtectionPlan`.
P5-3 adds `TradePlanPreview` as the confirmation-safe detail contract for one selected plan.
P5-4 adds `TradePlanConfirmationShell` as the capability-aware confirmation contract for one selected plan.
P5-5 adds `ConfirmationFlow` as the deterministic confirmation-step contract derived from one selected shell.
P5-6 adds explicit acknowledgement state plus service-owned confirmation-flow actions for reversible, in-memory progression.
P5-7 adds `ConfirmationSession` as the in-memory composition seam that owns one selected plan plus its prepared preview, shell, flow, and session actions.
P5-8 adds `ExecutionPreviewVM` plus execution-adapter capability and payload-preview contracts as the boundary between confirmation state and later adapter work.
P5-9 adds `ExecutionReadiness` as the deterministic submission-eligibility seam between prepared execution preview data and any future execution work.
P5-10 adds `SubmissionIntentResult` as the final non-dispatching placeholder seam between readiness and any future live execution adapter.
P5-11 adds `ExecutionAdapterAttemptResult` as the first post-intent execution-adapter seam, returning either explicit blocked passthrough or a deterministic simulated adapter response.

The boundary is:

`MarketEvent -> OrientationContext -> ProtectionPlan -> TradeHubSurfaceModel -> ConfirmationSession { TradePlanPreview / TradePlanConfirmationShell / ConfirmationFlow } -> ExecutionPreviewVM -> ExecutionReadiness -> SubmissionIntentResult -> ExecutionAdapterAttemptResult -> app`

This keeps:

- event interpretation in shared services
- action framing in `ProtectionPlan`
- presentation shaping in Trade Hub services
- rendering-only behavior in `app/`

Trade Hub cards expose only the fields needed for safe presentation:

- intent
- symbol
- alignment
- certainty
- summary
- supporting event count
- explicit action state

They do not expose raw signal codes, event metadata, execution instructions, or hidden heuristics.

Trade plan previews expose only the fields needed for safe detail:

- headline intent, symbol, and action state
- structured rationale references and supporting counts
- explicit readiness state
- explicit constraints including required confirmation
- placeholder availability for later order and execution expansion

Trade plan confirmation shells expose only the fields needed for safe confirmation framing:

- headline intent, symbol, and action state
- explicit readiness state
- deterministic confirmation path type and short steps label
- explicit constraints
- placeholder availability for future payload and execution previews

Confirmation flows expose only the fields needed for safe step orchestration:

- stable step identifiers
- explicit step types
- prepared labels
- explicit completion state
- explicit acknowledgement state and acknowledgement labels
- current step focus
- explicit blocked status

Confirmation sessions expose only the fields needed for safe selected-plan ownership:

- one selected `planId` or `null`
- one selected `accountId` or `null`
- one prepared preview
- one prepared confirmation shell
- one prepared confirmation flow
- explicit service-owned actions for acknowledge, unacknowledge, reset, and plan selection

Execution preview contracts expose only the fields needed for safe adapter scaffolding:

- placeholder adapter capability flags
- confirmation-path-to-payload mapping
- payload field names only
- explicit `executable: false`

Execution readiness contracts expose only the fields needed for safe submission gating:

- one explicit `eligible` flag
- explicit blocker codes and messages
- explicit warning codes and messages
- small summary booleans for acknowledgement, path availability, and capability mismatch

Submission intent contracts expose only the fields needed for the final pre-adapter placeholder boundary:

- one explicit `status` of `BLOCKED` or `READY`
- explicit blocker and warning lists when blocked
- explicit adapter type when ready
- explicit `placeholderOnly: true`
- selected `planId`, `accountId`, and `symbol`
- prepared payload preview placeholders only

Execution-adapter attempt contracts expose only the fields needed for a simulated, non-dispatching post-intent seam:

- one explicit `status` of `BLOCKED` or `SIMULATED`
- explicit blocker and warning lists when blocked
- explicit `dispatchEnabled: false`
- explicit `placeholderOnly: true`
- explicit adapter type, deterministic outcome, and deterministic simulated order identifiers
- a small execution summary derived only from ready submission intent fields

Confirmation shells intentionally describe presentation-safe capability context only. They do not imply:

- real broker compatibility
- executable order instructions
- submission readiness
- payload construction
- live adapter behavior

Confirmation flows intentionally describe progression-safe scaffolding only. They do not imply:

- execution permission
- order submission readiness
- adapter integration
- hidden advancement
- persisted confirmation history

Confirmation-flow actions intentionally remain small and deterministic. They only:

- acknowledge a known required step
- reverse an acknowledgement
- reset in-memory acknowledgement state

Confirmation-session actions intentionally remain small and deterministic. They only:

- recompute the in-memory selected-plan session
- switch the selected plan explicitly
- keep preview, shell, and flow synchronized in one service seam

Execution-preview seams intentionally remain small and deterministic. They only:

- map confirmation context into placeholder adapter capability
- map confirmation path into a non-executing payload preview
- prepare a UI-safe execution preview VM

Execution-readiness seams intentionally remain small and deterministic. They only:

- consume the prepared confirmation session plus execution preview
- evaluate whether submission would be eligible on the prepared path
- separate blockers from warnings in a UI-safe contract

Submission-intent seams intentionally remain small and deterministic. They only:

- consume the prepared confirmation session, execution preview, and readiness result
- trust readiness instead of recomputing submission eligibility
- return either an explicit blocked result or a placeholder-only ready contract for a future adapter

Execution-adapter seams intentionally remain small and deterministic. They only:

- consume `SubmissionIntentResult`
- pass blocked results through unchanged
- accept only `ReadySubmissionIntent` into the simulated adapter builder
- shape deterministic simulated order identifiers and summary fields
- preserve warnings from the submission-intent seam

They do not:

- auto-complete steps
- persist confirmation progress
- generate executable payloads
- execute trades
- create a global store
- call brokers
- submit orders
- persist submission intent
- recompute confirmation rules independently of the prepared session
- recompute readiness
- rebuild submission intent
- dispatch anything

They intentionally do not expose:

- raw signals
- event metadata blobs
- execution routing details
- hidden heuristics
- executable order instructions
- raw signal payloads
