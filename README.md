Title: PocketPilot Repository Front Door
Version: repo landing refresh v3
Source: docs/README.md + active repo docs audit
Last Updated: 2026-04-28

# PocketPilot

PocketPilot is a strategy-first, execution-aware, calm-toned crypto decision-support cockpit.

This root README is intentionally light. The live documentation map now lives inside `docs/`, and the canonical entry point is:

- [`docs/README.md`](docs/README.md)

Use this file as the repo foyer. The proper machinery room is in `docs/`.

## Read This First

If you are new to the project, read:

1. [`docs/README.md`](docs/README.md)
2. [`docs/founder/POCKETPILOT_DOCTRINE.md`](docs/founder/POCKETPILOT_DOCTRINE.md)
3. [`docs/founder/PRODUCT_COMPASS.md`](docs/founder/PRODUCT_COMPASS.md)
4. [`docs/governance/CANON.md`](docs/governance/CANON.md)
5. [`docs/governance/GUARDRAILS.md`](docs/governance/GUARDRAILS.md)
6. [`docs/phases/PHASE_MAP.md`](docs/phases/PHASE_MAP.md)
7. [`docs/meta/BACKLOG.md`](docs/meta/BACKLOG.md)

If you are reconciling documentation drift, also read:

- [`docs/founder/DOCUMENTATION_MAP.md`](docs/founder/DOCUMENTATION_MAP.md)
- [`docs/meta/MASTER_INDEX.md`](docs/meta/MASTER_INDEX.md)
- [`docs/meta/REPO_LANDING_MAP.md`](docs/meta/REPO_LANDING_MAP.md)
- [`docs/meta/SOURCE_OF_TRUTH_RULES.md`](docs/meta/SOURCE_OF_TRUTH_RULES.md)

## Current Repo Spine

The current repo spine is service-owned and render-only at the app edge:

```text
Market Providers
-> Provider Router
-> QuoteBroker
-> Selected Account Context
-> MarketEvent / EventStream
-> EventLedger and query seams
-> OrientationContext
-> Prepared service contracts
-> Snapshot / Dashboard / Trade Hub / Insights / Knowledge / Strategy Preview surfaces
```

Core rule:

```text
services/ own truth and prepare contracts
app/ renders prepared contracts
```

## Non-Negotiables

Keep these in RAM before touching anything important:

- Strategy-first: market meaning is interpreted through the selected strategy.
- Execution-aware: selected account truth beats synthetic global purity.
- Calm in tone: no urgency language, dopamine loops, shame, confetti, or volatility theatre.
- User-directed: no hidden automation or silent control shifts.
- Snapshot is sacred: zero-scroll, Current State, Last 24h Change, Strategy Status.
- Meaning over noise: users experience interpreted events, not raw indicator spam.
- Account-scoped truth: alignment, fit, alerts, risk, and action support stay account-scoped.
- Deterministic core: no provider logic, network calls, device APIs, random behaviour, or hidden time in `core/`.
- Certainty discipline: estimated or thin state must never present as confirmed truth.
- Trade Hub remains support-first and non-dispatching.

## Live Documentation Families

| Family | Canonical home | Job |
| --- | --- | --- |
| Founder | `docs/founder/` | identity, doctrine, compass, front-door orientation |
| Governance | `docs/governance/` | constitutional rules, guardrails, engineering contract |
| Product | `docs/product/` | product behaviour and explanation posture |
| Behaviours | `docs/behaviours/` | cross-cutting messaging and behaviour rules |
| UX | `docs/ux/` | surface specs and implementation-bridge rules |
| Architecture | `docs/architecture/` | object contracts, prepared seams, runtime models |
| Knowledge | `docs/knowledge/` | in-product learning corpus and register |
| Phases | `docs/phases/` | phase taxonomy and audited implementation ledger |
| Meta | `docs/meta/` | navigation, backlog/state, traceability, landing rules |
| Source / incoming | `docs/source/`, `docs/incoming/` | provenance and temporary staging only |

## Current Phase Reality

Use [`docs/phases/PHASE_MAP.md`](docs/phases/PHASE_MAP.md) as the live phase ledger.

At this refresh point:

- `P0` to `P5` are foundation or implementation families already landed.
- `P5` has later risk and Trade Hub refinements through `P5-R16`.
- `P6` is partial but has alert/message and Since Last Checked work through `P6-A8`.
- `P7` is partial but has knowledge, contextual linking, glossary, and tuning-hook work through `P7-K10` plus `PX-KI1` to `PX-KI5` knowledge imports/reconciliations.
- `P8` is partial but has Insights, reflection, export, journal, compare-window, and Since Last Checked archive continuity through `P8-I12`.
- `P9` is partial but has Strategy Preview / Navigator fit contrast, nearby alternatives, metadata normalization, and mobile disclosure work through `P9-S9`.
- `PX-*`, `DOC-*`, and `BL-*` tracks are valid support/admin lanes and do not imply intervening numbered product-family completion.

## Active Backlog State

The active planning state lives at:

- [`docs/meta/BACKLOG.md`](docs/meta/BACKLOG.md)

Do not resurrect stale per-phase backlog notes if this file has superseded them. Use the active backlog/state doc first, then inspect older phase docs only for provenance.

## Quality Gates

Before merging implementation changes, normal repo discipline expects:

```bash
npm run lint
npm run test
npm run validate:knowledge
npm run verify
```

`verify` is expected to include the docs-side knowledge validation gate.

## Repo Conduct

- Prefer updating existing canonical docs over creating near-duplicates.
- Keep `docs/source/` as provenance, not live truth.
- Keep `docs/incoming/` temporary.
- Reflect behaviour changes across product, UX, architecture, governance, and phase docs where relevant.
- Do not use older source PDFs or generated packs as live truth without reconciling them into the active markdown tree.
- Keep PRs narrow and named honestly.

PocketPilot should grow by doctrine, canon, guardrails, prepared contracts, and phased implementation.

Not by feature goblin confetti.
