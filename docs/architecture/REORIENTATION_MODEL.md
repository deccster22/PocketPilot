# Reorientation Architecture Model (P6-R1)

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

`app/` does not interpret ledger events, signals, or snapshot internals to build this summary.

## Data Flow
The canonical path is:

`EventLedger -> EventLedgerQueries -> Since Last Checked -> OrientationContext -> SnapshotModel -> ReorientationSummary -> app`

This keeps the app on prepared, deterministic contracts and avoids event munging in UI code.

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

## Determinism Rules
- `createReorientationSummary` is pure and deterministic.
- No `Date.now()` is used inside the pure builder.
- No storage reads happen inside the pure builder.
- No network or provider work happens in `app/`.
- Profile sensitivity changes threshold and wording depth only.
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
