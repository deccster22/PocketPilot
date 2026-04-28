# PocketPilot Active Backlog / State

Phase anchor: `DOC-D3` (narrative cleanup continuity)  
Last refreshed: 2026-04-28  
Scope: active backlog/state source with docs/admin continuity updates

## Why This Refresh Happened Now

Recent landed work closed or narrowed multiple previously-open backlog threads:

- `PX-KI1`, `PX-KI2`, `PX-KI3`, `PX-KI4`, `PX-KI5`
- `P7-K8`, `P7-K9`, `P7-K10`
- `P7-K11`
- `P6-A7`, `P6-A8`, `P8-I12`
- `P9-S6`, `P9-S7`, `P9-S8`, `P9-S9`
- `DOC-D1`
- `P5-R13`

Without a single active backlog home, older per-phase "add to backlog" notes had become noisy, duplicated, or stale for day-to-day task selection.

## Active Backlog Home Decision

This file is the active backlog/state home for repo-owned planning.

Path choice: `docs/meta/BACKLOG.md` was selected because `docs/meta/` is already the stable traceability/navigation family. This avoids introducing a competing taxonomy (for example, a brand-new top-level planning family) and keeps backlog state out of `docs/source/`.

## Bucket Guide

- Recommended next: narrow, high-signal work that can start now
- Do soon: bounded follow-ups likely to matter soon
- Parked / trigger-based: valid work that should wait for explicit triggers
- Watchlist / guardrail: monitor and protect, do not auto-promote into build tasks
- Deep park / later: intentionally deferred, higher-blast-radius expansions
- Superseded / completed: backlog lines now closed by landed phases
- Needs preview check when implemented: likely UI-visible tasks requiring preview review

## Recommended Next

- `P5` follow-up (narrow): add one or two additional deterministic strategy-owned prepared stop/target reference sources and limitation phrasing variants where context is explicit; keep non-dispatching posture and existing unavailable reasons.

## Do Soon

- `P7` follow-up (narrow): run one bounded relevance review from `P7-K10` aggregate surfaced/acknowledged signals to decide whether any additional glossary alias coverage is justified.
- `P7` follow-up (narrow): implement `P7-K12` service-owned first-rollout Trade Hub term-help wiring from the `P7-K11` plan (`Stop-loss price`, `Target price`, active risk-basis label, and `Guardrails`) with no app-side matching.
- `P9` follow-up (narrow): capture real edge-case misses in nearby-alternative/metadata handling from post-`P9-S9` usage and scope a deterministic service-only tuning rung.
- docs/admin follow-up: perform another narrow narrative cleanup pass only after a new merge wave creates clear active-doc drift.

## Parked / Trigger-Based

- `P5` multi-target or laddered reward framing: parked until explicit product priority opens that lane.
- `P5` account-scoped prepared-reference preference settings: parked until a dedicated settings phase is approved.
- `P7` broader inline glossary surfaces (including Snapshot) and richer glossary affordances: parked until measured relevance justifies expansion.
- `P7` broader alias coverage beyond current seams: parked until signal review shows repeated unresolved terms.
- `P8` richer period/archive/journal variants: parked unless reflection-family prioritization explicitly promotes them.
- `P9` profile-aware disclosure defaults beyond current conservative progressive disclosure: parked until explicit product need.
- `P9` deeper fit-contrast-to-knowledge continuity wiring: parked until measured value outweighs density risk.

## Watchlist / Guardrail (Not Active Build Tasks)

- Preserve non-dispatching boundary: no order execution logic.
- Preserve calm posture: no ranking theatre, recommendation pressure, or urgency framing.
- Keep Snapshot Since Last Checked compact and non-inbox-like.
- Keep glossary help optional and non-gating.
- Keep strategy/navigation interpretation seams service-owned; app remains render-only.
- Keep estimated-vs-confirmed discipline explicit.
- Keep `docs/source/` as provenance-only and keep `docs/governance/CANON.md` untouched in docs/admin backlog passes.

## Deep Park / Later

- `P5` broader planning-tool expansion beyond thin support seams (full multi-target planning kits, settings-heavy control surfaces).
- `P8` export-management centers, AI reflection commentary, reminder/streak mechanics, and reporting-theatre expansions.
- `P9` leaderboard/ranking/recommendation-forward Strategy Navigator redesign.
- visible admin analytics surfaces for glossary signals; internal aggregate seams remain sufficient for now.

## Superseded / Completed Reconciliation

| Backlog thread previously repeated across phase notes | Reconciled status now | Closing evidence |
| --- | --- | --- |
| knowledge payload import + taxonomy reconciliation + register/catalog hygiene + Trade Hub risk-planning import + strategy/concept progressive-layer merge | completed | `PX-KI1`, `PX-KI2`, `PX-KI3`, `PX-KI4`, `PX-KI5` |
| contextual knowledge rollout, density shaping, linkage, and topic-detail context handoff on live surfaces | completed baseline | `P7-K4`, `P7-K5`, `P7-K6`, `P7-K7` |
| beginner inline glossary help + alias normalization + tuning hooks | completed baseline | `P7-K8`, `P7-K9`, `P7-K10` |
| Snapshot Since Last Checked surface + clear-after-view behavior + deeper archive continuity | completed baseline | `P6-A7`, `P6-A8`, `P8-I12` |
| Strategy Navigator fit contrast + nearby alternative heuristics + metadata normalization + mobile density refinement | completed baseline | `P9-S6`, `P9-S7`, `P9-S8`, `P9-S9` |
| docs map/index consistency cleanup after these landings | completed | `DOC-D1` |
| narrow active-doc narrative cleanup after backlog/state reconciliation | completed | `DOC-D3` |
| richer prepared stop/target references in Trade Hub service seams | partially completed; narrower follow-up remains active | `P5-R13` (with follow-up still in Do Soon/Parked) |

## Preview-Check Protocol

- Preview check required for visible hierarchy, density, layout, copy, or tap-through changes.
- Preview check not required for docs-only, tooling-only, or service-only changes unless user-visible behavior changes.
- Preview checks are guardrail validation, not a substitute for deterministic/service-layer verification.

## Needs Preview Check When Implemented

- Strategy Preview presentation refinements beyond current `P9-S9` disclosure hierarchy.
- Dashboard hierarchy changes that alter visible contextual knowledge placement.
- Trade Hub visible plan/risk card hierarchy or copy-layout adjustments.
- Snapshot Since Last Checked placement or section hierarchy adjustments.
- broader contextual knowledge/glossary surface expansion that adds new visible tap-through patterns.

## Deliberately Not Promoted In This Refresh

- No automatic promotion of parked `P5` multi-target/laddered planning.
- No automatic promotion of broad `P7` glossary surface expansion.
- No automatic promotion of richer `P8` archive/journal/reporting families.
- No automatic promotion of broad `P9` metadata and presentation expansion beyond bounded edge-case tuning.
