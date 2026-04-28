Title: PocketPilot Guardrails
Version: 2026-04-28 refresh
Source: docs/incoming/GUARDRAILS.pdf + active repo phase/docs audit
Last Updated: 2026-04-28

# PocketPilot Guardrails

This document defines the repo guardrails that protect PocketPilot's product posture, architecture boundaries, data integrity, and delivery discipline.

PocketPilot is a calm, strategy-first, execution-aware decision-support cockpit. These guardrails exist to stop the product drifting into signal spam, advice theatre, hidden automation, local UI logic, or brittle provider plumbing.

## Required Commands

- `npm run lint` must pass.
- `npm run test` must pass.
- `npm run validate:knowledge` must pass when knowledge docs/register/catalog assumptions are touched.
- `npm run verify` must pass before merge whenever normal workflow expects a green gate.
- `npm run verify` must include lint, tests, and the deterministic knowledge validation gate.
- Where architecture contracts exist, contract tests should be part of the verify path.
- Any future smoke or preview check must be additive and must not weaken the verify gate.

## Architectural Enforcement

### A. Import Boundaries

- `core/` contains no imports from `providers/` or `app/`.
- `app/` contains no direct imports from `providers/`; route through `services/` or prepared seams.
- ESLint restricted paths stay configured and active.
- Boundary tests must fail on violations.
- Provider response shapes must not leak directly into core strategy logic.
- UI narration rules must not be hardcoded inside deterministic core calculations.

### B. Determinism

- No `Date.now()` inside `core/`.
- No `Math.random()` inside `core/`.
- No network or file IO inside `core/`.
- Any `now` value is passed as an explicit argument into core functions.
- Deterministic model functions should remain side-effect free.
- Runtime adapters and app surfaces must consume prepared contracts rather than recreating interpretation locally.

### C. Service-Owned Prepared Contracts

- `services/` own interpretation, relevance filtering, message policy, risk preparation, account context, and surface VMs.
- `app/` renders prepared contracts.
- App surfaces must not infer strategy meaning from raw events, rank events locally, reconstruct account context, or compose risk/readiness logic.
- Prepared contracts should carry limitation, certainty, and unavailable-state information where relevant.
- If a surface needs new behaviour, add or extend a service-owned seam before rendering it.

### D. Provider Router And QuoteBroker Discipline

- QuoteBroker is the single entry point for quote fetching.
- Provider Router owns source selection, fallback logic, source-role discipline, and feed consistency.
- Source roles must not be semantically substituted across execution, reference, macro, and enrichment lanes.
- Budgets remain enforced per configured window.
- Instrumentation counters should record requests, symbols requested, symbols fetched, symbols blocked, degradation, and provider health where implemented.
- Execution-account feed selection must be explicit in relevant QuoteBroker call paths.
- Stale, blocked, estimated, or last-good quote state must carry metadata downstream rather than being treated as confirmed truth.

### E. Certainty And Estimated-State Labelling

- Quote and prepared-surface state must carry estimated/thin/unavailable certainty where relevant.
- UI never renders confirmed wording when `estimated=true` or context is insufficient.
- Copy that claims confidence, confirmation, readiness, or alignment strength must respect certainty metadata.
- Beginner-oriented messaging must not upgrade uncertain states into advice.
- Thin context should produce calm unavailable or limitation copy, not invented precision.

### F. Foreground-Only Constraint

- No background market polling is allowed under the current guardrails.
- No push notification triggers based on background polling.
- Scanning that depends on live market data occurs only while the app is open, unless CANON, Guardrails, and the relevant phase docs are explicitly revised first.
- Foreground-only scanning applies to alerts, Snapshot refresh, Since Last Checked generation, pattern/regime detection, and any live-polling-dependent support lane.
- Any future background monitoring proposal must be phase-gated and documented before implementation.

### G. Execution-Account And Account-Scoped Truth

