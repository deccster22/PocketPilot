# Reorientation Architecture Model (P6-R5)

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

`EventLedger -> EventLedgerQueries -> Since Last Checked -> OrientationContext -> SnapshotModel -> ReorientationSummary -> ReorientationSurfaceState -> SnapshotBriefingState -> MessagePolicyAvailability -> SnapshotSurfaceVM -> app`

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
P6-R5 keeps that rule and adds one explicit service seam for briefing precedence so `app/` does not choose between reorientation and Since Last Checked.

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

P6-R5 adds the canonical Snapshot briefing seam:

```ts
type SnapshotBriefingState =
  | {
      status: 'HIDDEN'
      reason: 'NO_REORIENTATION' | 'NO_SINCE_LAST_CHECKED' | 'NO_MEANINGFUL_BRIEFING'
    }
  | {
      status: 'VISIBLE'
      kind: 'REORIENTATION' | 'SINCE_LAST_CHECKED'
      title: string
      subtitle?: string | null
      items: ReadonlyArray<{
        label: string
        detail: string
      }>
      dismissible: boolean
    }
```

P6-A1 adds the next seam above that briefing state:

```ts
type MessagePolicyAvailability =
  | {
      status: 'UNAVAILABLE'
      reason: 'NO_MESSAGE' | 'NOT_ENABLED_FOR_SURFACE' | 'INSUFFICIENT_INTERPRETED_CONTEXT'
    }
  | {
      status: 'AVAILABLE'
      messages: readonly PreparedMessage[]
    }
```

`services/messages` owns whether the prepared Snapshot briefing should remain a quiet `BRIEFING`, become a `REORIENTATION` note, or give way to a thin inline `ALERT`.
`app/` still renders prepared output only.

Precedence is intentionally boring and explicit:
- visible reorientation wins
- dismissed or otherwise hidden reorientation does not fall through to a second card
- Since Last Checked may render only when reorientation is not available
- otherwise the briefing zone stays hidden

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
Current-session dismissal follows the same cycle-boundary rule through the same visibility seam.
When a later eligible summary is built from a newer `lastActiveAt`, the old dismissal becomes stale and may be cleared.

P6-R4 keeps one canonical foreground refresh path:

`App lifecycle transition (background/inactive -> active) -> Snapshot screen refresh helper -> fetchSnapshotSurfaceVM -> ReorientationSurfaceState -> SnapshotSurfaceVM -> app`

This does not add background processing or a second fetch seam.
`app/` only detects the foreground transition and asks for the same prepared surface again.

## Determinism Rules
- `createReorientationSummary` is pure and deterministic.
- No `Date.now()` is used inside the pure builder.
- No storage reads happen inside the pure builder.
- Persistence adapters stay outside the pure builders and feed explicit inputs into service seams.
- No network or provider work happens in `app/`.
- Profile sensitivity changes threshold and wording depth only.
- Visibility shaping remains explicit input-driven.
- Message classification remains in `services/`, not `app/`.
- Identical inputs must produce identical outputs.
- Foreground refresh is lifecycle-driven only and does not hinge on screen-focus churn.

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
