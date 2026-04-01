# Reorientation Architecture Model (P6-R2)

## Purpose
`ReorientationSummary` is the service-owned seam for preparing an optional return briefing after a meaningful inactivity gap.

It extends the existing orientation/history spine without adding a parallel raw-data path.

## Service Ownership
Reorientation logic lives in `services/orientation`.

Responsibilities:
- decide eligibility
- apply profile-sensitive thresholds
- shape calm summary copy
- cap output at 3 items
- return an explicit `AVAILABLE` or `NOT_NEEDED` contract
- shape foreground visibility for the one canonical placement surface

`app/` does not interpret ledger events, signals, or snapshot internals to build this summary.

## Data Flow
The canonical path is:

`EventLedger -> EventLedgerQueries -> Since Last Checked -> OrientationContext -> SnapshotModel -> ReorientationSummary -> ReorientationSurfaceState -> SnapshotSurfaceVM -> app`

This keeps the app on prepared, deterministic contracts and avoids event munging in UI code.

## Canonical Placement Surface
P6-R2 chooses Snapshot as the one canonical foreground placement.

That means:
- no duplicate placement on Dashboard or Trade Hub
- no modal routing
- no notification center or inbox ownership
- no app-side placement heuristics

Snapshot owns display.
`services/` owns whether Snapshot should display anything at all.

## Contract Shape
The seam returns one of two explicit outcomes:

```ts
type ReorientationEligibility =
  | {
      status: 'NOT_NEEDED'
      reason: 'BELOW_THRESHOLD' | 'DISABLED_FOR_PROFILE' | 'NO_MEANINGFUL_CHANGE'
    }
  | {
      status: 'AVAILABLE'
      profileId: UserProfile
      inactiveDays: number
      headline: string
      summaryItems: ReadonlyArray<ReorientationSummaryItem>
      generatedFrom: {
        lastActiveAt: string
        now: string
      }
      maxItems: number
    }
```

This explicit status split prevents hidden UI heuristics and keeps the optional nature of the feature obvious.

P6-R2 adds a small placement seam above it:

```ts
type ReorientationSurfaceState = {
  status: 'HIDDEN' | 'VISIBLE'
  reason: 'NOT_NEEDED' | 'DISMISSED' | 'AVAILABLE'
  summary: ReorientationEligibility | null
  dismissible: boolean
}
```

`DISMISSED` may retain the underlying prepared summary contract while hiding the card.
P6-R3 keeps that contract stable and adds only a minimal persistence seam:

```ts
type ReorientationDismissState = {
  dismissedAt: string | null
}

type ReorientationDismissStore = {
  load(): Promise<ReorientationDismissState>
  save(state: ReorientationDismissState): Promise<void>
  clear(): Promise<void>
}
```

Persistence remains an edge concern.
The store only reads and writes dismissal state.
It does not decide thresholds, build summaries, or own screen placement.

The service path continues to derive visibility from explicit inputs.
Persisted dismissal is honored only when it still matches the current reorientation cycle.
When a later eligible summary is built from a newer `lastActiveAt`, the old dismissal becomes stale and may be cleared.

## Determinism Rules
- `createReorientationSummary` is pure and deterministic.
- No `Date.now()` is used inside the pure builder.
- No storage reads happen inside the pure builder.
- Persistence adapters stay outside the pure builders and feed explicit inputs into service seams.
- No network or provider work happens in `app/`.
- Profile sensitivity changes threshold and wording depth only.
- Visibility shaping remains explicit input-driven.
- Identical inputs must produce identical outputs.

## Copy and Safety Rules
- Output must remain calm and non-punitive.
- `Welcome back` is acceptable.
- No command language.
- No guilt or shame language.
- No urgency framing.
- No raw signal leakage.

## Intentional Non-Goals
P6-R1 does not add:
- order dispatch
- broker integration
- notifications
- background jobs
- inbox/feed mechanics
- a journal system
- a generic insights layer
