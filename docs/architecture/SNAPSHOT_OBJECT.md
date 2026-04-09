---
title: "SNAPSHOT_OBJECT"
status: "draft"
owner: "founder"
doc_class: "model"
purpose: "Canonical PocketPilot documentation artifact"
depends_on: []
related_docs: []
canonical_path: "/docs/architecture/SNAPSHOT_OBJECT.md"
---

# SNAPSHOT_OBJECT.md

## Purpose
Defines the canonical object rendered by the Snapshot surface.

## 1. Role
`SnapshotObject` is the exact view-facing model for Snapshot. It is derived from `OrientationContext` and exists to preserve zero-scroll, core-triad discipline.

## 2. Core rule
**Prepared upstream, rendered downstream.**

The UI renders `SnapshotObject`.
It does not derive strategy meaning locally.

## 3. Suggested shape
`SnapshotObject`
- `generatedAt`
- `accountId`
- `strategyId`
- `currentState`
- `last24hChange`
- `strategyStatus`
- `secondaryChips[]`
- `sinceLastChecked?`
- `profilePresentationHints`

### `currentState`
- compact state label / value
- optional calm cue metadata

### `last24hChange`
- delta value
- delta direction metadata
- optional compact wording hint

### `strategyStatus`
- `statusKey`
- `lightKey`
- `shortText`
- `certaintyMeta`

### `secondaryChips[]`
bounded array of subordinate elements such as:
- fit
- volatility context
- event marker count

### `sinceLastChecked`
- `maxItems`
- `collapsedIfEmpty`
- `items[]`

## 4. Invariants
- core triad always present
- zero-scroll compatible by design
- secondary chips are always removable without breaking core understanding
- no raw indicators
- no urgency metadata
- no recommendation fields

## 5. Assembly rules
Built by Snapshot assembler from `OrientationContext` and bounded presentation rules.

## 6. Anti-patterns to block
- expanding the object until it becomes a mini-dashboard
- profile-specific schema drift
- adding raw signal payloads
- embedding knowledge-link clusters

## 7. Testing expectations
- object contract tests
- secondary chip limit tests
- cross-profile schema consistency tests
- render safety tests

## 8. Relationship to other docs
Sits beside:
- `SNAPSHOT_SPEC.md`
- `SNAPSHOT_SYSTEM.md`
- `ORIENTATION_CONTEXT.md`
- `PROFILE_EXPLANATION_MODEL.md`
