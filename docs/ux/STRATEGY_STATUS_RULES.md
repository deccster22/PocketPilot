---
title: "STRATEGY_STATUS_RULES"
status: "draft"
owner: "founder"
doc_class: "ux-spec"
purpose: "Canonical PocketPilot documentation artifact"
depends_on: []
related_docs: []
canonical_path: "/docs/ux/STRATEGY_STATUS_RULES.md"
---

# STRATEGY_STATUS_RULES.md

## Purpose
Defines what Strategy Status is, what it is allowed to summarize, and how it should behave across surfaces.

## 1. Product role
Strategy Status is the most compact user-facing readout of "how things currently look for your strategy."
It is not:
- a recommendation
- a prediction
- a raw-signal dump
- a confidence costume

It is the main compressed interpretation state.

## 2. Non-negotiables
- strategy-shaped
- account-scoped
- confidence-honest
- calm
- non-directive
- canonical across Snapshot / Dashboard / Alerts / Insights

## 3. Canonical inputs
Strategy Status should be derived from:
- `StrategyContext`
- canonical interpreted event state
- fit / regime context where relevant
- certainty metadata
- account-scoped signal truth

The UI must not invent its own Strategy Status.

## 4. State family
PocketPilot sources consistently point to states like:
- aligned
- forming
- neutral
- weak

Lifecycle-aware contexts may also use:
- forming
- developing
- confirming
- resolved
- invalidated

Product rule:
use a **stable top-level Strategy Status layer** even if deeper lifecycle / state nuance exists underneath.

## 5. Snapshot behavior
On Snapshot, Strategy Status must be:
- short
- instantly scannable
- paired with a status light or equivalent
- limited to brief phrasing

It is part of the sacred core triad.

## 6. Dashboard behavior
On Dashboard, Strategy Status may be expanded with:
- short rationale
- supporting contributing signals
- fit or volatility context
- lifecycle state

But the expansion must remain subordinate to the deeper workspace, not become prose sprawl.

## 7. Alert behavior
Strategy Status changes may trigger passive indicators or bounded notices when meaning changes materially.
No raw signal changes should bypass Strategy Status logic to become user-facing importance.

## 8. Profile shaping
### Beginner
- fuller explanation
- plain language
- observational, not directive

### Intermediate
- contextual strategy-aware phrasing

### Advanced
- compressed observation

Same state. Different phrasing density.

## 9. What Strategy Status must never become
- trade advice
- a morality rating
- a global market opinion
- a substitute for fit / regime / context nuance
- a "good / bad" mood sticker divorced from strategy meaning

## 10. Mapping rules
The app should preserve distinction between:
- alignment state
- fit state
- regime state
- confidence / certainty
- Strategy Status

Strategy Status may summarize, but it must not collapse all of these into one hidden override engine.

## 11. Example output posture
Good:
- "Alignment strengthening"
- "Neutral"
- "Conditions are mixed for your strategy"
- "Weakening"

Bad:
- "Great buy"
- "High-probability entry"
- "Do not miss"
- "Strong market"

## 12. Testing expectations
- state mapping tests
- certainty language tests
- cross-surface consistency tests
- account-scope tests
- profile phrasing tests

## 13. Anti-patterns to block
- status inflation
- hidden recommendation drift
- global alignment drift
- overloading status with too much nuance
- ambiguous wording that sounds cleaner than the underlying evidence

## 14. Relationship to other docs
Sits beside:
- `PROFILE_EXPLANATION_MODEL.md`
- `CONFIDENCE_LANGUAGE.md`
- `RELEVANCE_PRINCIPLE.md`
- `SNAPSHOT_SPEC.md`
- `DASHBOARD_EXPOSURE_RULES.md`
- `STRATEGY_STATUS_ENGINE.md`
