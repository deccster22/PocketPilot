---
title: "ORIENTATION_CONTEXT"
status: "draft"
owner: "founder"
doc_class: "model"
purpose: "Canonical PocketPilot documentation artifact"
depends_on: []
related_docs: []
canonical_path: "/docs/architecture/ORIENTATION_CONTEXT.md"
---

# ORIENTATION_CONTEXT.md

## Purpose
Defines the canonical context object that powers PocketPilot's re-entry and orientation surfaces.

## 1. Role
`OrientationContext` is the prepared state bundle that gives Snapshot and other scan-layer features a stable, strategy-aware, account-scoped read of "where things stand now."

It exists so the UI does not have to reconstruct interpretation ad hoc.

## 2. Core rule
**One prepared orientation object, many consumers.**

Snapshot should consume `OrientationContext`.
Since Last Checked may consume it.
Notifications may reference it.
Dashboard may inherit from it, but should not redefine it.

## 3. Suggested shape
`OrientationContext`
- `accountId`
- `strategyId`
- `profileId`
- `generatedAt`
- `currentState`
- `last24hChange`
- `strategyStatus`
- `fitState?`
- `volatilityContext?`
- `regimeContext?`
- `recentMeaningfulChanges[]`
- `topMarketEvents[]`
- `certaintyMeta`
- `presentationHints`

## 4. Invariants
- account-scoped by default
- strategy-shaped by default
- generated from canonical interpreted state
- never assembled in the presentation layer
- must preserve estimated vs confirmed boundaries
- must remain compact enough for scan-layer consumers

## 5. Producer inputs
Likely inputs:
- `StrategyContext`
- `StrategyStatusState`
- recent `MarketEvent` values
- 24h delta context
- fit / volatility / regime context
- certainty metadata

## 6. Consumer rules
### Snapshot
Consumes only the bounded scan-layer fields.

### Since Last Checked
Consumes `recentMeaningfulChanges` and related state.

### Notification landing
May use `OrientationContext` as the calm re-entry object after interruption.

### Dashboard
May inherit base orientation state, but expands beyond it.

## 7. Anti-patterns to block
- UI-side `OrientationContext` construction
- cross-account aggregation drift
- raw-indicator stuffing
- duplicate competing orientation objects

## 8. Testing expectations
- schema contract tests
- account-scope tests
- certainty preservation tests
- scan-layer size discipline tests

## 9. Relationship to other docs
Sits beside:
- `SNAPSHOT_OBJECT.md`
- `SNAPSHOT_SYSTEM.md`
- `STRATEGY_STATUS_ENGINE.md`
- `MARKET_EVENT_MODEL.md`
