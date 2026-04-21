Title: PocketPilot Documentation Index
Version: v3 markdown source
Source: reconciled repo docs tree

Last Updated: 2026-04-21

# PocketPilot Documentation Index

**Last updated:** 2026-04-21

**Purpose:** Canonical entry point for PocketPilot documentation in this repo.

PocketPilot is a strategy-first, execution-aware, calm-toned decision-support cockpit. The docs in this repo exist to preserve that identity while making it clear where live truth lives, which layer owns what, and how new docs should land without creating duplicate canon.

## Read This First

### If you are new to PocketPilot

Start here, in this order:

1. `founder/POCKETPILOT_DOCTRINE.md`
2. `founder/PRODUCT_COMPASS.md`
3. `governance/CANON.md`
4. `governance/GUARDRAILS.md`
5. `founder/ARCHITECTURE_OVERVIEW.md`
6. `founder/FOUNDERS_ONE_PAGER.md`
7. `phases/PHASE_MAP.md`
8. `founder/DOCUMENTATION_MAP.md`
9. `meta/MASTER_INDEX.md`

### If you are about to build or change code

Read these before making architectural or behavioural changes:

1. `governance/CANON.md`
2. `governance/GUARDRAILS.md`
3. `governance/ENGINEERING_CONTRACT.md`
4. `meta/SOURCE_OF_TRUTH_RULES.md`
5. `phases/PHASE_MAP.md`
6. relevant product, behaviour, UX, and architecture docs
7. relevant phase docs for the family you are touching

### If you are reconciling docs or resuming after a gap

Start with:

1. `docs/README.md`
2. `founder/DOCUMENTATION_MAP.md`
3. `meta/MASTER_INDEX.md`
4. `meta/REPO_LANDING_MAP.md`
5. `meta/SOURCE_OF_TRUTH_RULES.md`
6. `phases/PHASE_MAP.md`

## Non-Negotiables To Keep In RAM

- Strategy-first. PocketPilot interprets the market through the user's selected strategy.
- Execution-aware. Execution venue truth beats synthetic purity.
- Calm in tone. No urgency language, volatility theatre, dopamine loops, or shame.
- User-directed. No hidden automation or silent control shifts.
- Calm reflection only. Compare-window, monthly, quarterly, annual, and archived Insights readbacks stay descriptive and non-moralizing.
- Reflection exports stay explicit and service-owned. Export options and dispatch paths must state what they contain, remain profile-aware, keep timezone labeling visible, and keep internal diagnostics out of user-facing output.
- Journal notes stay optional and small. The first Insights journal lane remains text-only, context-linked, service-owned, and free of reminders, scorekeeping, or AI commentary; export follow-through stays narrow and explicit where it is honestly supported.
- Explicit risk framing. Selected risk basis must stay legible and flow through prepared Trade Hub summaries and sizing outputs.
- Account-level preferred risk basis and optional guardrail preferences stay service-owned and explicit. Trade Hub may start from a saved per-account basis or guardrail choice, but the screen never invents or silently stores one.
- Prepared guardrail evaluation stays service-owned, descriptive, and non-blocking. Trade Hub may show how the selected plan sits against enabled guardrails, but it never turns that status into default enforcement.
- The Trade Hub risk lane stays grouped as one prepared service-owned contract, so selected basis, preferred basis, sizing, guidance, guardrail preferences, and guardrail evaluation travel together without app-owned recomposition.
- Prepared risk-input guidance stays service-owned, calm, and non-enforcing when sizing context is thin or unsupported.
- Explicit account control. Account switching is user-initiated and primary fallback remains service-owned.
- PX-MA4 normalized the selected-account surface shape so Snapshot, Dashboard, Trade Hub, and related support seams reuse one prepared account-context helper instead of rebuilding local branching.
- Snapshot is sacred. Zero-scroll. Current State, Last 24h Change, Strategy Status.
- Snapshot also carries one separate calm Since Last Checked section under Strategy Status, and `P6-A8` refines it with service-owned clear-after-view behavior while it stays compact, account-scoped, and non-inbox-like.
- `P8-I12` keeps that Snapshot clear-after-view behavior intact while adding one service-owned deeper Insights archive continuity seam so the same meaningful-change context can remain available without inbox/feed drift.
- Interpretation over raw signal output. Users experience meaningful events, not indicator spam.
- Account-scoped truth. Alignment, fit, risk, alerts, and action support stay account-scoped.
- Message policy stays grouped as one prepared service-owned lane. User-visible message posture is explained through prepared rationale on that lane, never raw diagnostics or app-owned recomposition.
- Contextual knowledge on Dashboard and Trade Hub stays service-owned, optional, and non-gating. The app only renders prepared lanes and topic detail routes; it does not choose topics locally.
- Contextual knowledge on Dashboard and Trade Hub now also carries a prepared density/placement presentation so the shelf can stay calmer, smaller, or hidden when profile and surface make that the honest choice.
- P7-K6 deepens contextual topic linkage from live strategy, signal, event, and surface context while keeping the same prepared lane and presentation seams intact.
- P7-K7 carries one prepared topic-detail context frame from Dashboard and Trade Hub into the existing detail route so the selected topic can explain why it matters there without becoming a gate or advice surface.
- Aggregate portfolio context is separate. Cross-account holdings or exposure views may exist, but they must never become aggregate strategy, fit, alert, risk, or execution truth.
- Deterministic core. `core/` stays pure and side-effect free.
- Estimated must never present as confirmed.

