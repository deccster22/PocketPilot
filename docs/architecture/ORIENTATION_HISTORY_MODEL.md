# Orientation History Model (P3-4)

## Purpose
`OrientationContext` is the structured assembly seam for Snapshot-facing orientation data.

It combines:
- current interpreted state from the latest scan pass
- the latest relevant current `MarketEvent`
- event history since the surface was last viewed
- the existing `Since Last Checked` payload

This seam exists so Snapshot and future re-entry surfaces consume one prepared object instead of rebuilding history context inside `app/` or duplicating orchestration across services.

In P4-1, `OrientationContext` remains the input seam for `SnapshotModel`. Snapshot shaping now happens after orientation assembly rather than inside `app/`.

## Why SnapshotService Should Not Own History Coordination
`snapshotService` is responsible for snapshot-specific orchestration:
- run the scan
- run strategies
- create market events
- build the snapshot view model

History coordination is a different concern.

If `snapshotService` also owns:
- latest relevant event selection
- last-viewed boundary lookup
- history payload assembly

then the same event-history stitching would be repeated for later consumers such as re-entry or insights preparation.

P3-4 moves that coordination into explicit orientation services so the boundary stays reusable and deterministic.

## Service Shape
The orientation seam is intentionally small:

- `createOrientationContext`
  Assembles the structured current-state and history payload.
- `selectLatestRelevantEvent`
  Deterministically selects the latest relevant `MarketEvent` without scoring heuristics.
- `lastViewedState`
  Defines ownership of last-viewed timestamps outside UI components.

## Output Shape
The seam produces a structured object with two concerns:

```ts
{
  accountId?: string
  symbol?: string
  strategyId?: string
  currentState: {
    latestRelevantEvent?: EventLedgerEntry | MarketEvent | null
    strategyAlignment?: string | null
    certainty?: "confirmed" | "estimated" | null
  }
  historyContext: {
    eventsSinceLastViewed: EventLedgerEntry[]
    sinceLastChecked?: {
      sinceTimestamp: number
      accountId?: string
      events: EventLedgerEntry[]
      summaryCount: number
    } | null
  }
}
```

The seam does not generate prose, explanations, analytics, or narrative summaries.

## Relationship To EventLedger And Queries
- `EventLedger` remains append-only and immutable.
- `EventLedgerQueries` remains the typed retrieval seam over ledger history.
- `Since Last Checked` remains the first preparation layer on top of event queries.
- `OrientationContext` assembles current snapshot state together with those history results for product-facing consumers.

The data flow is:

`EventStream -> EventLedger -> EventLedgerQueries -> Since Last Checked -> OrientationContext -> SnapshotModel -> Snapshot consumers`

In P6-R1 through P6-R5, reorientation and Snapshot briefing continue to extend the same spine:

`EventStream -> EventLedger -> EventLedgerQueries -> Since Last Checked -> OrientationContext -> SnapshotModel -> ReorientationSummary -> SnapshotBriefingState -> app`

P6-R5 keeps Since Last Checked and reorientation on that same prepared history spine and adds one explicit rule:
- Snapshot receives one subordinate briefing zone only
- `services/` decides whether that zone shows reorientation, Since Last Checked, or nothing
- `app/` does not rebuild history summaries or choose between candidates

## Last-Viewed Ownership
P3-4 adds a dedicated last-viewed boundary so UI components do not become the long-term owners of history lookup rules.

The current implementation is in-memory only, which is acceptable for this phase.
Later phases can replace that storage behind the same contract without moving history coordination back into the UI.

## Later Extensions
P3-4 intentionally stopped before reorientation copy generation.
P6-R1 adds `ReorientationSummary` above `OrientationContext` and `SnapshotModel` as a calm, optional return briefing seam.

That extension preserves the same rule:
- services own the prepared history contract
- app renders prepared contracts only

## Intentional Non-Goals
P3-4 did not add:
- journaling persistence
- narrative copy generation
- analytics or ranking heuristics
- notification delivery
- export logic
