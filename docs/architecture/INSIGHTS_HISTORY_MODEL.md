# Insights History Model (P8-I3)

## Purpose
PocketPilot now has one canonical Insights history family with two prepared shelves:
- `InsightsHistoryWithContinuityVM` for the top-level Insights shelf
- `InsightsArchiveVM` for the optional deeper detail/archive shelf

Together they let Insights answer two calm product questions:

`What meaningful interpreted history is new since I last viewed Insights?`

`If I go one layer deeper, what slightly richer interpreted archive is available?`

It does that without:
- turning `EventLedger` into a raw log dump
- pushing boundary comparison into `app/`
- inventing unread badges, inbox state, or notification theatre
- broadening into journaling, exports, compare-period tooling, or a raw archive browser

## Service Paths
Top-level read path:

`EventLedger -> EventLedgerQueries -> Since Last Checked (when available) -> OrientationContext -> createInsightsHistoryVM -> createInsightsContinuity -> fetchInsightsHistoryVM -> InsightsScreen`

Deeper archive read path:

`EventLedger -> EventLedgerQueries -> Since Last Checked (when available) -> OrientationContext -> createInsightsHistoryVM -> createInsightsContinuity -> createInsightsArchiveVM -> fetchInsightsArchiveVM -> InsightsDetailScreen`

Write path:

`InsightsScreen -> markInsightsHistoryViewed -> lastViewedState`

The backing timestamp store is still the shared `lastViewedState` seam, but Insights now consumes it only through explicit service-owned read/write helpers.

## Why It Consumes Interpreted Seams
PocketPilot already had the right ingredients:
- `MarketEvent` as the canonical interpreted unit
- `EventLedger` as append-only interpreted history
- `EventLedgerQueries` as deterministic retrieval
- `Since Last Checked` as the first recency groundwork
- `OrientationContext` as the prepared history assembly seam
- P8-I1's `createInsightsHistoryVM` as the first Insights history shaper

P8-I2 builds above those seams rather than bypassing them.
P8-I3 continues the same rule and reuses the same interpreted spine rather than creating a second history system.

That preserves four rules:
- history stays interpretation-first
- continuity is based on meaningful interpreted items, not raw event rows
- `services/` own boundary lookup, comparison, and summary wording
- `services/` also own deeper archive grouping, ordering, and selection fallback
- `app/` renders prepared contracts and records visits through one narrow service seam

## Contract Summary
P8-I3 keeps the contracts explicit and minimal:

```ts
type InsightsContinuityState =
  | 'NO_HISTORY'
  | 'NO_NEW_HISTORY'
  | 'NEW_HISTORY_AVAILABLE';

type InsightsLastViewedBoundary = {
  viewedAt: string | null;
};

type InsightsContinuitySummary = {
  state: InsightsContinuityState;
  viewedAt: string | null;
  newestEventAt: string | null;
  newItemCount: number;
  summary: string | null;
};

type InsightsHistoryWithContinuityVM = {
  generatedAt: string | null;
  availability: InsightsHistoryAvailability;
  continuity: InsightsContinuitySummary;
};

type InsightsDetailEntry = {
  title: string;
  summary: string;
  timestamp: string | null;
  symbol: string | null;
  eventKind: 'ALIGNMENT' | 'VOLATILITY' | 'STATE_CHANGE' | 'CONTEXT' | 'OTHER';
  detailNote: string | null;
};

type InsightsArchiveSection = {
  id: string;
  title: string;
  items: ReadonlyArray<InsightsDetailEntry>;
};

type InsightsArchiveVM = {
  generatedAt: string | null;
  availability: InsightsArchiveAvailability;
  selectedSectionId: string | null;
};
```

The contract intentionally excludes:
- raw signal codes
- event IDs
- strategy IDs
- provider/runtime diagnostics
- unread metadata
- engagement nudges
- moral framing

## Continuity Rules
P8-I2 continuity rules still apply unchanged:

Rules:
- `NEW_HISTORY_AVAILABLE` means newer interpreted history exists relative to the Insights boundary only
- `NO_NEW_HISTORY` is preferred over fake novelty when there is no useful distinction to make
- `NO_HISTORY` means meaningful interpreted history is not available yet on this surface
- `newItemCount` counts prepared interpreted items, not raw ledger events
- continuity copy stays factual and brief, not notification-like
- app never compares timestamps or decides what counts as new

## Archive Rules
P8-I3 adds one calm deeper shelf and keeps it narrow.

Rules:
- one canonical archive/detail contract only
- deeper means richer interpretation context, not raw ledger exhaust
- `detailNote` adds slightly more meaning, not technical payload
- fewer stronger sections are better than noisy completeness
- `services/` own archive grouping, ordering, and `selectedSectionId` fallback
- `app/` does not query ledger rows, group archive sections, or decide which section is valid
- archive can honestly be unavailable when interpreted history is too thin

## Relationship To Other Surfaces
- Snapshot keeps its current-state and briefing role.
- Dashboard keeps its focus and explanation role.
- Trade Hub remains execution-aware and non-dispatching.
- Insights keeps its top-level reflective shelf and now adds one subordinate deeper shelf.

That separation matters because Insights history is more reflective than Snapshot, but it should still stay thinner and calmer than an archive browser, inbox, or diagnostics console.

## Intentional Non-Goals
P8-I3 still does not add:
- journaling
- exports
- compare-period summaries
- archive search complexity
- year-in-review tooling
- behaviour scoring
- push notifications
- background polling
- AI-generated reflection
- raw diagnostic history
- a generic ledger browser
- unread badges or inbox metaphors
