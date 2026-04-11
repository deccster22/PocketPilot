---
title: "EVENT_SYSTEM"
status: "draft"
owner: "founder"
doc_class: "model"
purpose: "Canonical PocketPilot documentation artifact"
depends_on: []
related_docs: []
canonical_path: "/docs/architecture/EVENT_SYSTEM.md"
---

# EVENT_SYSTEM.md

## Purpose
Defines the system that produces, normalizes, stores, and routes PocketPilot's canonical events.

## 1. Role
The Event System is the backbone that turns interpreted market and user-action meaning into stable event objects for all downstream consumers.

## 2. Core rule
**One event pipeline, many consumers.**

## 3. Suggested pipeline
`Signals / context`
-> `Interpretation layer`
-> `MarketEvent / UserActionEvent producers`
-> `EventNormalizer`
-> `EventStore / EventLedger`
-> consumer assemblers and routers

## 4. Event classes
- `MarketEvent`
- `UserActionEvent`

## 5. System responsibilities
- produce canonical interpreted events
- normalize schema
- deduplicate overlapping events
- persist event history
- expose query interfaces
- support downstream assembly for Snapshot, Dashboard, notifications, summaries, and reflection

## 6. Hard constraints
- no direct raw-indicator-to-user pipeline
- no multiple shadow event systems
- no event mutation in presentation layer
- no blending user-authored reflection into canonical event truth

## 7. Consumers
- Snapshot assembler
- Dashboard assembler
- Notification router
- Event Ledger query layer
- summary generators
- asset narrative generator
- Trade Hub support layers where relevant

## 8. Anti-patterns to block
- parallel ad hoc event stores
- duplicate event semantics across teams
- UI-generated event logic
- event histories that cannot support summaries consistently

## 9. Testing expectations
- producer / normalizer consistency tests
- store / query correctness tests
- consumer contract tests
- deduplication tests

## 10. Relationship to other docs
Sits beside:
- `MARKET_EVENT_MODEL.md`
- `EVENT_LEDGER_ARCHITECTURE.md`
- `STRATEGY_STATUS_ENGINE.md`
- `NOTIFICATION_ROUTER_MODEL.md`
