---
Title: PocketPilot - CANON
Version: 0.4
Source: docs/incoming/CANON v0.4.pdf
Last Updated: 2026-03-09
---

# PocketPilot - CANON v0.4

Product Philosophy + Locked Architecture Decisions.

## North Star

PocketPilot provides clarity in a volatile market.

It is:
- Strategy-first
- Execution-aware
- Calm in tone
- Non-gamified
- User-directed

It reduces chaos without manufacturing urgency.

## Anti-Vision (Non-Negotiables)

PocketPilot does not:
- Inject urgency language
- Gamify trading outcomes
- Auto-switch strategies
- Override user decisions
- Shame inactivity
- Flash red warnings or dramatise volatility
- Present global strategy signals that do not match execution venue

## Data Integrity and Budget Discipline

- Quote Broker abstraction required.
- All network calls routed through provider layer.
- Hard caps enforced per interval.
- No background scanning in Phase 1.
- Haptic throttle per symbol.
- Estimated state can never present as confirmed certainty.
- Core layer must remain deterministic and side-effect free.

## Core Architecture Principles

### 1. Strategy Is Account-Scoped

- Strategy alignment is calculated using the price feed of the selected execution account.
- No canonical strategy feed that diverges from execution price.
- Signals must match where trades will occur.
- Trust over aggregation purity.

### 2. Market Regime Is Contextual, Not Controlling

- Regime classification exists as an independent descriptive layer.
- Regime influences strategy only through strategy logic (no global overrides).
- No regime-level enforcement.
- Regime exposure scales by profile:
- Beginner: off by default, simplified label if enabled.
- Middle: on, simple label plus short contextual phrase.
- Advanced: full statistical detail.

### 3. Strategy Fit Indicator

- Lives on Dashboard (not Snapshot).
- Subtle spectrum: Favourable -> Mixed -> Unfavourable.
- No percentages and no red alarms.
- Beginner: textual only.
- Middle: soft spectrum plus contextual link.
- Advanced: spectrum only, no knowledge link.

### 4. Snapshot Is Sacred

Snapshot shows only:
- Current state
- Last 24h change
- Strategy alignment

No regime drama.
No fit warnings.
No behavioural commentary.

Optional:
- 30,000 ft View chip (manual access; highlighted during abnormal volatility).

### 5. 30,000 ft View

- Always manually accessible.
- Highlighted (not forced) during statistical volatility spikes.
- Provides macro context.
- Does not recommend action.

## Trade Hub - Locked Decisions

### 6. SL/TP Calculator

Lives inside Trade Hub (slide-up panel).

Pre-fills:
- Entry price
- Account portfolio value
- Position size

Never auto-applies without confirmation.

### 7. Risk Basis Toggle

Two distinct modes:
- Trade Amount (Position Risk)
- Portfolio Risk

User must consciously choose.
Display max loss in both contexts for clarity.
Recent risk percentage values shown as suggestions (not auto-defaulted).

### 8. Protection Plan Object

When user calculates SL/TP, system creates a `ProtectionPlan` object containing:
- Account ID
- Entry intent
- Stop level
- Take profit level
- Risk basis
- Timestamp
- Status

Execution flow adapts to platform capability:
- Bracket/OCO supported -> single API flow
- Separate orders required -> post-trade guided sequence

Calculator logic is platform-independent.
Execution layer adapts per platform.

## Multi-Account Architecture

### 9. Accounts Are First-Class Objects

Each account contains:
- Platform capability matrix
- Portfolio value
- Base currency
- Risk settings
- Strategy assignment

### 10. Single vs Multi Account UX

Single account:
- No account selector shown.
- All data implicitly scoped to that account.

Multi-account:
- User can nominate Primary Account.
- If none nominated, highest portfolio value is auto-selected.
- Strategy is assignable per account.
- Switching accounts switches strategy context.

### 11. Aggregation Rules