## Canonical Documentation Families

### 1. Founder

Identity, philosophy, and front-door orientation.

Key docs:

- `founder/POCKETPILOT_DOCTRINE.md`
- `founder/PRODUCT_COMPASS.md`
- `founder/FOUNDERS_ONE_PAGER.md`
- `founder/ARCHITECTURE_OVERVIEW.md`
- `founder/DOCUMENTATION_MAP.md`

### 2. Governance

Constitutional rules, delivery discipline, and operating constraints.

Key docs:

- `governance/CANON.md`
- `governance/GUARDRAILS.md`
- `governance/ENGINEERING_CONTRACT.md`
- `governance/CONTEXT_SUITE.md`
- `governance/API_GOVERNANCE.md`
- `governance/VERIFICATION_MODEL.md`

### 3. Product

User-facing behaviour, explanation posture, reflection posture, and product philosophy.

Key docs:

- `product/SNAPSHOT_VISION.md`
- `product/KNOWLEDGE_LAYER.md`
- `product/RELEVANCE_PRINCIPLE.md`
- `product/NOTIFICATION_PHILOSOPHY.md`
- `product/ALERT_MESSAGE_POLICY.md`
- `product/PROFILE_EXPLANATION_MODEL.md`
- `product/LOG_AND_JOURNAL_MODEL.md`
- `product/ASSET_NARRATIVE_MODEL.md`
- `product/AI_EXPLANATION_LAYER.md`

### 4. Behaviours

Cross-cutting behavioural rules that remain distinct from broad product philosophy.

Key docs:

- `behaviours/CONFIDENCE_LANGUAGE.md`
- `behaviours/SIGNAL_EXPOSURE.md`
- `behaviours/NOTIFICATION_SYSTEM.md`

### 5. UX

Surface rules, view-model constraints, and implementation-bridge docs.

Key docs:

- `ux/SNAPSHOT_SPEC.md`
- `ux/DASHBOARD_SPEC.md`
- `ux/TRADE_HUB_SPEC.md`
- `ux/DASHBOARD_EXPOSURE_RULES.md`
- `ux/KNOWLEDGE_LINKING_RULES.md`
- `ux/NOTIFICATION_EVENT_MATRIX.md`
- `ux/STRATEGY_STATUS_RULES.md`
- `ux/TRADE_HUB_GUARDRAILS.md`
- `ux/EVENT_LEDGER_VIEW_MODEL.md`

### 6. Architecture

Prepared seams, routers, assemblers, runtime models, and canonical object-contract docs.

Key docs:

