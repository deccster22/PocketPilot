# Dashboard Spec (P4-4)

## Purpose
Dashboard is PocketPilot's structured cross-asset surface for answering: "What matters most right now?" It is prepared in `services/dashboard` and rendered in `app/` without UI-owned ranking, filtering, or bucket selection.

## Surface Contract

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
    profile: UserProfile,
    hasPrimeItems: boolean,
    hasSecondaryItems: boolean,
    hasDeepItems: boolean
  }
}
```

`DashboardItem` remains display-safe and intentionally excludes raw signal payloads, scoring internals, metadata blobs, and execution details.

## Zone Rules
- Prime Zone contains only the highest-priority prepared items.
- Secondary Zone contains supporting items that remain relevant but are not the top immediate focus.
- Deep Zone contains lower-priority details that belong in a quieter, secondary layer.
- The surface must stay structured. Dashboard is not a flattened event feed.

## Profile Shaping
- Beginner receives the sparsest surface with fewer prime items and little to no secondary or deep density.
- Middle receives a balanced prime and secondary view with a compact deep layer.
- Advanced receives the fullest structured surface, but still through the same explicit zones.

Profile shaping changes density only. It does not change the deterministic ranking rules or expose extra raw data.

## Relationship To DashboardModel
- `DashboardModel` is the internal prioritised bucket model: `prime`, `secondary`, `background`.
- `DashboardSurfaceModel` is the presentation-facing contract: `primeZone`, `secondaryZone`, `deepZone`, plus `meta`.
- The mapping from `background` to `deepZone` happens in `services/dashboard/createDashboardSurfaceModel.ts`.
- `app/screens/dashboardScreenView.ts` may format prepared items for display text, but it does not reprioritise or re-bucket them.

## Intentional Exclusions
This phase does not add:
- charts
- raw signal lists
- analytics scoring
- journaling or exports
- notification delivery
- Snapshot redesign
- Trade Hub logic
- AI explanations
- persistence changes
