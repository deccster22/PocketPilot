# Dashboard Model (P4-3)

## Purpose
`DashboardModel` is PocketPilot's structured answer to: "What matters most right now across my portfolio?"

It sits above `OrientationContext` and `MarketEvent` history preparation. The seam lives in `services/dashboard` so React surfaces consume an already-prioritised model instead of interpreting event streams in the UI.

## Output Shape

```ts
{
  prime: DashboardItem[]
  secondary: DashboardItem[]
  background: DashboardItem[]
}
```

Each `DashboardItem` contains only explicit display-safe fields:

```ts
{
  symbol?: string
  accountId?: string
  strategyId?: string
  eventType: string
  alignmentState?: string
  trendDirection?: 'strengthening' | 'weakening' | 'neutral'
  certainty?: 'confirmed' | 'estimated'
  timestamp: number
}
```

## Relationship To Other Seams
- `MarketEvent` remains the canonical interpreted unit.
- `EventLedger` remains the append-only history store and preserves event order.
- `EventLedgerQueries` remains the retrieval seam for selecting relevant history.
- `OrientationContext` provides current account/asset context that can enrich dashboard items without duplicating Snapshot logic.
- `DashboardModel` is shaped in `services/`; `app/` only renders the prepared structure.

## Prioritisation Rules
The initial prioritisation is intentionally explicit and deterministic:
- newer events sort ahead of older events
- `strengthening` or `weakening` trends sort ahead of `neutral`
- `confirmed` certainty sorts ahead of `estimated`
- explicit interpreted event types sort ahead of generic `PRICE_MOVEMENT`
- stable string tie-breakers keep ordering deterministic when all higher-order rules tie

Classification into buckets is also explicit:
- `prime`: non-neutral and confirmed
- `secondary`: relevant but not urgent; includes non-neutral estimated items, confirmed neutral items, and explicit event types
- `background`: informational remainder

## Profile Shaping
- Beginner: one strongest item only
- Middle: compact prioritised set across all three buckets
- Advanced: full prioritised set

This shaping happens after prioritisation and remains inside `services/dashboard`.

## Intentional Exclusions
This phase intentionally does not add:
- final Dashboard UI layout
- charts
- raw signal lists
- analytics scoring or fuzzy ranking
- journaling or `UserActionEvent` handling
- persistence changes
- notifications

## Snapshot Relationship
Snapshot remains the calm, canonical orientation surface for the current moment. Dashboard complements it by surfacing prioritised interpreted events across assets and strategies without turning Snapshot into a feed.
