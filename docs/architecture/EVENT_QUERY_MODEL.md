# Event Query Model (P3-3)

## Purpose
`EventLedgerQueries` is the minimal typed retrieval seam over `EventLedger`.

It exists so product-facing services can deterministically read persisted event history without moving analytics, UI logic, or aggregation behavior into the ledger itself.

## Scope In This Phase
P3-3 adds a small set of explicit queries:
- `getEventsSince(timestamp)`
- `getEventsByStrategy(strategyId)`
- `getEventsByEventType(eventType)`
- `getEventsByAccountSince(accountId, timestamp)`

These functions:
- read from the canonical ledger order
- preserve append order in their results
- rely on the ledger's clone-on-read immutability guarantees
- return structured event data only

## Relationship To EventLedger
- `EventLedger` remains append-only and immutable.
- `EventLedgerQueries` does not own persistence.
- Query logic stays outside the ledger so storage and retrieval concerns remain separate.

## Relationship To Since Last Checked
`Since Last Checked` is the first product-facing preparation layer built on top of event queries.

In this phase it produces a structured payload:

```ts
{
  sinceTimestamp: number
  accountId?: string
  events: EventLedgerEntry[]
  summaryCount: number
}
```

This is preparation input for future Snapshot or Insights usage. It does not generate user-facing prose.

## Intentional Non-Goals
P3-3 does not add:
- analytics scoring
- insight dashboards
- exports
- journaling persistence
- background processing
- UI redesign
- narrative copy generation
