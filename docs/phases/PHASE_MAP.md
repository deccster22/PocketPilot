# PocketPilot Phase Map

Phase: `PX-PM1`  
Last updated: 2026-04-05

## Purpose
This document reconciles PocketPilot's overlapping phase lenses so future work can name phases honestly without erasing the actual implementation sequence.

The problem it solves:
- CANON uses one numbered product roadmap (`P0` through `P11`).
- Product Spec v0.3 also contains macro phases plus an older detailed workstream numbering scheme.
- Governance Pack planning uses phase labels for documentation maturity.
- Forward-planning docs introduce valid side tracks that are not meant to read as one linear numbered march.
- Historical implementation reports record the order work actually merged, including side families and cleanup passes.

Use this file as the repo's canonical phase taxonomy and audited phase ledger.

## Taxonomy Rules
- `P#` = canonical product workstream family used for the current implementation roadmap.
- `P#-subphase` = scoped work inside one canonical product family.
- Completing a `P#-subphase` does not mean the whole `P#` family is complete.
- `PX-*` = cross-cutting, platform, runtime, hardening, cleanup, doctrine, support, audit, or reconciliation work.
- `PX-*` phases may happen before, after, or alongside numbered product families.
- PX completion never implies completion of intervening numbered families.
- Historical implementation order stays visible in ledgers and handovers; do not rewrite it into fake sequentiality.
- When older source docs use alternate phase numbering, translate them into the canonical family before naming new repo work, branches, or docs.

## Planning Lenses And How To Read Them
| Lens | Keep as | How to use now |
| --- | --- | --- |
| CANON v0.5 and current markdown roadmap | Canonical product roadmap | Source of truth for `P0` through `P11` family labels |
| Product Spec macro phases | Macro roadmap lens | Valid for stakeholder summaries, not for branch or phase labels |
| Product Spec v0.3 detailed workstreams | Historical planning lens | Translate into canonical families before using in repo work |
| Governance Pack doc-development list | Documentation maturity lens | Useful for doc gaps, not for implementation-status claims |
| Forward Phase Planning side quests | Strategic side-track lens | Usually becomes `PX-*` or an explicit `P#-subphase` when landed |
| Development Phase Reporting | Historical implementation ledger | Use to audit what actually merged and in what rough sequence |

## Canonical Product Workstream Families
This preserves the current CANON family roadmap and is the authoritative numbered sequence for new implementation labels.

| Family | Canonical focus |
| --- | --- |
| `P0` | Vision, doctrine, architecture, and repo-discipline foundation |
| `P1` | Strategy engine foundations |
| `P2` | Snapshot, provider, governance, and debug-observatory foundation |
| `P3` | Event system and orientation layer |
| `P4` | Snapshot and Dashboard UX shaping |
| `P5` | Trade Hub and `ProtectionPlan` |
| `P6` | Alerts and message policy |
| `P7` | Knowledge baseline |
| `P8` | Insights, Event Ledger, Since Last Checked, and reorientation/reflection family work |
| `P9` | Pattern Navigator, Strategy Navigator, and richer explanation layer |
| `P10` | Beta hardening |
| `P11` | Launch prep |

## Product Spec Detailed Workstream Crosswalk
Product Spec v0.3 remains useful context, but its detailed workstream numbering is not the current repo label source.

| Product Spec v0.3 label | Read as now | Notes |
| --- | --- | --- |
| `Phase 1 - Strategy Engine` | `P1` | Same product family, older numbering |
| `Phase 2 - Snapshot Experience` | `P2` plus `P4` | Foundation landed in `P2`; later Snapshot shaping lives in `P4` |
| `Phase 3 - Explanation Layer` | Future `P9` family or `PX-E*` for early cross-cutting groundwork | Do not reuse `P3` for explanation work in repo labels |
| `Phase 4 - Event System` | `P3` | Canonical event and orientation spine |
| `Phase 5 - Portfolio Context` | Mostly `P8` | Some enabling seams landed early in `P3` and `P6`, but the family is not complete |
| `Phase 6 - Trade Hub` | `P5` | Canonical action and non-dispatching execution-boundary family |
| `Phase 7 - Alerts` | `P6` | Broader family remains incomplete even though reorientation subphases landed |
| `Phase 8 - Knowledge Library` | `P7` | Future product family |
| `Phase 9 - Regime Engine` | Later intelligence lane | Exact future split remains open; do not treat it as already named-and-built canon |
| `Phase 10 - Insights Layer` | `P8` | Future reflection and insights family |
| `Phase 11 - Beta Hardening` | `P10` | Same outcome, different numbering lens |

