# PX-C2 - Richer Volatility / Structural Context Inputs

## Why This Phase Happened Now

PX-C1 established one calm Strategy Fit / 30,000 ft lane with a canonical fetch seam, a Snapshot-owned affordance, and one opt-in detail view.

That foundation made PX-C2 the next sensible step:

- deepen the quality of the interpreted inputs
- keep the same canonical seam
- improve altitude without widening rollout or semantics

PX-C2 happens now because PocketPilot already has enough service-owned interpreted seams to derive calmer volatility, structural, fit-support, and historical-grounding context honestly, but it is still too early for a regime engine, recommendation family, or alert expansion.

## What PX-C2 Added

- one canonical `PreparedContextInputs` seam in `services/context/types.ts`
- one canonical richer-input helper in `services/context/createPreparedContextInputs.ts`
- richer Strategy Fit shaping through that same prepared-input seam
- richer 30,000 ft availability and detail shaping through that same prepared-input seam
- no new user-facing surfaces beyond the existing Snapshot affordance and 30,000 ft detail path

The updated path is:

`SnapshotVM -> PreparedContextInputs -> StrategyFitSummary -> ThirtyThousandFootVM -> SnapshotSurfaceVM -> SnapshotScreen -> ThirtyThousandFootScreen`

## Richer Context-Input Refinement Added

PX-C2 keeps the contract sparse and interpretable.

It adds service-owned descriptive inputs for:

- volatility state relative to recent conditions
- structural posture (`STABLE`, `MIXED`, `STRAINED`)
- broader condition state (`ORDERLY`, `MIXED`, `STRESSED`, `UNKNOWN`)
- whether current fit is supported, neutral, or strained by that backdrop
- light historical grounding where Since Last Checked already makes that truth available

These inputs are derived from existing prepared seams only:

- Snapshot 24h change and current-state direction
- prepared strategy alignment
- interpreted market events
- interpreted Since Last Checked history through `OrientationContext`

## Descriptive Rules Preserved

PX-C2 keeps these meanings sharp:

- Strategy Fit stays descriptive, account-scoped, and secondary to core alignment.
- 30,000 ft stays calm, opt-in, stabilising, and non-recommendatory.
- richer context improves phrasing and availability truth; it does not become a hidden override engine.
- `UNAVAILABLE` remains the honest answer when richer context is still thin.
- `app/` still renders prepared contracts only.

## What PX-C2 Deliberately Did Not Add

PX-C2 does not add:

- a full regime engine
- strategy recommendations
- action CTAs
- alerts, notifications, badges, or background polling
- a second explanation system
- AI-generated macro commentary
- user settings for this lane
- surface rollout beyond the existing Snapshot affordance and 30,000 ft detail view

## What Future Work Can Build On

Later work can safely build on PX-C2 by:

- reusing `PreparedContextInputs` for future calm context deepening
- adding richer but still sparse historical grounding when service seams support it honestly
- widening surface rollout only through explicit scope
- reserving future regime or navigator work for a later family instead of quietly growing it here

## Recommendation Review

### Adopt Now

- Canonical `PreparedContextInputs`: it gives Strategy Fit and 30,000 ft one shared richer-input seam without moving interpretation into `app/`.
- Calm volatility and structural detail lines: they improve altitude while preserving the lane's descriptive meaning.

### Add To Backlog

- Broader reuse of `PreparedContextInputs` beyond Snapshot and 30,000 ft: valuable later, but wider rollout would expand scope in this phase.
- Deeper historical grounding comparisons: useful eventually, but PX-C2 keeps grounding intentionally sparse and service-owned.

### Decline For Now

- Recommendation logic tied to fit or context: it would blur descriptive fit into behavioral direction.
- Regime-engine severity or override states: they would flatten this lane into a disguised alert/decision system too early.
