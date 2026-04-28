# Documentation Audit Refresh - 2026-04-28

Status: docs/admin audit
Branch: `codex/doc-audit-refresh-2026-04-28`
Base commit: `075cf6c900305ac0b8344dd40a744aa6fbdfcc2e`

## Purpose

This audit compares the active repo documentation against recent merged project reality and the current source-of-truth doctrine set.

The goal is not to reopen product doctrine. The goal is to identify stale navigation, stale guardrails, stale phase/status language, and docs that no longer reflect how the repo is actually being built.

## Source Material Used

Primary repo docs inspected:

- `README.md`
- `docs/README.md`
- `docs/governance/CANON.md`
- `docs/governance/GUARDRAILS.md`
- `docs/phases/PHASE_MAP.md`
- `docs/meta/BACKLOG.md`
- `docs/knowledge/README.md`
- `docs/founder/ARCHITECTURE_OVERVIEW.md`
- `docs/founder/DOCUMENTATION_MAP.md`
- `docs/meta/MASTER_INDEX.md`

Recent repo reality inspected:

- merged PRs through `#122`
- current phase ledger through `P5-R16`, `P6-A8`, `P7-K10`, `P8-I12`, `P9-S9`, `PX-KI5`, and `DOC-D3`

Source doctrine/context used as comparison material:

- Product Compass
- CANON v0.5
- Doctrine
- Architecture Overview
- Guardrails v2
- Product Specification v0.3
- Master Governance Pack v5
- Documentation Map v2
- Development Phase Reporting
- Knowledge Dev Map

## Audit Findings

### 1. Root README was stale

Finding:

- The root `README.md` still reflected the older April 1 repo-front-door model.
- `docs/README.md` had already become the live April 28 documentation entry point.
- The root README therefore risked sending new contributors through a less current mental model.

Action taken:

- Refreshed root `README.md` into a lighter repo foyer.
- Pointed it clearly to `docs/README.md` as the canonical documentation entry point.
- Added current phase reality through recent merged families.
- Added active backlog pointer to `docs/meta/BACKLOG.md`.
- Added quality gates including `npm run validate:knowledge`.

Status: refreshed in this branch.

### 2. Guardrails were significantly stale

Finding:

- `docs/governance/GUARDRAILS.md` still read like an early March checklist.
- It did not reflect prepared service contracts, account-scoped surface consistency, knowledge validation, Strategy Navigator safety, Since Last Checked behaviour, Trade Hub risk support, glossary seams, or newer reflection/export rules.
- This was the highest-risk documentation drift because guardrails are supposed to stop unsafe implementation patterns before they enter the repo.

Action taken:

- Rebuilt `docs/governance/GUARDRAILS.md` as a current guardrail document.
- Preserved the original enforcement posture while expanding it against current repo reality.
- Added sections for service-owned prepared contracts, account-scoped truth, message policy, Since Last Checked, Strategy Navigator, Knowledge/glossary, Trade Hub risk support, Insights/reflection/export, knowledge-register validation, and phase gating.
- Expanded stop-the-line triggers and verification matrix.

Status: refreshed in this branch.

### 3. Phase Map is current and should remain the phase authority

Finding:

- `docs/phases/PHASE_MAP.md` is already current as of 2026-04-28.
- It correctly records the distinction between numbered product families, `PX-*` support lanes, `DOC-*` docs/admin lanes, and `BL-*` backlog/state reconciliation.
- It is the cleanest source of actual merged implementation reality.

Action taken:

- No edit required.
- Root README now points to it as the live phase ledger.

Status: healthy; leave as authority.

### 4. Active backlog/state doc is current

Finding:

- `docs/meta/BACKLOG.md` is current as of 2026-04-28.
- It correctly records completed, narrowed, parked, watched, and recommended-next work after the recent merge wave.

Action taken:

- No edit required.
- Root README now points to it as the active planning state.

Status: healthy; leave as authority.

### 5. Knowledge README is current after PX-KI5

Finding:

- `docs/knowledge/README.md` already reflects the family-based knowledge tree.
- It includes `concepts`, `trade-hub`, register validation, PX-KI4, and PX-KI5.

Action taken:

- No edit required.

Status: healthy.

### 6. Architecture Overview is mostly current

Finding:

- `docs/founder/ARCHITECTURE_OVERVIEW.md` already reflects the newer service-owned prepared-contract spine.
- It correctly states that `services/` own truth and `app/` renders prepared contracts.

Action taken:

- No edit required.

Status: healthy.

### 7. CANON needs a narrow status refresh next

Finding:

- `docs/governance/CANON.md` remains philosophically sound.
- Its core doctrine still aligns with the source CANON and current repo posture.
- However, the Development Workstream Phasing and Decision Register still describe repo reality only through older checkpoints such as `P5-R5`, `P6-A4`, `P7-K3`, `P8-I4`, and `P9-S5`.
- Current repo reality now extends to `P5-R16`, `P6-A8`, `P7-K10`, `P8-I12`, `P9-S9`, and `PX-KI5`.

Action taken:

- Not rewritten in this branch to avoid turning a docs audit pass into a constitutional rewrite.
- The recommended next docs/admin task is a narrow CANON status addendum/update that changes phase-state and decision-register status only, without reopening doctrine.

Recommended next task:

- `DOC-D4 - CANON Status Refresh`
- Scope: update Development Workstream Phasing and Decision Register only.
- Do not rewrite North Star, Anti-Vision, core object definitions, or philosophical sections unless a direct contradiction is found.

Status: needs narrow follow-up.

### 8. Documentation Map / Master Index are mostly current but worth watching

Finding:

- `docs/founder/DOCUMENTATION_MAP.md` and `docs/meta/MASTER_INDEX.md` are broadly aligned with the current taxonomy.
- They may need a small follow-up if the team wants every latest product/UX/architecture helper doc listed with perfect coverage.
- This is lower-risk than Guardrails and root README because `docs/README.md`, `PHASE_MAP.md`, `BACKLOG.md`, and `knowledge/README.md` already carry the latest operational truth.

Action taken:

- No edit required in this branch.

Status: minor watchlist.

## Summary Of Changes Made In This Branch

Changed:

- `README.md`
- `docs/governance/GUARDRAILS.md`
- `docs/meta/DOC_AUDIT_REFRESH_2026_04_28.md`

Not changed intentionally:

- `docs/phases/PHASE_MAP.md`
- `docs/meta/BACKLOG.md`
- `docs/knowledge/README.md`
- `docs/founder/ARCHITECTURE_OVERVIEW.md`
- `docs/governance/CANON.md`
- `docs/founder/DOCUMENTATION_MAP.md`
- `docs/meta/MASTER_INDEX.md`

## Recommended Follow-Up

1. `DOC-D4 - CANON Status Refresh`
   - update phase-state wording and decision-register entries only
   - keep doctrine stable

2. `DOC-D5 - Index Coverage Tidy`
   - optional small pass over Documentation Map and Master Index
   - ensure latest helper docs are listed consistently

3. Future periodic audit trigger
   - run this style of audit after large merge waves involving 5+ PRs across different doc/product families
   - avoid constant doc churn after single narrow phases

## Final Read

The repo docs are not in crisis.

The main drift was asymmetric:

- phase/backlog/knowledge docs were fresh
- root README was stale as a front door
- Guardrails were stale as an enforcement document
- CANON is still doctrinally valid but needs a narrow status refresh

This branch fixes the two most immediately misleading surfaces and leaves the constitutional follow-up clearly scoped.