Allowed:
- Portfolio value aggregation
- Exposure aggregation
- Asset-level position aggregation

Not allowed:
- Aggregated global strategy alignment
- Aggregated fit signals

Signals are account-bound.

### 12. Snapshot Modes (Multi-Account)

- Primary Account (default)
- All Accounts (compact stacked view)
- Aggregate (positions only)

Dashboard is always account-scoped.

## Alerts Logic

- Strategy alignment alerts are account-scoped.
- Risk alerts are account-scoped.
- No global signal aggregation.

## Knowledge Layer

- Beginner: stable, always-visible strategy knowledge access.
- Middle: contextual links during drift.
- Advanced: documentation accessible but not surfaced.

Knowledge supports guardrails but does not gate features.

## Guardrails Philosophy (Phase 2)

Optional tools:
- Risk limits
- Daily loss thresholds
- Cooldowns
- Position caps

All opt-in.
All knowledge-backed.
None default-on.
None auto-blocking unless explicitly enabled.

## Open Questions (Parked)

- Behavioural reflection after consecutive losses
- Extreme crash communication model
- SL/TP hard enforcement mode
- Background monitoring limits
- Account pinning UX refinement

## Known Issues Register

- `PP_KI1`: `npm audit` reports `tar` vulnerability via Expo CLI; do not `--force` upgrade Expo.

## Backlog

- `PP_BL_01`: Security review for Expo SDK upgrade path and audit remediation after Phase 2 UI skeleton stabilises.

## Phase Targets

### Phase 1 - Strategy Engine

- Single account flawless experience
- Multi-account stable primary switching
- Strategy engine account-scoped
- Trade Hub + Protection Plan architecture working
- No background scanning
- Stability over feature density

### Phase 2 - Snapshot UI

- P2B: Live quote wiring
- P2C: Snapshot + real portfolio state; system observability and better user experience
- P2D: Dashboard UI
- Output: first usable app demo

### Phase 3 - Strategy Clarity

Add explanation layer:
- Why panel
- Signal explanation
- Metric breakdown

This is where PocketPilot becomes intellectually interesting.

### Phase 4 - Portfolio Context

- Portfolio history
- Trade context
- Learning signals

### Phase 5 - Trade Hub

- SL/TP calculator
- Risk layers
- Protection plan object

### Phase 6 - Alerts

Foreground alerts, including:
- Strategy alignment shift
- Volatility spike

Still foreground-only per CANON.

### Phase 7 - Knowledge Library

ELI5 + Nerdy lessons.
Example topics:
- Spread
- Breakeven
- Volatility
- Cooldown

### Phase 8 - Regime Engine

Market context layer.
Examples:
- Trending
- Ranging
- Volatile

Reminder: Regime must never override strategies.

### Phase 9 - Insight Layer

User learning.
Examples:
- Behaviour insights
- Missed opportunity patterns

### Phase 10 - Beta Hardening

- Sentry
- Diagnostics modal
- Debug export

### Phase 11 - Launch Preparation

- App Store copy
- Onboarding polish
- Compliance review

## Decision Register

### Phase 1 Decisions

`P1D1`
Decision: P1D will introduce the Strategy Engine skeleton (types + deterministic orchestration + noop strategy) with no UI/persistence.
Rationale: Locks a stable contract for initial strategies without refactors; preserves deterministic core; enables early unit tests and CI guardrails.
Implications: Future strategies implement the same `Strategy` interface and consume `ForegroundScanResult`; signal format is stable across profiles.

`P1D2`
Decision: P1E introduces Strategy Catalog + Profile Defaults (pure/deterministic), selectable without UI or persistence.
Rationale: Scales from one noop strategy to many with consistent metadata, ordering, and profile defaults.
Implications: Metadata becomes single source of truth for strategy lists/order; services compute active strategies deterministically.

