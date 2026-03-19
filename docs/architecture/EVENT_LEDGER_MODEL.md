# Event Ledger Model (P3-2)

## Purpose
`EventLedger` is PocketPilot's persistent event history seam for interpreted events. In P3-2 it stores `MarketEvent` entries so services can retain history for debugging, future reflection features, and later insight generation without adding analytics or UI logic.

In P3-3 it remains the append-only storage seam while product-facing retrieval moves into a separate query layer.

## Relationship To MarketEvent
- `MarketEvent` remains the canonical interpreted unit.
- `EventLedgerEntry` currently stores `MarketEvent` instances exactly as emitted.
- Events are immutable once created and must not be mutated after append.
- `UserActionEvent` is defined as a stub contract for a later phase but is not yet persisted by the current service implementation.

## Relationship To EventStream
- `EventStream` remains the ordered live handoff seam for each scan pass.
- `EventLedger` persists events from `EventStream`; it does not replace or bypass it.
- The current integration appends `eventStream.events` in stream order so persisted history matches emitted order deterministically.

## Relationship To Event Queries
- `EventLedger` owns persistence and immutability protection.
- `EventLedgerQueries` owns typed retrieval for product-facing services.
- Query functions must preserve canonical append order and must not mutate stored entries.
- Since Last Checked preparation consumes query results; it is not implemented inside the ledger.

## Current Service Shape
The initial service lives at [eventLedgerService.ts](D:/PocketPilot_Code/PocketPilot/services/events/eventLedgerService.ts).

Current responsibilities:
- append one or many `MarketEvent` entries
- expose canonical full-history reads for the query seam
- retrieve by `accountId`
- retrieve by `symbol`
- retrieve recent entries by append order

Current design constraints:
- in-memory only for this phase
- swappable behind the `EventLedger` contract
- clone-on-write and clone-on-read for immutability protection

## Why This Exists Now
The ledger creates a single persistence spine for:
- history
- debugging
- future user reflection
- future insights inputs

It intentionally does not add:
- analytics or scoring
- aggregation dashboards
- export tooling
- retention policies
- AI interpretation
- query-time aggregation or narrative generation

## Future Role
Later phases can build on this seam for:
- user action journaling
- event reflection timelines
- insight generation from historical sequences
- reconciliation or export flows

Those extensions must preserve deterministic ordering, immutable event records, and clean separation from UI concerns.
