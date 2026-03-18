# Event Stream Model (P3-1)

## Purpose
`EventStream` is the minimal handoff seam for ordered `MarketEvent` output in PocketPilot P3-1. It is intentionally ephemeral and non-persistent.

## Relationship To Other Concepts
- Signals are inputs to interpretation.
- `MarketEvent` is the canonical interpreted unit.
- `EventStream` is the ordered in-memory sequence of `MarketEvent` objects produced during a scan/interpretation pass.
- `EventLedger` is a future persistence layer and is not implemented in P3-1.

## Current Shape
The service seam lives at [services/events/eventStream.ts](D:/PocketPilot_Code/PocketPilot/services/events/eventStream.ts).

Current fields:
- `accountId`: account scope for the stream.
- `timestamp`: stream generation timestamp.
- `events`: deterministically ordered `MarketEvent[]`.

Ordering rules:
- Sort by `timestamp` ascending.
- Break ties by `eventId` ascending.

## Why This Exists Now
The stream seam lets services hand off interpreted meaning earlier in the flow without introducing persistence or background infrastructure. This keeps Snapshot and future consumers aligned on one event-driven contract.

## Non-Goals In P3-1
- No storage/database.
- No replay system.
- No user action events yet.
- No subscriptions/background dispatch.
- No ledger reconciliation.
