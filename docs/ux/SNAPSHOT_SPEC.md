# Snapshot Spec

## Purpose
Snapshot is PocketPilot's calm, zero-scroll orientation surface. It consumes a prepared `SnapshotModel` from `services/snapshot` and does not interpret raw strategy output in `app/`.

P6-R2 adds the reorientation briefing as a subordinate Snapshot-only foreground element.
It remains optional, quiet, and secondary to the Snapshot core.

## Canonical Consumption Path
- `services/snapshot/snapshotService.ts` produces orchestration output and a prepared `model`.
- `services/snapshot/createSnapshotModel.ts` builds the canonical Snapshot model from deterministic scan output.
- `services/snapshot/createProfileAwareSnapshotModel.ts` applies profile-aware shaping at the service seam.
- `services/snapshot/fetchSnapshotSurfaceVM.ts` shapes Snapshot placement state, including reorientation visibility.
- `app/` reads the prepared Snapshot surface VM through the screen-facing helper in `app/screens/snapshotScreenView.ts`.

## Core vs Secondary Discipline
- Core fields are always present:
  - current state
  - last 24h change
  - strategy status
- Secondary fields are optional and subordinate:
  - bundle name
  - portfolio value
  - history cue
  - optional reorientation briefing card
- Secondary fields must never replace or visually outweigh the core orientation blocks.

## Reorientation Placement Rules
- Snapshot is the one canonical home for the welcome-back briefing in this phase.
- The card is inline and subordinate.
- The card appears only when the prepared surface VM marks it `VISIBLE`.
- Dismissal hides the card through explicit service-owned visibility state.
- Snapshot does not become an inbox, alert center, or notification system.

## Profile-Aware Shaping Rules
- Beginner:
  - canonical core stays fully visible
  - no secondary fields
  - no history cue exposure
- Middle:
  - canonical core stays fully visible
  - may expose compact secondary context already present in the model
  - currently limited to `portfolioValue`
- Advanced:
  - canonical core stays fully visible
  - may expose compact secondary context and a small history cue
  - currently limited to `bundleName`, `portfolioValue`, and optional history
  - still no dense supporting detail, raw indicators, or raw signal lists

## Intentional Exclusions
- raw strategy signal lists
- raw indicators
- charts
- notification delivery
- dashboard shaping
- prose generation beyond fixed UI labels
- top movers and top dips as primary Snapshot content

## Transitional Legacy Handling
`SnapshotVM` still carries legacy top-level bridge fields (`bundleName`, `portfolioValue`, `change24h`, `strategyAlignment`) for temporary compatibility and debug payload support. Snapshot consumers should prefer `snapshot.model`; bridge fields remain aligned until retirement is safe.