`P1D3`
Decision: P1F implements `data_quality` as the first real strategy using current-scan quotes and broker instrumentation (`estimated`, `symbolsBlocked`) for confidence signals.
Rationale: Delivers immediate value without history/persistence; aligns with clarity over hype.
Implications: Establishes strategy pattern over scan metadata for later extension.

`P1D4`
Decision: P1G adds optional caller-supplied `baselineScan` and deterministic quote deltas (`pctChangeBySymbol`), plus first delta-based strategy `snapshot_change`.
Rationale: Enables movement signals without candle/history storage while preserving determinism.
Implications: Strategy input expands to baseline/delta maps; orchestration remains in services.

`P1D5`
Decision: P1H implements beginner-safe `dip_buying` using baseline deltas only, with calm watchlist-style output.
Rationale: Adds practical value early without historical data and keeps tone beginner-safe.
Implications: Establishes threshold-based strategy tone/patterns reusable in later strategies.

`P1D6`
Decision: P1I implements beginner `momentum_basics` using baseline deltas only, with "momentum building" WATCH signals plus a non-hype caution.
Rationale: Completes beginner strategy pair using deterministic mechanics.
Implications: Establishes consistent thresholds/ordering/caps across beginner strategies.

`P1D7`
Decision: Introduce `StrategyBundle` and make profile defaults resolve to bundles (bundle -> strategy IDs), while keeping raw strategy IDs internally.
Rationale: Reduces cognitive load and UI complexity; supports feature flags/packs/experiments without engine refactors.
Implications: `profileDefaults` returns bundle IDs; active strategy resolution expands bundle -> IDs -> implementations.

`P1D8`
Decision: Before P2, add proper PR flow + required checks.
Rationale: Prevent direct pushes to `main` without green `verify`.
Implications:
- Branch protection on `main`
- Require pull request
- Require `verify` status check
- Require branches up to date
- Disable bypass for admins (or remove admin role in solo workflow)

### Phase 2 Decisions

`P2D1`
Decision: Freeze code for first working device version of PocketPilot app.
Rationale: Preserve a known-good restore point if later phases break.
Implications: Keep a stable baseline device build reference before further expansion.

## Phase Reports

### Phase 1 Reports

`P1A` deterministic account selector:
- Patch applied locally: Yes
- Local verify: Not run
- Commit hash: `fea39c60c3eca68130a34406d7e96b97bd171efb`
- Pushed to GitHub: Yes (with non-fast-forward rejection noted)
- GitHub Actions verify: Pass

`P1B` execution quotes service wiring:
- Patch applied locally: Yes
- Local verify: Pass
- Commit hash: `c67c71ae4ebc578876ce4605d0969b689a37475f`
- Pushed to GitHub: Yes
- GitHub Actions verify: Pass

`P1C` Foreground Scan patch:
- Patch applied locally: Yes
- Local verify: Pass
- Commit hash: `fcc569877091762872ce50a061b2b802bc2548b5`
- Pushed to GitHub: Yes
- GitHub Actions verify: Pass

`P1D` strategy engine skeleton + noop:
- Patch applied locally: Yes
- Local verify: Pass
- Commit hash: `050a322c6d95bafb0f03ad63513993333ae7325a`
- Pushed to GitHub: Yes
- GitHub Actions verify: Pass

`P1E` Strategy Catalog + Profile Defaults:
- Patch applied locally: Yes
- Local verify: Pass
- Commit hash: `3cb4a080e28acab2757741e0a7752bbe7c5b86f5`
- Pushed to GitHub: Yes
- GitHub Actions verify: Pass

`P1F` first real strategy (Data Quality / Confidence):
- Patch applied locally: Yes
- Local verify: Pass
- Commit hash: `bb0a96c1db7df3ddfa1676ce9af76be9d32b880f`
- Pushed to GitHub: Yes
- GitHub Actions verify: Pass

