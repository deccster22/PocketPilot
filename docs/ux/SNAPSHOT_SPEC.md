# Snapshot Spec (P4-1)

## Purpose
`SnapshotModel` is the canonical shaping seam between `OrientationContext` and Snapshot-facing UI.

This phase does not define final rendering. It defines the strict structured model the Snapshot surface should consume so presentation stays calm, deterministic, and free of UI-owned interpretation logic.

## Canonical Model

```ts
type SnapshotModel = {
  core: {
    currentState: {
      price: number | null
      pctChange24h: number | null
      certainty: "confirmed" | "estimated" | null
    }
    strategyStatus: {
      alignmentState: string | null
      latestEventType: string | null
      trendDirection: "strengthening" | "weakening" | "neutral"
    }
  }
  secondary: {
    volatilityContext?: null
    strategyFit?: null
    contributingEventCount?: null
  }
  history: {
    hasMeaningfulChanges: boolean
    eventsSinceLastViewedCount: number
    sinceLastCheckedSummaryCount: number | null
  }
}
```

## Mapping From OrientationContext
- `core.currentState.price` maps from `orientationContext.currentState.latestRelevantEvent?.price`.
- `core.currentState.pctChange24h` maps from `orientationContext.currentState.latestRelevantEvent?.pctChange`.
- `core.currentState.certainty` maps from `orientationContext.currentState.certainty`.
- `core.strategyStatus.alignmentState` maps from `orientationContext.currentState.strategyAlignment`.
- `core.strategyStatus.latestEventType` maps from `orientationContext.currentState.latestRelevantEvent?.eventType`.
- `core.strategyStatus.trendDirection` is deterministically derived from the latest relevant event type, with alignment fallback when no latest event exists.
- `history.eventsSinceLastViewedCount` maps from `orientationContext.historyContext.eventsSinceLastViewed.length`.
- `history.sinceLastCheckedSummaryCount` maps from `orientationContext.historyContext.sinceLastChecked?.summaryCount`.
- `history.hasMeaningfulChanges` is true only when `eventsSinceLastViewedCount > 0`.

## Core vs Secondary vs History
- `core` is the three-part Snapshot center: current state, 24h change, and strategy status.
- `secondary` exists for later subordinate context only. P4-1 intentionally leaves these fields unset.
- `history` is count-based and compact. It supports re-entry awareness without flattening ledger history into the surface.

## What Snapshot Intentionally Excludes
- Raw signal arrays
- Raw indicator payloads
- Full event history lists
- Dashboard shaping
- Narrative prose generation
- Notification logic
- Analytics or scoring layers

## Data Flow
The Snapshot preparation chain is now:

`MarketEvent -> EventLedger -> Event queries -> Since Last Checked -> OrientationContext -> SnapshotModel -> UI`

`app/` should consume `SnapshotModel` for Snapshot-facing interpretation instead of recomputing meaning from scan or event internals.
