Title: PocketPilot Documentation Index
Version: v3 markdown source
Source: reconciled repo docs tree

Last Updated: 2026-05-02

# PocketPilot Documentation Index

**Last updated:** 2026-05-02

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
6. `meta/BACKLOG.md`
7. relevant product, behaviour, UX, and architecture docs
8. relevant phase docs for the family you are touching

### If you are reconciling docs or resuming after a gap

Start with:

1. `docs/README.md`
2. `founder/DOCUMENTATION_MAP.md`
3. `meta/MASTER_INDEX.md`
4. `meta/REPO_LANDING_MAP.md`
5. `meta/SOURCE_OF_TRUTH_RULES.md`
6. `meta/BACKLOG.md`
7. `phases/PHASE_MAP.md`

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
- Prepared stop/target references now also travel through one explicit service-owned availability seam; thin or unsupported context must remain unavailable rather than invented.
- Prepared stop/target source labels, limitation notes, and unavailable-reason wording now also come from one canonical service-owned copy seam; downstream services and `app/` consume prepared output without local reinterpretation.
- Trade Hub now renders prepared stop/target reference availability in one compact subordinate preview block, using service-owned copy and keeping unavailable states quiet and non-blocking.
- Trade Hub user-facing section labels and execution-boundary status copy should stay plain-language (`planning view`, `readiness check`, `submission check`, `execution handoff`) while keeping the same service-owned non-dispatching semantics.
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
- P7-K8 adds one service-owned inline glossary-help seam plus one service-owned seen-term acknowledgement seam; Dashboard explanation and Trade Hub safety copy may expose narrow beginner-first term links that still route into the same Knowledge Topic detail path.
- P7-K9 adds one service-owned glossary alias/index normalization seam so canonical terms and approved variants resolve more reliably while preserving K8 scope and keeping app-side matching logic out of `app/`.
- P7-K10 adds one service-owned inline glossary exposure/acknowledgement signal seam plus one aggregate summary seam for future tuning, kept invisible to users and without adding analytics UI or network telemetry.
- P7-K11 adds one bounded Trade Hub term-to-knowledge integration plan so future inline help rollout stays service-owned, profile-aware, and protected from link-soup behavior.
- P7-K12 lands the first bounded Trade Hub/Risk Tool term-help rollout with one service-owned affordance seam (`createTradeHubHelpAffordances`), wiring only stop-loss price, target price, one active risk-basis label, and guardrails while keeping app rendering passive and low-clutter.
- P7-K13 adds a runtime catalog sync guard so explicitly runtime-required register topics cannot drift out of `knowledgeCatalog` unnoticed.
- P7-K14 merges Layer 2 deeper-thinking content into all 14 canonical Trade Hub articles, preserves Layer 1 beginner sections first, and updates runtime Trade Hub topic detail content without widening help wiring scope or changing non-dispatching behavior.
- P7-K15 merges Layer 2 deeper-behaviour content into all 9 canonical strategy articles, preserves Layer 1 beginner-first structure, and updates runtime strategy topic detail content without changing Strategy Navigator/Preview behavior or help wiring scope.
- P7-K16 merges compact Layer 3 example-wiring bridges into canonical strategy, concept, and covered Trade Hub articles, reuses existing canonical example/evidence topics when available, and maps non-live example slugs for future integration without runtime UI behavior changes.
- P7-K17 standardizes all current Layer 3 market-example/evidence narrative topics to one behavior-first template, sharpens the four caution upgrades, and updates docs-side integration mapping without widening runtime wiring.
- P7-K19 surfaces a bounded first wave of six evidence examples as hidden runtime-resolvable follow-through topics from three source strategies, keeps market examples docs-side, keeps Trade Hub example links off, and preserves no-visible-Examples-shelf behavior.
- P7-K21 adds a bounded first concept follow-through wave by merging Layer 2 readiness content into five concept docs and surfacing exactly those five concept IDs as hidden runtime-routable topics (`priority: NEXT`) for evidence-to-concept routing, without creating a visible Concept shelf or widening Trade Hub/example surfacing.
- P9-S6 adds one service-owned fit-contrast seam inside Strategy Navigator so users can read a calm "why this, not that" comparison against nearby alternatives without ranking theatre, prediction framing, or execution prompts.
- P9-S7 adds one service-owned nearby-alternative heuristic seam so Strategy Navigator fit-contrast compares against more context-adjacent strategies instead of weak or arbitrary alternatives.
- P9-S8 adds one canonical service-owned strategy metadata registry so nearby-alternative selection and fit-contrast consume the same explicit metadata base instead of scattered strategy-label assumptions.
- P9-S9 keeps the same Strategy Navigator semantics while adding conservative mobile progressive disclosure so primary preview meaning stays visible and supporting context remains easier to scan.
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
- live topic docs under `orientation/`, `strategies/`, `concepts/`, `glossary/`, `trade-hub/`, `interpretation/`, `market-examples/`, `action-risk/`, and `evidence/`
- supporting topic docs under `40-reflection/`, `50-knowledge-system/`, `90-media/`, and `_meta/`
- docs-only UI support drafts for future help wiring under `ui-support/`

