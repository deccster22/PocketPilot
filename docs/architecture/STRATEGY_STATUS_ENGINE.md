---
title: "STRATEGY_STATUS_ENGINE"
status: "draft"
owner: "founder"
doc_class: "architecture"
purpose: "Canonical PocketPilot documentation artifact"
depends_on: []
related_docs: []
canonical_path: "/docs/architecture/STRATEGY_STATUS_ENGINE.md"
---

# STRATEGY_STATUS_ENGINE.md

## Purpose
Defines the computation layer that produces Strategy Status as a stable, canonical interpreted state across surfaces.

## 1. System role
Strategy Status is computed once in a canonical engine and consumed by Snapshot, Dashboard, alerts, and Insights.

## 2. Core rule
No surface invents Strategy Status locally.

## 3. Suggested inputs
- `StrategyContext`
- relevant `MarketEvent` values
- fit context
- certainty metadata
- account-scoped signal truth

## 4. Suggested pipeline
`SignalGraph` + `StrategyContext` + `FitContext` + `ConfidenceMetadata`
-> `StrategyStatusEngine`
-> `StrategyStatusState`

## 5. Output shape
`StrategyStatusState`
- `statusKey`
- `confidenceBand`
- `estimatedVsConfirmed`
- `rationaleTags[]`
- `changedAt`
- `presentationHint`

## 6. State rules
Top-level state must remain stable even if deeper lifecycle nuance exists underneath.

Possible top-level families:
- aligned
- forming
- neutral
- weak

Lifecycle detail may exist separately.

## 7. Hard constraints
- no recommendation output
- no raw indicator leakage into label text
- no profile-specific truth changes
- no cross-account aggregation drift

## 8. Consumption model
### Snapshot
compact state only

### Dashboard
state plus supporting rationale

### Notifications
state-transition events only when meaning changes materially

### Insights
historical state transitions as part of memory / reflection

## 9. Testing expectations
- state mapping tests
- certainty boundary tests
- cross-surface consistency tests
- account-scope tests

## 10. Relationship to other docs
Sits beside:
- `STRATEGY_STATUS_RULES.md`
- `SNAPSHOT_SYSTEM.md`
- `MARKET_EVENT_MODEL.md`
- `CONFIDENCE_LANGUAGE.md`
