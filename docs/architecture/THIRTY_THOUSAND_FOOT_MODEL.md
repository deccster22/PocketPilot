# 30,000 ft Model (PX-C2)

## Purpose

`services/context/` owns PocketPilot's canonical broader-context lane.

The 30,000 ft View exists to:

- give the user a steadier broader read when interpreted conditions are genuinely more mixed or strained than usual
- stay opt-in and calm
- stabilise without recommending action

It does not exist to:

- become a siren
- become a macro dashboard
- replace Snapshot, Dashboard, or a later regime engine

## Contract

```ts
type ThirtyThousandFootAvailability =
  | {
      status: 'UNAVAILABLE';
      reason:
        | 'NO_MEANINGFUL_CONTEXT'
        | 'NOT_ENABLED_FOR_SURFACE'
        | 'INSUFFICIENT_INTERPRETED_CONTEXT';
    }
  | {
      status: 'AVAILABLE';
      title: string;
      summary: string;
      details: ReadonlyArray<string>;
    };

type ThirtyThousandFootVM = {
  generatedAt: string | null;
  fit: StrategyFitSummary;
  availability: ThirtyThousandFootAvailability;
};
```

Rules:

- one canonical broader-context contract
- no recommendation fields
- no action CTA fields
- no alert-center metadata
- no raw IDs or provider/runtime details

## Fetch And Build Path

PX-C2 uses one canonical service path:

`fetchSnapshotVM -> createPreparedContextInputs -> createStrategyFitSummary -> createThirtyThousandFootVM -> fetchThirtyThousandFootVM`

Snapshot then consumes that prepared VM through `fetchSnapshotSurfaceVM`.

## Availability Rules

PX-C2 keeps availability conservative:

- `NOT_ENABLED_FOR_SURFACE` when the requested surface should not carry this lane
- `INSUFFICIENT_INTERPRETED_CONTEXT` when richer interpreted truth is still too thin
- `NO_MEANINGFUL_CONTEXT` when the current picture is orderly enough that broader context would be noise
- `AVAILABLE` only when the current interpreted picture is meaningfully mixed or strained

This remains a relevance filter, not an alert threshold.

## Detail Rules

PX-C2 detail lines may include:

- volatility relative to recent conditions
- broader structure posture
- whether current fit is being supported or strained by that backdrop
- light historical grounding when Since Last Checked already supports it honestly

PX-C2 detail lines must not include:

- action advice
- urgency language
- raw signal identifiers
- provider/runtime internals

## App Boundary

`app/` may:

- render the prepared affordance
- render the prepared detail screen
- use fixed UI copy such as back buttons and section labels

`app/` may not:

- decide whether broader context is meaningful
- derive fit locally
- derive volatility or structural posture locally
- inspect raw signals, provider metadata, or runtime diagnostics to build context copy

## Relationship To Later Work

PX-C2 is the second rung of the broader context lane.
Later regime/context work should deepen this seam instead of bypassing it or cloning it into a second explanation or alert system.
