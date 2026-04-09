---
title: "SNAPSHOT_SYSTEM"
status: "draft"
owner: "founder"
doc_class: "architecture"
purpose: "Canonical PocketPilot documentation artifact"
depends_on: []
related_docs: []
canonical_path: "/docs/architecture/SNAPSHOT_SYSTEM.md"
---

# SNAPSHOT_SYSTEM.md

## Purpose
Defines the system architecture that prepares Snapshot as a calm, zero-scroll re-entry model rather than letting the UI assemble state ad hoc.

## 1. System role
Snapshot is not computed in the view. It is rendered from a prepared orientation object.

## 2. Core rule
The architecture must preserve:
- core triad
- zero-scroll constraints
- strategy-first filtering
- profile-shaped phrasing
- meaning-change updates only

## 3. Suggested model
`OrientationContext` -> `SnapshotAssembler` -> `SnapshotModel` -> UI render

### Upstream inputs
- `StrategyContext`
- latest relevant `MarketEvent` values
- 24h delta context
- account scope
- fit / volatility subordinate context
- Since Last Checked summary object

### Output
`SnapshotModel`
- `currentState`
- `last24hChange`
- `strategyStatus`
- `secondaryChips[]`
- `sinceLastChecked`
- `profilePresentationHints`

## 4. Responsibilities by layer
### Event / context layer
Produces canonical interpreted truth.

### Assembler layer
Selects, compresses, and orders fields for Snapshot.

### Presentation layer
Renders the model only. No hidden logic, no local event interpretation.

## 5. Hard constraints
- no UI-side signal weighting
- no local certainty inflation
- no hidden fallback to raw indicators
- no model-shape drift by profile

## 6. Update behavior
`SnapshotModel` should refresh only on meaningful interpreted changes, not raw data churn.

## 7. Testing expectations
- contract tests for `SnapshotModel`
- zero-scroll layout tests
- strategy / profile / relevance filter tests
- certainty-label tests

## 8. Relationship to other docs
Sits beside:
- `SNAPSHOT_SPEC.md`
- `SNAPSHOT_OBJECT.md`
- `ORIENTATION_CONTEXT.md`
- `RELEVANCE_PRINCIPLE.md`
