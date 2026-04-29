# DOC-D4 - CANON Status Refresh

Status: docs/admin authority-layer refresh  
Branch: `codex/doc-d4-canon-status-refresh`  
Base commit: `f162f7a5cb512327799d208af71d50204aef6ec0`  
Date: 2026-04-29

## Purpose

This pass refreshes `docs/governance/CANON.md` against current repo reality without reopening PocketPilot doctrine.

CANON remains the constitutional authority layer. `docs/phases/PHASE_MAP.md` remains the detailed implementation ledger. `docs/meta/BACKLOG.md` remains the active backlog/state home.

## Inputs Used

Project-source references:

- CANON v0.6 source refresh
- Architecture Overview v2 source refresh
- Documentation Map v3 source refresh
- Product Spec v0.3
- Product Compass
- Doctrine
- Guardrails v2
- Visual doctrine
- UX/UI doctrine and visual language brief
- Design System v0.1
- Knowledge Dev Map
- Backlog v3.2

Repo references:

- `docs/governance/CANON.md`
- `docs/phases/PHASE_MAP.md`
- `docs/meta/BACKLOG.md`
- recent merged PRs through `P7-K11`

## Findings

1. CANON doctrine was still sound. The North Star, Anti-Vision, account-scoped strategy posture, Snapshot sanctity, confidence discipline, and user-directed control model still matched the current build and source doctrine.

2. CANON status language was stale. The previous version still described repo reality using older checkpoints such as `P5-R5`, `P6-A4`, `P7-K3`, `P8-I4`, and `P9-S5`, while current repo truth extends to `P5-R16`, `P6-A8`, `P7-K11`, `P8-I12`, `P9-S9`, `PX-KI5`, and `DOC-D3`.

3. Prepared service-owned seams needed stronger authority recognition across Snapshot, Dashboard, Trade Hub, Insights, message policy, knowledge, context, and Strategy Preview surfaces.

4. Selected-account truth needed clearer locked-seam treatment. Alignment, fit, alerts, risk, message policy, Trade Hub support, and action-support truth remain selected-account scoped. Aggregate holdings/exposure remains subordinate context only.

5. Knowledge, Strategy Navigator, Insights, Since Last Checked, Trade Hub risk support, and visual doctrine needed current status recognition without claiming their broader families are complete.

## Changes Made

Updated `docs/governance/CANON.md` to:

- bump the visible version to v0.6
- add a v0.6 status refresh scope
- preserve North Star and Anti-Vision unchanged
- refresh Snapshot language to include compact Since Last Checked boundaries
- strengthen the non-dispatching Trade Hub posture
- clarify selected-account and aggregate-context rules
- recognize MarketEvent as both canonical interpreted contract and preferred UI atom
- update Knowledge and Strategy Preview / Navigator status through current repo reality
- add a high-level Visual and UX Doctrine section
- refresh Development Workstream Phasing
- add decision-register entries for P5, P6, P7, P8, P9, PX, UX, and DOC status alignment

## Deliberately Not Changed

This pass did not:

- rewrite PocketPilot's North Star
- rewrite Anti-Vision
- change the core account-scoped strategy philosophy
- promote parked backlog items
- claim P6, P7, P8, or P9 are complete
- duplicate the full `PHASE_MAP.md` ledger inside CANON
- move backlog authority out of `docs/meta/BACKLOG.md`
- change runtime, app, service, test, Figma, or knowledge-register files

## Follow-Up

Recommended future lanes remain separate:

1. `SPEC-A1` - Product / UX / Visual / Knowledge Drift Audit
2. Brand / logo visual audit

## Final Read

CANON did not need a new soul. It needed fresh boots, a current map, and a reminder that `PHASE_MAP.md` is the detailed ledger while CANON stays the constitutional layer.
