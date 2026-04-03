# Insights History Model (P8-I1)

## Purpose
`InsightsHistoryVM` is PocketPilot's first canonical Insights / Event History contract.

It exists to give `P8` one calm, optional home for meaningful interpreted history without:
- turning `EventLedger` into a raw log dump
- pushing history assembly into `app/`
- inventing journaling, exports, or behaviour analytics too early

This phase is a thin foundation only.

## Service Path
The first history surface stays on the existing interpreted seam:

`EventLedger -> EventLedgerQueries -> Since Last Checked (when available) -> OrientationContext -> createInsightsHistoryVM -> fetchInsightsHistoryVM -> InsightsScreen`

If no `Since Last Checked` boundary exists, the same history contract still builds from the ledger and query seam without inventing a second UI-owned path.

## Why It Consumes Interpreted Seams
PocketPilot already has the right early ingredients:
- `MarketEvent` as the canonical interpreted unit
- `EventLedger` as append-only history memory
- `EventLedgerQueries` as deterministic retrieval
- `Since Last Checked` as the first recency boundary seam
- `OrientationContext` as the prepared history assembly seam above those layers

P8-I1 builds on those seams instead of bypassing them.

That preserves three important rules:
- history stays interpretation-first
- `services/` own meaning, grouping, and compression
- `app/` renders prepared sections and items only

## Contract Summary
The first contract is intentionally small:

```ts
type EventHistoryEntry = {
  title: string;
  summary: string;
  timestamp: string | null;
  symbol: string | null;
  eventKind: 'ALIGNMENT' | 'VOLATILITY' | 'STATE_CHANGE' | 'CONTEXT' | 'OTHER';
};

type EventHistorySection = {
  id: string;
  title: string;
  items: ReadonlyArray<EventHistoryEntry>;
};

type InsightsHistoryVM = {
  generatedAt: string | null;
  availability:
    | {
        status: 'UNAVAILABLE';
        reason:
          | 'NO_EVENT_HISTORY'
          | 'NOT_ENABLED_FOR_SURFACE'
          | 'INSUFFICIENT_INTERPRETED_HISTORY';
      }
    | {
        status: 'AVAILABLE';
        sections: ReadonlyArray<EventHistorySection>;
      };
};
```

The contract intentionally excludes:
- raw signal codes
- event IDs
- strategy IDs
- provider/runtime diagnostics
- behaviour scores
- moral framing

## Meaningful-History Rules
P8-I1 keeps the first surface narrow and honest.

Rules:
- fewer stronger entries are better than exhaustive completeness
- repetitive events should compress toward one clearer history note
- history should read like calm briefing notes, not developer logs
- if interpreted history is too thin, the surface should be unavailable rather than padded
- a top-level Insights/Event History screen is the only first consumer in this phase

## Relationship To Other Surfaces
- Snapshot keeps its current-state and briefing role.
- Dashboard keeps its focus and explanation role.
- Trade Hub remains execution-aware and non-dispatching.
- Insights becomes the first dedicated reflection/history shelf.

That separation matters because Event History is deeper and more reflective than Snapshot, but it should still stay thinner and calmer than a full archive browser.

## Intentional Non-Goals
P8-I1 does not add:
- journaling
- exports
- year-in-review summaries
- compare-period tooling
- behaviour scoring
- push notifications
- background polling
- AI-generated reflection
- raw diagnostic history
- a generic infinite ledger browser