`P1G` baseline scan deltas + first delta-based strategy:
- Patch applied locally: Yes
- Local verify: Pass
- Commit hash: `91110d1c0c92e5735752b6576eab1eb3713a9768`
- Pushed to GitHub: Yes
- GitHub Actions verify: Pass

`P1H` beginner strategy Dip Buying:
- Patch applied locally: Yes
- Local verify: Pass
- Commit hash: `66032a27b8603eea1b1255257d55c3fcb3aad537`
- Pushed to GitHub: Yes
- GitHub Actions verify: Pass

`P1I` beginner strategy Momentum Basics:
- Patch applied locally: Yes
- Local verify: Pass
- Commit hash: `dd49b0dcf6ae908035e5d663a93be6cb1afb2267`
- Pushed to GitHub: Yes
- GitHub Actions verify: Pass

`P1J` strategy bundles + profile defaults:
- Patch applied locally: Yes
- Local verify: Pass
- Commit hash: `1f896b61e3f45621b2e12da950261ee5f0416b6b`
- Pushed to GitHub: Yes
- GitHub Actions verify: Pass

## Phase 1 Summary

What Phase 1 contains:
- Expo TypeScript scaffold + deterministic guardrails
- Quote budgets + instrumentation
- Deterministic haptic throttle + provider wrapper
- Data quality + estimated-language guardrail
- Deterministic account selection
- Quotes service wiring
- Baseline scan deltas + percent change mapping
- Strategies: `data_quality`, `snapshot_change`, `dip_buying`, `momentum_basics`, `noop`
- Strategy bundles + profile defaults via bundles
- Tests + local verify + green Actions

What Phase 1 intentionally does not include:
- UI (Snapshot/Dashboard/Trade Hub)
- Persistence (journals/history/reorientation/exports)
- Platform integrations (exchange APIs/auth/multi-account screens)
- Regime engine
- SL/TP calculator

These are Phase 2+ by design.

### Phase 2 Reports

`P2A` Snapshot UI Skeleton (read-only) + demo scan wiring:
- Patch applied locally: Yes
- Local verify: Pass
- Commit hashes: `fea39c60c3eca68130a34406d7e96b97bd171efb`, `5c19f86bdc5218024ac708dd0424a6adc596755a`
- Pushed/Pulled to GitHub: Yes
- GitHub Actions verify: Pass
- Merged to main: Yes

`P2B` live quotes integration + snapshot wiring (mobile console fix deps):
- Patch applied locally: Yes
- Local verify: Pass
- Commit hashes: `3880959564a5c0fd8d5add436e5333420a4f73c9`, `d7e375e541d14f5b6493f86aa849cb29bac1332e`, `6dae2b046e236f02803c50f075568a912ef96d32`
- Pushed/Pulled to GitHub: Yes
- GitHub Actions verify: Pass
- Merged to main: Yes
- Notes: merged into P2A branch, then main

## P2C Outcomes

What was shipped in P2C:
- Secrets protection:
- Added secret scanning (`scripts/secret-scan.js`)
- CI blocks merges on credential-like patterns
- Environment boundary enforcement:
- Tests enforce env reads through config module boundaries
- CI verification pipeline:
- PR pipeline runs install, tests, and secret scan

Why it matters long term:
- Enables safer scaling and governance consistency.
- Moves project from prototype toward engineered product foundation.

## Current Foundation State

PocketPilot currently has:
- App UI
- Quotes provider
- Strategy engine
- Snapshot generation
- Testing framework
- CI verification
- Secret scanning
- Config governance

## Next Focus

Next work should emphasize powerful, demo-worthy capabilities while preserving the CANON non-negotiables.

## Conversion Notes

The following prior headings in `docs/governance/CANON.md` were replaced due to conflicts with source `CANON v0.4`:
- Current Phase Target
- Phase 1 Decisions
- Phase 2 Phase Reports
- What Phase 1 now contains (done)
- What Phase 1 is not (intentionally)