- `architecture/PROVIDER_ROUTER_MODEL.md`
- `architecture/QUOTE_BROKER.md`
- `architecture/SNAPSHOT_SYSTEM.md`
- `architecture/MESSAGE_POLICY_MODEL.md`
- `architecture/NOTIFICATION_ROUTER_MODEL.md`
- `architecture/STRATEGY_STATUS_ENGINE.md`
- `architecture/TRADE_HUB_RUNTIME_MODEL.md`
- `architecture/EVENT_LEDGER_ARCHITECTURE.md`
- `architecture/EVENT_SYSTEM.md`
- `architecture/ORIENTATION_CONTEXT.md`
- `architecture/SNAPSHOT_OBJECT.md`
- `architecture/KNOWLEDGE_NODE_MODEL.md`
- `architecture/MARKET_EVENT_MODEL.md`
- `architecture/RISK_LAYER_MODEL.md`
- `architecture/TRADE_INTENT_MODEL.md`

Current normalization rule:

- Object-contract docs live under `docs/architecture/` in this repo.
- The final canonical pack's proposed `docs/models/` tree was not adopted as a live top-level taxonomy.

### 7. Knowledge

Canonical in-product learning corpus, register, and template.

Key docs:

- `knowledge/README.md`
- `knowledge/_register/CONTENT_REGISTER.md`
- `knowledge/_templates/KNOWLEDGE_NODE_TEMPLATE.md`
- live topic docs under `orientation/`, `strategies/`, `glossary/`, `interpretation/`, `market-examples/`, `action-risk/`, and `evidence/`
- supporting topic docs under `40-reflection/`, `50-knowledge-system/`, and `90-media/`

Current normalization rule:

- The v1.4 payload families above are now the live knowledge import baseline.
- Overlapping numbered legacy shelves were retired to avoid duplicate live homes for the same concepts.
- `PX-KI2` reconciles register/index taxonomy references to the same family-based layout and removes stale retired-shelf paths from active navigation docs.

### 8. Phases

Canonical phase naming, landed scope, and implementation reporting.

Key docs:

- `phases/PHASE_MAP.md`
- relevant `P*` and `PX-*` docs for the workstream you are touching

### 9. Meta

Navigation, traceability, and source-of-truth placement rules.

Key docs:

- `meta/MASTER_INDEX.md`
- `meta/REPO_LANDING_MAP.md`
- `meta/SOURCE_OF_TRUTH_RULES.md`
- `meta/DOC_TRACEABILITY_MATRIX.md`
- `meta/DEPENDENCY_MAP.md`

### 10. Source And Incoming

Operational handling folders, not live canon families.

- `source/` = provenance artifacts only
- `incoming/` = staging for untriaged imports only

## Structural Decisions After Final Canonical Reconciliation

- The current repo taxonomy stays primary.
- `docs/meta/` is now a small live family for navigation and traceability only.
- `docs/foundations/` was not adopted; founding truth remains split across `docs/founder/` and `docs/governance/`.
- `docs/models/` was not adopted; object-contract docs land in `docs/architecture/`.
- `docs/behaviours/` remains the canonical home for cross-cutting behaviour rules even when source packs place them in `docs/product/`.
- `docs/knowledge/` now uses the v1.4 live family layout (`orientation`, `strategies`, `glossary`, `interpretation`, `market-examples`, `action-risk`, `evidence`) plus retained support families (`40-reflection`, `50-knowledge-system`, `90-media`).
- `docs/source/` remains provenance storage only. No competing markdown mirror tree was added there.

## Maps And Traceability

Use these docs when placement or authority is unclear:

- `founder/DOCUMENTATION_MAP.md`
- `meta/MASTER_INDEX.md`
- `meta/REPO_LANDING_MAP.md`
- `meta/SOURCE_OF_TRUTH_RULES.md`
- `meta/DOC_TRACEABILITY_MATRIX.md`
- `meta/DEPENDENCY_MAP.md`
- `phases/PHASE_MAP.md`

## Maintenance Rules

1. Prefer updating an existing canonical doc over creating a near-duplicate.
2. Preserve one live home per concept.
3. Update product, UX, architecture, and phase docs together when behaviour changes.
4. Treat `docs/source/` as provenance, not day-to-day truth.
5. Run `npm run verify` after repo changes when normal workflow expects a green verify gate.