## Audited Implementation Ledger
This table records what is actually built or still pending without forcing the history into a fake straight line.

| Phase label | Family type | Canonical family | Short purpose | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| `P0` | canonical product | `P0` | Doctrine, architecture, and repo-discipline foundation | done | Present in CANON and repo governance foundations |
| `P1` | canonical product | `P1` | Strategy engine foundations | done | Historical foundation family already established |
| `P2` | canonical product | `P2` | Snapshot, provider, governance, and debug-observatory foundation | done | Historical foundation family already established |
| `P2C` | canonical product | `P2` | Governance contract plus secrets/config foundation | done | Narrow `P2` hardening subphase for config, redaction, and secret scanning |
| `P3` | canonical product | `P3` | Event and orientation spine | done | Implemented through `P3-1` to `P3-4`: `MarketEvent`, `EventLedger`, query seam plus Since Last Checked, and `OrientationContext` |
| `P4` | canonical product | `P4` | Snapshot and Dashboard shaping | done | Implemented through `P4-1` to `P4-5`; `P4-2` landed in parts during Snapshot-core realignment |
| `P5` | canonical product | `P5` | Trade Hub, confirmation, readiness, and submission-intent spine | done | Implemented through `P5-1` to `P5-11` plus `P5-13`; repo remains non-dispatching |
| `P5-X` | canonical product | `P5` | Execution-boundary hardening and invariants | done | Post-`P5-13` hardening family; does not authorize live order dispatch |
| `P5-R1` | canonical product | `P5` | Risk tool / position sizing foundation | done | Adds one service-owned, non-dispatching sizing seam and one calm Trade Hub support surface without introducing order-entry behavior |
| `PX-API1` | PX cross-cutting/platform | supports `P2` to `P5` and later runtime work | Provider Router, QuoteBroker, and API-governance doctrine lock | done | Valid side phase; not evidence that `P3` or later numbered families were complete when it landed |
| `PX-API2` | PX cross-cutting/platform | supports runtime work across families | Runtime contract hardening | done | Hardens request/result and quote-trust seams |
| `PX-API3` | PX cross-cutting/platform | supports runtime work across families | Runtime policy hardening | done | Adds explicit coalescing, degradation state, and policy metadata |
| `PX-API4` | PX cross-cutting/platform | supports runtime work across families | Thin provider-health windowing | done | Adds bounded recent-health scoring without inventing background runtime |
| `PX-API5` | PX cross-cutting/platform | supports runtime work across families | Prepared runtime diagnostics surface | done | Adds one service-owned diagnostics seam over existing runtime facts |
| `P6` | canonical product | `P6` | Alerts and message policy family | partial | Current merged work is the reorientation and Snapshot-briefing thread, not full `P6` completion |
| `P6-R1` | canonical product | `P6` | Reorientation summary / welcome-back seam | done | Present in repo docs and code; current reporting PDF does not list it as cleanly as later `P6-R*` phases |
| `P6-R2` | canonical product | `P6` | Snapshot placement for reorientation | done | Gives reorientation one canonical foreground home |
| `P6-R3` | canonical product | `P6` | Durable reorientation dismissal persistence | done | Keeps persistence narrow and service-owned |
| `P6-R4` | canonical product | `P6` | Foreground refresh after return | done | Refreshes the same prepared Snapshot path instead of creating a second fetch route |
| `P6-R5` | canonical product | `P6` | Snapshot orientation cohesion | done | Unifies reorientation and Since Last Checked into one service-owned briefing zone |
| `P6-R5A` | canonical product | `P6` | Snapshot cleanup and briefing-path hardening | done | Retires the legacy reorientation-only app path; cleanup does not imply `P7` or `P8` completion |
| `PX-PM1` | PX cross-cutting/platform | supports repo-wide planning clarity | Phase map audit and roadmap alignment | done | Creates the canonical taxonomy and audited ledger in this file |
| `P7` | canonical product | `P7` | Knowledge baseline | partial | Baseline foundation now exists through `P7-K1`, but the broader family remains incomplete |
| `P7-K1` | canonical product | `P7` | Knowledge baseline foundation | done | Adds the first canonical `KnowledgeNode`, one service-owned library VM seam, and one minimal top-level library surface without contextual rollout |
| `P8` | canonical product | `P8` | Insights, reflection, and richer context | partial | `P8-I1` lands the first thin Event History surface, `P8-I2` adds calm last-viewed continuity, `P8-I3` adds one deeper archive/detail shelf, and `P8-I4` adds one compare-period reflection seam, but the broader family remains incomplete |
| `P8-I1` | canonical product | `P8` | Insights / Event History foundation | done | Adds one service-owned history VM seam, one minimal top-level Insights surface, and meaningful-history shaping over the existing event spine |
| `P8-I2` | canonical product | `P8` | Insights last-viewed continuity | done | Adds one canonical continuity contract, one combined history-plus-continuity fetch seam, and one explicit Insights-specific last-viewed boundary without turning Insights into an inbox |
| `P8-I3` | canonical product | `P8` | Insights detail / archive navigation | done | Adds one canonical archive/detail contract, one service-owned deeper archive fetch seam, and one subordinate interpreted detail shelf without turning Insights into a ledger browser |
| `P8-I4` | canonical product | `P8` | Compare-period / reflection summary foundation | done | Adds one canonical comparison contract, one service-owned reflection summary seam, and one calm compare-recent-history path without turning Insights into an analytics dashboard |
| `P9` | canonical product | `P9` | Strategy Navigator and richer explanation layer | planned | No PX phase or reorientation cleanup should be read as `P9` completion |
| `P10` | canonical product | `P10` | Beta hardening | planned | Future family |
| `P11` | canonical product | `P11` | Launch prep | planned | Future family |