- Strategy alignment uses the selected execution account's feed.
- No aggregated global strategy alignment is allowed.
- Fit, risk, alerts, message policy, Trade Hub support, and action-support state are account-scoped by default.
- Dashboard views remain account-scoped even where aggregate holdings or exposure context exists.
- Aggregate portfolio context may exist for holdings/exposure only; it must not become aggregate strategy, fit, alert, risk, or action truth.
- Account switching must be explicit and service-owned.

### H. Canonical Event Contracts

- `MarketEvent` is the canonical interpreted event contract.
- `EventLedger` stores market events and user action events in one coherent memory layer.
- No ad-hoc event shape may bypass canonical contracts without an explicit architecture decision.
- Event serialization, typing, and consumption should remain tested across Snapshot, alerts/message policy, Insights, Since Last Checked, and reflection seams.
- The ledger contextualises; it does not moralise.

### I. Snapshot Sanctity And Since Last Checked

- Snapshot remains zero-scroll.
- Snapshot core remains limited to Current State, Last 24h Change, and Strategy Status.
- Secondary chips or sections are allowed only if visually subordinate and quick to scan.
- No raw-indicator sprawl on Snapshot.
- No dramatic volatility sirens.
- Since Last Checked may sit as a separate calm Snapshot-adjacent briefing under Strategy Status.
- Since Last Checked must remain account-scoped, meaningful-change-only, compact, clear-after-view, and non-inbox-like.
- Deeper archive continuity belongs in Insights/history seams, not as a front-of-house feed.

### J. Message Policy, Alerts, And Calm Copy

- Alert/message behaviour is service-owned.
- Message families must not be collapsed or inferred locally in `app/`.
- Strategy alignment alerts are account-scoped.
- Risk and guarded-stop style messaging is account-scoped and descriptive.
- No global signal aggregation.
- No urgency language, fear framing, countdowns, ranking theatre, or action-pressure copy.
- User-visible rationale should explain why a message is present without exposing raw diagnostics or implementation jargon.

### K. Profile, Voice, And Knowledge Behaviour

- Profiles are system modifiers, not theme settings.
- Voice policy remains separate from strategy logic.
- Knowledge must be accessible, optional, non-intrusive, and non-gating.
- Contextual knowledge is selected and shaped in services.
- App surfaces render prepared knowledge lanes, topic routes, and glossary help.
- Beginner suggestions remain observational and educational rather than directive.
- Inline glossary help remains optional, low-clutter, and routed to existing topic detail paths.
- Glossary exposure/tuning hooks remain internal unless a later phase explicitly approves visible analytics.
- No auto-suggested profile progression, milestone theatre, or shame language.

### L. Trade Hub, Risk Support, And ProtectionPlan Safety

- Trade Hub is support-first and non-dispatching under current guardrails.
- SL/TP and risk tools calculate, frame, preview, and prepare; they do not enforce by default.
- `ProtectionPlan` remains platform-independent at the logic layer and capability-aware at the edge.
- Quick actions always require confirmation if/when introduced.
- Quick actions should be advanced-only or explicitly unlocked.
- Prepared stop/target/risk context must be honest, limitation-aware, and unavailable when context is thin.
- User-entered planning values remain authoritative where a user provides them.
- Guardrail evaluation is descriptive and non-blocking unless a future explicit opt-in enforcement mode is canonised.
- Hard enforcement modes, if ever allowed, must be explicit opt-in and phase-gated.
- Risk, regime, strategy, and account context must not silently collapse into one override engine.

### M. Strategy Navigator And Explanation Safety

- Strategy Preview / Strategy Navigator remains simulated, descriptive, and non-directive.
- Fit contrast may explain why one strategy lens fits current context better than nearby alternatives, but must not become a ranking engine, trading advice surface, or forced recommendation system.
- Nearby-alternative and metadata logic belongs in services.
- Mobile density and progressive disclosure refinements must preserve the same semantics while reducing reading load.
- Explanation seams should increase clarity, not confidence theatre.

### N. Insights, Reflection, Journal, And Exports

- Insights summaries contextualise without moralising.
- Compare-window, monthly, quarterly, annual, and archived readbacks remain descriptive.
- Journal notes stay optional, small, text-only, and context-linked under the current scope.
- Exports must state what they contain, preserve period/timezone clarity, and avoid exposing internal diagnostics.
- No streaks, reminders, scorekeeping, shame loops, or performance theatre.