Current normalization rule:

- The v1.4 payload families above are now the live knowledge import baseline.
- Overlapping numbered legacy shelves were retired to avoid duplicate live homes for the same concepts.
- `PX-KI2` reconciles register/index taxonomy references to the same family-based layout and removes stale retired-shelf paths from active navigation docs.
- `PX-KI3` adds deterministic register hygiene validation (`npm run validate:knowledge`) and keeps catalog family assumptions aligned through one shared tooling config.
- `PX-KI4` imports Trade Hub risk-planning concepts plus aligned glossary/term-map support docs into the active family tree while keeping runtime/UI wiring out of scope.
- `PX-KI5` merges progressive beginner layers into canonical strategy docs, adds canonical concept docs, and keeps richer strategy detail under deeper sections without runtime/UI wiring changes.
- `P7-K9` refines runtime inline glossary alias matching quality through one service-owned normalization seam without widening glossary rollout surfaces.
- `P7-K10` adds internal aggregate exposure/acknowledgement hooks for glossary tuning while keeping runtime behavior calm, non-gating, and user-invisible.
- `P7-K11` adds a docs-side Trade Hub term-to-knowledge integration plan (`docs/knowledge/_meta/TRADE_HUB_HELP_INTEGRATION_PLAN.md`) that defines first-rollout scope, profile/surface treatment, and non-linking guardrails before runtime wiring.
- `P7-K12` implements that first runtime wiring scope through one service-owned Trade Hub help-affordance seam, keeps first-rollout terms bounded, and preserves non-dispatching Trade Hub boundaries plus scanability guardrails.
- `P7-K13` adds deterministic runtime catalog sync validation (`npm run validate:knowledge:runtime`) with an explicit runtime-required register topic scope and explicit legacy runtime exceptions.

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
- `meta/BACKLOG.md`
- `meta/DOC_TRACEABILITY_MATRIX.md`
- `meta/DEPENDENCY_MAP.md`

### 10. Source And Incoming

Operational handling folders, not live canon families.

- `source/` = provenance artifacts only
- `incoming/` = staging for untriaged imports only

## Structural Decisions After Final Canonical Reconciliation

- The current repo taxonomy stays primary.
- `docs/meta/` is now a small live family for navigation, traceability, and active backlog-state hygiene.
- `docs/foundations/` was not adopted; founding truth remains split across `docs/founder/` and `docs/governance/`.
- `docs/models/` was not adopted; object-contract docs land in `docs/architecture/`.
- `docs/behaviours/` remains the canonical home for cross-cutting behaviour rules even when source packs place them in `docs/product/`.
- `docs/knowledge/` now uses the live family layout (`orientation`, `strategies`, `concepts`, `glossary`, `trade-hub`, `interpretation`, `market-examples`, `action-risk`, `evidence`) plus retained support families (`40-reflection`, `50-knowledge-system`, `90-media`, `_meta`).
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
5. Run `npm run verify` after repo changes when normal workflow expects a green verify gate (`verify` includes both docs-side register validation and runtime catalog sync validation).