## Developer Sequencing Read
From an engineering-optimization perspective, the current shape is mostly sensible.

What makes sense:
- `P0` to `P2` before deeper feature work was the right move because config, governance, provider boundaries, and the first Snapshot foundation reduce later rewrite pressure.
- `P3` before broader `P4` and `P5` work was strong sequencing because event interpretation, ledger access, Since Last Checked, and `OrientationContext` create reusable service seams that multiple surfaces can share.
- `P4` before the deeper `P5` action layer was also sensible because it kept PocketPilot read-first and let the team prove prepared-surface patterns before building confirmation and execution-boundary seams.
- `P5` staying non-dispatching through `P5-X` was good engineering discipline; it let the contract stack mature before any future live-execution risk.
- `P5-R1` is sensible as a follow-on inside that same family because it adds disciplined planning support without weakening the non-dispatching boundary.
- `PX-API1` through `PX-API5` are logically timed side phases because runtime doctrine and inspection seams are cheaper to lock before more provider complexity accumulates.
- `P6-R1` through `P6-R5A` landing early is reasonable because they are low-blast-radius extensions of the existing `P3` plus Snapshot spine rather than evidence that the whole alerts family is finished.
- 'Early enabling seams for P8 and explanation work should be read as dependency preparation, not family completion.'
Where the order is messy but still defensible:
- Product Spec v0.3 puts explanation earlier than the current canonical roadmap. From a pure product-story angle that can read oddly, but from a codebase perspective delaying the richer explanation family until after the event, surface, and action seams exist is safer.
- `P8` concepts were partially enabled early through `EventLedger`, Since Last Checked, and reorientation groundwork. That is good dependency prep, but it should be treated as infrastructure for `P8`, not as completion of `P8`.
- PX runtime hardening landed across numbered families. That is acceptable because it reduced architecture drift in a shared substrate rather than creating product-surface leapfrogging.

Developer optimization guidance for future ordering:
- keep finishing shared seams before multiplying surfaces that consume them
- use `PX-*` when the work hardens a substrate used by several future families
- reserve `P9-*` for when explanation is the primary product surface, not just a support seam
- treat `P7`, `P8`, and `P9` as product-family milestones, even if some enabling contracts land earlier
- prefer dependency-first sequencing over aesthetic numbering, but document the crosswalk immediately so the roadmap stays legible

## Recommended Label For The Next Explanation / Lineage Phase
Recommended label: `PX-E1`.

Why:
- the forward-planning material treats explanation and event-lineage work as a parallel side track, not as proof that the full canonical `P9` family is underway
- early explanation groundwork is likely to cut across Snapshot, Dashboard, Trade Hub, and future knowledge surfaces
- using `PX-E1` keeps that work honest and future-safe while reserving `P9-*` for the point where Strategy Navigator and the richer explanation family are actually the primary product focus

## Remaining Open Ambiguities
- Product Spec v0.3 detailed workstream numbering is still useful historical context, but it is not the current repo naming system.
- Forward planning mentions `P5-12`, but no merged phase doc or current ledger entry under that label exists in the repo today.
- `P6-R1` is present in repo docs and code, but the currently available phase-reporting artifact does not record it as cleanly as `P6-R2` through `P6-R5A`.
- `P8` concepts have early enabling seams in `P3` and `P6`; future work should not mark `P8` done until the broader insights and reflection family actually lands.
