# DOC-D1 - Docs Map / Index Consistency Pass

## Why This Phase Happened Now

Recent landed work changed active documentation reality across multiple families:

- knowledge import + taxonomy reconciliation (`PX-KI1`, `PX-KI2`, `PX-KI3`)
- inline glossary/help rollout and follow-through (`P7-K8`, `P7-K9`, `P7-K10`)
- Snapshot Since Last Checked continuity (`P6-A7`, `P6-A8`, `P8-I12`)
- Strategy Navigator maturation (`P9-S6`, `P9-S7`, `P9-S8`, `P9-S9`)

That left a narrow but important drift risk in active maps/indexes and navigation wording.

DOC-D1 reconciles those active docs surfaces without changing product/runtime behavior.

## What DOC-D1 Reconciled

- active glossary README metadata/path (`docs/knowledge/glossary/README.md`)
- active traceability matrix phase references (`docs/meta/DOC_TRACEABILITY_MATRIX.md`)
- active Strategy Preview phase-roadmap wording to reflect landed `P9-S6` through `P9-S9` (`docs/product/STRATEGY_PREVIEW.md`)
- phase taxonomy/ledger visibility for this docs/admin rung (`docs/phases/PHASE_MAP.md`)

## What DOC-D1 Deliberately Did Not Change

DOC-D1 does not:

- modify `docs/governance/CANON.md`
- modify anything under `docs/source/`
- add app/runtime behavior or service logic
- import new external content packs
- perform broad doctrine rewrites
- redesign the docs taxonomy
- create a second documentation truth tree

## Remaining Backlog After DOC-D1

- broader non-critical wording cleanup for older placeholder-style phrasing in non-index docs
- optional future pass to normalize stale phase-range shorthand in additional narrative docs outside index/map surfaces
- larger taxonomy/structure redesign work remains explicitly out of scope for this pass

## Recommendation Review

### Adopt Now

- Keep docs/index reconciliation passes small and phase-scoped after major landed doc/runtime milestones.
- Keep stable repo docs as active canonical truth and `docs/source` as provenance only.

### Add To Backlog

- Follow-on low-risk cleanup for remaining stale narrative references outside core map/index docs.

### Decline For Now

- Full docs tree redesign in this phase.
- Broad doctrine rewrites framed as index cleanup.
