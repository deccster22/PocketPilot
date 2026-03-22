# Dashboard Model (P4-5)

## Purpose
`DashboardModel` is PocketPilot's structured answer to: "What matters most right now across my portfolio?"

It sits above shared deterministic surface assembly and remains shaped inside `services/dashboard` so React surfaces consume prepared service models instead of interpreting event streams in the UI.

## Output Shape

```ts
{
  prime: DashboardItem[]
  secondary: DashboardItem[]
  background: DashboardItem[]
}
```

`DashboardModel` remains the internal prioritised service model. The presentation-facing `DashboardSurfaceModel` stays unchanged:

```ts
{
  primeZone: {
    items: DashboardItem[]
  },
  secondaryZone: {
    items: DashboardItem[]
  },
  deepZone: {
    items: DashboardItem[]
  },
  meta: {
    profile: UserProfile
    hasPrimeItems: boolean
    hasSecondaryItems: boolean
    hasDeepItems: boolean
  }
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

## Upstream Seam Split
P4-5 gives Dashboard its own upstream seam in `services/dashboard/dashboardDataService.ts`.

The Dashboard path now looks like this:

```text
shared surface context -> dashboard data seam -> DashboardModel -> DashboardSurfaceModel -> app/
```

The shared surface context lives in `services/upstream/fetchSurfaceContext.ts` and is responsible for deterministic scan, strategy, event, ledger, and orientation assembly. Snapshot and Dashboard both reuse that shared upstream truth, but Dashboard no longer depends on `fetchSnapshotVM` or Snapshot-owned shaping.

## Relationship To Other Seams
- `MarketEvent` remains the canonical interpreted unit.
- `EventLedger` remains the append-only history store and preserves event order.
- `EventLedgerQueries` remains the retrieval seam for selecting relevant history.
- `OrientationContext` remains shared upstream truth for orientation-facing surfaces.
- `DashboardDataService` owns the Dashboard-specific upstream seam and prepares Dashboard input without routing through Snapshot service outputs.
- `DashboardModel` is shaped in `services/`; `DashboardSurfaceModel` is then created in `services/dashboard/createDashboardSurfaceModel.ts`.
- `app/` only renders the prepared surface contract and does not apply its own ranking or bucket logic.

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

The presentation mapping is also explicit:
- `prime` becomes `primeZone`
- `secondary` becomes `secondaryZone`
- `background` becomes `deepZone`

## Profile Shaping
- Beginner: one strongest item only
- Middle: compact prioritised set across all three buckets
- Advanced: full prioritised set

This shaping happens after prioritisation and remains inside `services/dashboard`. Profile differences affect density, not ranking rules or the underlying interpreted event logic.

## Snapshot Relationship
Snapshot remains the calm Scan-orientation surface for the current moment. Dashboard remains the Focus surface for prioritised interpreted changes across assets and strategies.

They may share upstream deterministic truth, but they now diverge before surface shaping:
- Snapshot builds `SnapshotModel` and Snapshot-specific bridge fields.
- Dashboard builds `DashboardModel` and `DashboardSurfaceModel`.
- Neither surface should route through the other's service output.

## Intentional Exclusions
This phase intentionally does not add:
- final Dashboard UI polish
- charts
- raw signal lists
- analytics scoring or fuzzy ranking
- journaling or `UserActionEvent` handling
- persistence changes
- notifications
