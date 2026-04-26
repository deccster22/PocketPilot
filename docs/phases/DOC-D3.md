# DOC-D3 - Narrow Docs Narrative Cleanup

## Why This Phase Happened Now

`DOC-D1` reconciled docs maps/indexes and `DOC-D2` established one active backlog/state source.

After those rungs, several active docs still carried narrow stale narrative leftovers (for example, wording that described now-landed seams as future-only). DOC-D3 happened now as a light cleanup pass so active docs better match current landed reality without changing doctrine, runtime behavior, or historical phase records.

## What Narrative Drift Was Corrected

- updated active backlog-state anchoring language so `docs/meta/BACKLOG.md` reflects ongoing continuity after the DOC-D2->DOC-D3 handoff
- removed stale "future-only" framing where active docs were describing already-landed Trade Hub and event-history seams
- corrected phase-range labeling in active message-policy narrative to include landed `P6-A7` and `P6-A8`
- clarified event stream/query/ledger wording so Snapshot and Insights continuity usage is reflected as current baseline, not future-only intent
- kept wording around `P5-R13`, `P7-K8` to `P7-K10`, `P6-A7`/`P6-A8`/`P8-I12`, and `P9-S6` to `P9-S9` aligned with landed baselines plus honest follow-up posture

## What DOC-D3 Deliberately Did Not Rewrite

DOC-D3 does not:

- modify `docs/governance/CANON.md`
- modify anything under `docs/source/`
- change runtime/app/services behavior
- perform broad style rewrites with no drift signal
- rewrite old phase notes beyond adding this docs/admin phase record and PHASE_MAP row
- redesign taxonomy or create competing backlog files

## What Remains Deferred

Deferred by design:

- broader runtime follow-ups still tracked in `docs/meta/BACKLOG.md` (`P5`, `P7`, `P9` narrow follow-ups and parked items)
- larger reflection/reporting expansions and execution-adapter expansion lanes
- any future docs/admin cleanup pass unless another merge wave creates clear active-doc narrative drift

## Recommendation Review

### Adopt Now

- Keep docs/admin narrative cleanup passes narrow and evidence-driven.
- Keep `docs/meta/BACKLOG.md` as the active backlog/state source.

### Add To Backlog

- Another narrow docs/admin cleanup pass only when a future merge wave creates clear stale active-doc wording.

### Decline For Now

- Full docs taxonomy redesign framed as narrative cleanup.
- Broad historical phase-note rewrites that erase implementation context.
