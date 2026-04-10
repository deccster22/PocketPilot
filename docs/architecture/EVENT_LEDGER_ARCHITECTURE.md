---
title: 'EVENT_LEDGER_ARCHITECTURE'
status: 'draft'
owner: 'founder'
doc_class: 'architecture'
purpose: 'Canonical PocketPilot documentation artifact'
depends_on: []
related_docs: []
canonical_path: '/docs/architecture/EVENT_LEDGER_ARCHITECTURE.md'
---

# EVENT_LEDGER_ARCHITECTURE.md

## Purpose

Defines Event Ledger as the canonical event-memory architecture for market and user action events.

## 1. System role

Event Ledger is the memory spine beneath:

- Since Last Checked
- Reorientation
- monthly / quarterly summaries
- summary archive
- asset narrative
- review surfaces
- action-context reflection

## 2. Core rule

One canonical event memory layer, not multiple shadow histories.

## 3. Suggested model

`CanonicalEventProducer`
-> `EventNormalizer`
-> `EventLedgerStore`
-> `LedgerQueryLayer`
-> consumer surfaces

## 4. Event classes

- market event
- user action event

Each event should carry:

- event id
- event class
- timestamp
- account
- strategy
- symbol / asset
- alignment / signal context where relevant
- payload

## 5. Query consumers

- Since Last Checked assembler
- Reorientation assembler
- Summary generator
- Monthly / quarterly summary builder
- Summary archive assembler
- Asset narrative generator
- Event Ledger view model
- Log / Journal attachment layer

## 6. Hard constraints

- no ad hoc event formats outside canonical contract
- no duplication of truth across separate history stores
- no view-layer mutation of event meaning
- no merging user reflection into canonical event truth
- no scorecard or analytics-theatre reshaping inside ledger consumers
- no app-side rebuilding of summary archive cards from raw ledger rows

## 7. Architecture responsibilities

### Producer layer

Emits interpreted canonical events.

### Normalizer

Ensures schema consistency.

### Store

Persists event history.

### Query layer

Provides filtered grouped views for surfaces.

### Attachment layer

Allows optional user notes to reference, not overwrite, canonical events.

## 8. Retention and export posture

Ledger must support:

- event-level export
- grouped summary generation
- account-scoped and strategy-scoped filtering
- stable references for user-note linkage

## 9. Testing expectations

- event schema tests
- producer / normalizer consistency tests
- query correctness tests
- export integrity tests
- note attachment separation tests

## 10. Relationship to other docs

Sits beside:

- `EVENT_LEDGER_MODEL.md`
- `EVENT_SYSTEM.md`
- `EVENT_LEDGER_VIEW_MODEL.md`
- `LOG_AND_JOURNAL_MODEL.md`
- `ASSET_NARRATIVE_MODEL.md`