### O. Knowledge Register And Docs Validation

- The active knowledge tree uses the family-based `docs/knowledge/<family>/` layout.
- `docs/knowledge/_register/CONTENT_REGISTER.csv` and related index/register docs must remain aligned with live files.
- Retired numbered shelf paths must not re-enter active navigation.
- Topic IDs must remain unique.
- `npm run validate:knowledge` must catch path, family, duplicate, and register drift before downstream runtime/docs work depends on bad metadata.

### P. Git Hygiene

- `.gitignore` includes `node_modules/`, `.expo/`, and `coverage/`.
- `node_modules` is not tracked by git.
- Git identity is configured for commits.
- GitHub Action Verify runs on PRs and pushes to `main` where configured.
- Branch protection should require pull request review/merge discipline and green verify status where available.
- Do not push directly to protected `main` unless the repository policy explicitly allows emergency recovery.
- Task branches should start from fresh `origin/main`.

### Q. Phase Gating And Documentation Alignment

- Any new feature must be scheduled in the phase/runbook model before implementation.
- Any new architecture object must be reflected in CANON or the relevant architecture docs before shipping.
- User-facing behaviour changes that affect tone, scope, safety, or surface expectations must update relevant product, UX, architecture, governance, and phase docs.
- Documentation-only phases must not imply runtime completion.
- `PX-*`, `DOC-*`, and `BL-*` tracks must remain honest support/admin lanes.
- Temporary experiments still respect anti-vision, determinism, account-scope, and calm-tone rules.

## Stop-The-Line Triggers

Do not proceed until resolved if a change introduces:

- Any boundary violation.
- A red verify gate.
- A new feature without phase/runbook placement.
- Global strategy alignment or non-selected-account strategy truth.
- Snapshot scroll, raw-indicator clutter, or urgency theatrics.
- Background polling or push-alert behaviour under current foreground-only constraints.
- Copy that commands action, shames behaviour, dramatizes volatility, or presents estimated/thin state as confirmed.
- Ad-hoc event shapes that bypass `MarketEvent` / `EventLedger` contracts.
- App-owned recomposition of prepared service contract meaning.
- Guardrail behaviour that silently blocks without explicit opt-in and canonised phase approval.
- Knowledge, glossary, or learning surfaces that gate product use.
- Trade Hub behaviour that dispatches live orders under the current non-dispatching posture.
- Reflection or export behaviour that becomes scorekeeping, moralising, or social-share theatre.

## Conflict Register

### Foreground-only vs future alerts

The long-term product vision includes richer alerting and calmer notification behaviour, but the current foreground-only rule intentionally limits scanning and notification-trigger behaviour. This remains a deliberate trust and complexity constraint.

### Snapshot enrichment vs Snapshot sanctity

Snapshot allows subordinate secondary chips or Since Last Checked only where they preserve zero-scroll calm and do not compete with the three-part core.

### Trade Hub support vs execution temptation

Trade Hub may prepare, explain, preview, and support user planning. It must not drift into hidden execution, one-tap action pressure, or order-terminal behaviour without explicit future phase approval.

### Knowledge support vs clutter

Knowledge and glossary help are valuable because they reduce confusion. They become harmful if they crowd live surfaces, gate action, or turn every screen into a wiki.

## Suggested Verification Matrix

- Boundary tests for import rules.
- Unit tests for deterministic core functions.
- QuoteBroker budget, window, role, and degradation tests.
- Contract tests for `MarketEvent`, `EventLedger`, and prepared service contracts.
- UI tests for estimated/thin/unavailable vs confirmed wording.
- UI tests for zero-scroll Snapshot on representative devices.
- Behaviour tests for beginner-safe, non-directive wording.
- Account-scoped alignment and selected-account tests.
- Trade Hub confirmation, readiness, non-dispatch, risk, and guardrail-status tests.
- Knowledge register validation and catalog hygiene checks.
- Smoke/preview checks for visible density, hierarchy, and copy changes where applicable.
