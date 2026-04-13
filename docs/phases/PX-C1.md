# PX-C1 - Strategy Fit / 30,000 ft View Foundation

## Why This Phase Happened Now
Snapshot already has a calm core triad.
P6 gave it one canonical subordinate briefing path.
P8 added a deeper interpreted-history family elsewhere in the product.

That made this the right moment for the first thin descriptive-context lane:
- one service-owned fit summary
- one service-owned broader-context VM
- one calm Snapshot affordance
- one opt-in detail path

PX-C1 happens now because PocketPilot has enough interpreted service seams to prepare broader context honestly, but it is still too early for a full regime engine, recommendation layer, or macro suite.

## What PX-C1 Added
- one canonical `StrategyFitSummary` and `ThirtyThousandFootVM` contract in `services/context/types.ts`
- one canonical descriptive fit builder in `services/context/createStrategyFitSummary.ts`
- one canonical broader-context builder in `services/context/createThirtyThousandFootVM.ts`
- one canonical fetch seam in `services/context/fetchThirtyThousandFootVM.ts`
- one Snapshot-owned affordance plus one opt-in `ThirtyThousandFootScreen`

The new path is:

`SnapshotVM -> StrategyFitSummary -> ThirtyThousandFootVM -> SnapshotSurfaceVM -> SnapshotScreen -> ThirtyThousandFootScreen`

## Descriptive Context Rules Locked In Here
PX-C1 establishes these rules:
- Strategy Fit is descriptive, not directive.
- Strategy Fit stays account-scoped and secondary to core alignment.
- 30,000 ft context is calm, opt-in, stabilising, and non-recommendatory.
- `services/` decides whether broader context is meaningful enough to surface.
- `app/` renders prepared title, summary, fit, and details only.
- `UNAVAILABLE` is better than filler, noise, or pseudo-macro commentary.
- raw signal codes, event IDs, strategy IDs, provider/runtime metadata, and action CTA fields stay out of user-facing context.

## What PX-C1 Deliberately Did Not Add
PX-C1 does not add:
- a regime engine
- global strategy alignment
- a switch recommendation engine
- push notifications
- background polling
- macro alerts or sirens
- AI-generated macro commentary
- action recommendations
- user settings for this lane
- a giant macro dashboard
- per-surface rollout beyond Snapshot and its opt-in detail path

## What Future Work Can Build On
Later work can safely deepen this lane with:
- richer interpreted volatility or structural seams when they already exist in services
- additional calm detail only when it remains sparse and stabilising
- broader rollout to other surfaces only after explicit phase scope
- future regime/context work that reuses this prepared lane instead of bypassing it in `app/`

Future work should deepen the same service-owned seam rather than creating competing alert, macro, or explanation systems.

## Related Cleanup Note
PX-MA4 later added a separate selected-account surface-context cleanup pass. That pass normalized account-context threading across Snapshot, Dashboard, Trade Hub, and related support seams through one shared service-owned helper.

It did not change the PX-C1 scope above.

## Recommendation Review
### Adopt Now
- Canonical fit and 30,000 ft contracts: they give PocketPilot one honest descriptive-context lane without widening into a regime engine.
- Snapshot-only affordance with an intentional open path: it keeps the broader read opt-in and subordinate instead of turning Snapshot into a command center.

### Add To Backlog
- Richer interpreted volatility and structural inputs: valuable later, but current service seams are not yet broad enough to justify a fuller macro payload.
- Wider surface rollout beyond Snapshot: useful eventually, but this phase keeps placement intentionally narrow so the lane can settle first.

### Decline For Now
- Recommendation logic or urgency treatment: it would violate the descriptive, stabilising posture this phase is meant to establish.
- User-editable settings for this lane: they would widen PX-C1 into controls and preferences before the core seam has matured.
