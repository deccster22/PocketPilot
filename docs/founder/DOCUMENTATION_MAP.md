# PocketPilot Documentation Map

- Title: PocketPilot Documentation Map
- Version: v3
- Source file: reconciled repo docs tree
- Last updated: 2026-04-09

Purpose: shows where the live canonical docs now live after reconciliation against the final canonical pack.

## Canonical Live Structure

### Founder

Identity, philosophy, and front-door orientation.

Canonical home:
- `docs/founder/`

Key docs:
- `POCKETPILOT_DOCTRINE.md`
- `PRODUCT_COMPASS.md`
- `FOUNDERS_ONE_PAGER.md`
- `ARCHITECTURE_OVERVIEW.md`
- `DOCUMENTATION_MAP.md`

### Governance

PocketPilot's constitutional and delivery rules.

Canonical home:
- `docs/governance/`

Key docs:
- `CANON.md`
- `GUARDRAILS.md`
- `ENGINEERING_CONTRACT.md`
- `CONTEXT_SUITE.md`
- `API_GOVERNANCE.md`

### Product

Broad product behaviour, explanation posture, and reflection posture.

Canonical home:
- `docs/product/`

Key docs:
- `SNAPSHOT_VISION.md`
- `KNOWLEDGE_LAYER.md`
- `RELEVANCE_PRINCIPLE.md`
- `NOTIFICATION_PHILOSOPHY.md`
- `PROFILE_EXPLANATION_MODEL.md`
- `LOG_AND_JOURNAL_MODEL.md`
- `ASSET_NARRATIVE_MODEL.md`
- `AI_EXPLANATION_LAYER.md`

### Behaviours

Cross-cutting behavioural rules that remain distinct from broad product docs.

Canonical home:
- `docs/behaviours/`

Key docs:
- `CONFIDENCE_LANGUAGE.md`
- `SIGNAL_EXPOSURE.md`
- `NOTIFICATION_SYSTEM.md`

### UX

Surface rules and implementation-bridge docs.

Canonical home:
- `docs/ux/`

Key docs:
- `SNAPSHOT_SPEC.md`
- `DASHBOARD_SPEC.md`
- `TRADE_HUB_SPEC.md`
- `DASHBOARD_EXPOSURE_RULES.md`
- `KNOWLEDGE_LINKING_RULES.md`
- `NOTIFICATION_EVENT_MATRIX.md`
- `STRATEGY_STATUS_RULES.md`
- `TRADE_HUB_GUARDRAILS.md`
- `EVENT_LEDGER_VIEW_MODEL.md`

### Architecture

Prepared seams, runtime models, and canonical object-contract docs.

Canonical home:
- `docs/architecture/`

Key docs:
- `PROVIDER_ROUTER_MODEL.md`
- `QUOTE_BROKER.md`
- `SNAPSHOT_SYSTEM.md`
- `NOTIFICATION_ROUTER_MODEL.md`
- `STRATEGY_STATUS_ENGINE.md`
- `TRADE_HUB_RUNTIME_MODEL.md`
- `EVENT_LEDGER_ARCHITECTURE.md`
- `EVENT_SYSTEM.md`
- `ORIENTATION_CONTEXT.md`
- `SNAPSHOT_OBJECT.md`
- `KNOWLEDGE_NODE_MODEL.md`
- `MARKET_EVENT_MODEL.md`
- `RISK_LAYER_MODEL.md`
- `TRADE_INTENT_MODEL.md`

### Knowledge

Canonical in-product learning corpus.

Canonical home:
- `docs/knowledge/`

Current shelf taxonomy:
- `00-orientation/`
- `10-core-language/`
- `20-strategies/`
- `30-action-risk/`
- `40-reflection/`
- `50-knowledge-system/`
- `90-media/`

### Phases

Canonical phase naming and implementation-status reporting.

Canonical home:
- `docs/phases/`

Anchor doc:
- `PHASE_MAP.md`

### Meta

Navigation, traceability, and landing guidance.

Canonical home:
- `docs/meta/`

Key docs:
- `MASTER_INDEX.md`
- `REPO_LANDING_MAP.md`
- `SOURCE_OF_TRUTH_RULES.md`
- `DOC_TRACEABILITY_MATRIX.md`
- `DEPENDENCY_MAP.md`

### Source And Incoming

Operational folders, not live canon families.

- `docs/source/` = provenance only
- `docs/incoming/` = staging only

## Front-Door Reading Paths

### Founder / intent path

`POCKETPILOT_DOCTRINE` -> `PRODUCT_COMPASS` -> `CANON` -> `GUARDRAILS` -> `FOUNDERS_ONE_PAGER`

### Build / implementation path

`CANON` -> `GUARDRAILS` -> `ENGINEERING_CONTRACT` -> `SOURCE_OF_TRUTH_RULES` -> `PHASE_MAP` -> relevant product / UX / architecture docs

### Docs reconciliation path

`docs/README.md` -> `DOCUMENTATION_MAP.md` -> `MASTER_INDEX.md` -> `REPO_LANDING_MAP.md` -> `SOURCE_OF_TRUTH_RULES.md` -> `PHASE_MAP.md`

## Current Landing Decisions

- The final canonical pack was used as a content and coverage source, not as an automatic taxonomy mandate.
- `docs/meta/` was adopted as a live navigation / traceability layer.
- `docs/foundations/` was not adopted; founding truth remains in `docs/founder/` and `docs/governance/`.
- `docs/models/` was not adopted; object-contract docs remain in `docs/architecture/`.
- `docs/behaviours/` remains the live home for `CONFIDENCE_LANGUAGE`, `SIGNAL_EXPOSURE`, and `NOTIFICATION_SYSTEM`.
- The numbered knowledge shelf taxonomy remains canonical.
- `docs/source/` remains provenance-only and was not expanded into a competing markdown tree.

## Practical Notes

- Strategy docs currently live in `docs/knowledge/20-strategies/`, not in a separate `docs/strategies/` tree.
- Phase and roadmap truth currently lives in `docs/phases/`, not in a separate `docs/roadmap/` tree.
- Traceability and landing guidance now live in `docs/meta/`, not in placeholder founder notes.
