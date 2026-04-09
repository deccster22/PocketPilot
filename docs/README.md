Title: PocketPilot Documentation Index
Version: v2 markdown source
Source: docs/source/README_v2.md

Last Updated: 2026-04-09

# PocketPilot Documentation Index

**Last updated:** 2026-04-09

**Purpose:** Canonical entry point for PocketPilot documentation in this repo.

PocketPilot is a **strategy-first, execution-aware, calm-toned decision-support cockpit**. It is not a trading bot, not a signal-spam feed, and not a casino dashboard. The docs in this repo exist to preserve that identity while giving contributors, agents, and future build chats a clean map of what matters, where it lives, and what must not drift.

This README replaces the older five-bucket index with the current multi-tier documentation map and adds the governance, architecture, product, and phase context that is now important for safe repo work.

---

## Read This First

### If you are new to PocketPilot

Start here, in this order:

1. `founder/POCKETPILOT_DOCTRINE.md`
2. `founder/PRODUCT_COMPASS.md`
3. `founder/POCKETPILOT_ARCHITECTURE_OVERVIEW.md`
4. `governance/CANON.md`
5. `governance/GUARDRAILS.md`
6. `product/FOUNDER_ONE_PAGER.md`
7. `product/PRODUCT_SPEC.md` or equivalent current integrated product spec
8. `founder/POCKETPILOT_DOC_MAP.md`

### If you are about to build or change code

Read these before making architectural or behavioural changes:

1. `governance/CANON.md`
2. `governance/GUARDRAILS.md`
3. `governance/CONTEXT_SUITE.md`
4. `governance/ENGINEERING_CONTRACT.md`
5. `phases/PHASE_MAP.md`
6. Relevant architecture model(s)
7. Relevant phase/runbook doc(s)
8. Most recent phase report / forensic handover if available

### If you are reconciling drift or resuming after a gap

Start with:

1. `governance/CANON.md`
2. `governance/GUARDRAILS.md`
3. `governance/CONTEXT_SUITE.md`
4. `phases/PHASE_MAP.md`
5. `product/PRODUCT_SPEC.md`
6. latest forensic handover / phase ledger / reconciliation pack

---

## Non-Negotiables to Keep in RAM

These are the recurring PocketPilot laws that should survive every refactor, prompt pack, branch, and shiny late-night feature idea:

- **Strategy-first.** PocketPilot interprets the market through the user's chosen strategy.
- **Execution-aware.** Execution venue truth beats synthetic or averaged global purity.
- **Calm in tone.** No urgency language, volatility theatre, dopamine loops, or shame.
- **User-directed.** No hidden automation. No silent control shifts. User remains the pilot.
- **Snapshot is sacred.** Zero-scroll. Current State, Last 24h Change, Strategy Status.
- **Interpretation over raw signal output.** Users experience meaningful events, not indicator spam.
- **Account-scoped truth.** Strategy alignment, fit, risk, alerts, and execution support are account-scoped.
- **Deterministic core.** No provider logic, no network calls, no device APIs, no random behaviour in `core/`.
- **Foreground-only in Phase 1.** No background scanning or push logic that bypasses current guardrails.
- **Estimated must never present as confirmed.** Certainty metadata matters.

If a proposed change weakens any of the above, stop and resolve it before proceeding.

---

## Documentation Hierarchy

PocketPilot docs now map to **ten tiers**. This is the current mental model for the repo.

### 1. Founder

Identity, philosophy, and top-level orientation.

Examples:

- `founder/POCKETPILOT_DOCTRINE.md`
- `founder/PRODUCT_COMPASS.md`
- `founder/POCKETPILOT_PRODUCT_IDENTITY.md`
- `founder/POCKETPILOT_ARCHITECTURE_OVERVIEW.md`
- `founder/POCKETPILOT_DOC_MAP.md`

Question answered: **What is PocketPilot?**

### 2. Architecture

System shape, models, seams, contracts, and extension rules.

Examples:

- `architecture/ARCHITECTURE_MAP.md`
- `architecture/FOLDER_SCAFFOLDING.md`
- `architecture/CONFIG_MODEL.md`
- `architecture/PROVIDER_ROUTER_MODEL.md`
- `architecture/QUOTE_BROKER.md`
- `architecture/RUNTIME_DIAGNOSTICS_MODEL.md`
- `architecture/INSIGHTS_HISTORY_MODEL.md`
- `architecture/STRATEGY_ENGINE.md`
- `architecture/MARKET_EVENT_MODEL.md`
- `architecture/EVENT_STREAM_MODEL.md`
- `architecture/EXPLANATION_MODEL.md`
- `architecture/STRATEGY_FIT_MODEL.md`
- `architecture/THIRTY_THOUSAND_FOOT_MODEL.md`
- `architecture/STRATEGY_NAVIGATOR_MODEL.md`
- `architecture/SNAPSHOT_SYSTEM.md`
- `architecture/TRADE_INTENT_MODEL.md`
- `architecture/RISK_TOOL_MODEL.md`
- `architecture/MULTI_ACCOUNT_MODEL.md`
- `architecture/PROFILE_SYSTEM.md`
- `architecture/KNOWLEDGE_NODE_MODEL.md`
- `architecture/REGIME_AND_FIT_MODEL.md`
- `architecture/HAPTICS_EVENT_TAXONOMY.md`

Question answered: **How should PocketPilot be structured so future work remains coherent?**

### 3. Governance

Non-negotiable truth, safety rails, delivery discipline, and release integrity.

Examples:

- `governance/CANON.md`
- `governance/ENGINEERING_CONTRACT.md`
- `governance/GUARDRAILS.md`
- `governance/CONTEXT_SUITE.md`
- `governance/API_GOVERNANCE.md`
- `governance/SECRETS_MODEL.md`
- `governance/SECURITY_MODEL.md`
- `governance/DATA_INTEGRITY_POLICY.md`
- `governance/OBSERVABILITY_MODEL.md`
- `governance/INCIDENT_RESPONSE.md`
- `governance/RELEASE_MODEL.md`
- `governance/BETA_STRATEGY.md`
- `governance/VERIFICATION_MODEL.md`
- `governance/COMPLIANCE_COPY_GUIDE.md`
- `governance/AGENT_OPERATING_MODEL.md`

Question answered: **What must always be true about PocketPilot?**

### 4. Product

User-facing behaviour, feature philosophy, explanation posture, and scope.

Examples:

- `product/FOUNDER_ONE_PAGER.md`
- `product/PRODUCT_SPEC.md`
- `product/SNAPSHOT_VISION.md`
- `product/THIRTY_THOUSAND_FOOT_VIEW.md`
- `product/STRATEGY_PREVIEW.md`
- `product/PROFILE_EXPLANATION_MODEL.md`
- `product/LOG_AND_JOURNAL_MODEL.md`
- `product/ASSET_NARRATIVE_MODEL.md`
- `product/KNOWLEDGE_LAYER.md`
- `product/AI_EXPLANATION_LAYER.md`
- `product/RELEVANCE_PRINCIPLE.md`
- `product/NOTIFICATION_PHILOSOPHY.md`
- `product/DESIGN_DECISIONS.md`
- `product/SCAN_FOCUS_DEEP.md`

Question answered: **How should PocketPilot behave as a product?**

### 5. Behaviours

Cross-feature behavioural rules and messaging discipline.

Examples:

- `behaviours/SIGNAL_EXPOSURE.md`
- `behaviours/CONFIDENCE_LANGUAGE.md`
- `behaviours/NOTIFICATION_SYSTEM.md`
- `behaviours/SYSTEM_BEHAVIOUR.md`

Question answered: **How do features behave safely and consistently in the real product?**

### 6. Strategies

Per-strategy definitions, signal priorities, and alignment logic.

Examples:

- `strategies/DIP_BUYING.md`
- `strategies/RANGE_TRADER.md`
- `strategies/REVERSION_BOUNCE.md`
- `strategies/MOMENTUM_PULSE.md`
- `strategies/TREND_FOLLOW.md`
- `strategies/BREAKOUT_WATCHER.md`
- `strategies/CANDLE_SIGNALS.md`
- `strategies/FIBONACCI_ZONES.md`
- `strategies/CONFLUENCE_ALIGNMENT.md`
- `strategies/ALTSEASON.md`

Question answered: **How do PocketPilot strategies present and interpret market conditions?**

### 7. Roadmap

Phase planning, runbook discipline, execution sequencing, and reporting.

Examples:

- `roadmap/DEV_ROUTINE.md`
- `roadmap/RUNBOOK_EXECUTION.md`
- `roadmap/PHASE_REPORTS.md`
- `roadmap/ROADMAP.md`
- `roadmap/MILESTONES.md`
- `roadmap/BUILD_PHASES.md`

Question answered: **What is the delivery plan, and where are we now?**

### 8. UX

Surface-specific UX intent and interaction philosophy.

Examples:

- `ux/ORIENTATION_LAYER.md`
- `ux/SNAPSHOT_SPEC.md`
- `ux/THIRTY_THOUSAND_FOOT_SPEC.md`
- `ux/DASHBOARD_SPEC.md`
- `ux/STRATEGY_NAVIGATOR_SPEC.md`
- `ux/STRATEGY_AWARE_UI.md`
- `ux/PROFILE_EXPERIENCE.md`

Question answered: **What should the product feel like to use, and why?**

### 9. Knowledge

Learning library structure, content types, and media support.

Examples:

- `product/KNOWLEDGE_LAYER.md`
- `architecture/KNOWLEDGE_MODEL.md`
- `ux/KNOWLEDGE_LIBRARY_SPEC.md`
- `phases/P7-K1.md`
- `phases/P7-K2.md`
- `phases/P7-K3.md`
- `knowledge/README.md`
- `knowledge/_register/CONTENT_REGISTER.md`
- `knowledge/_templates/KNOWLEDGE_NODE_TEMPLATE.md`
- `knowledge/00-orientation/what-pocketpilot-is.md`
- `knowledge/20-strategies/README.md`

Question answered: **What does the learning layer look like?**

### 10. Research

Exploration, synthesis, historical context, and upstream thinking.

Examples:

- `research/EARLY_RESEARCH.md`
- `research/REVIEW_MERGES.md`
- `research/FEATURE_EXPLORATION.md`

Question answered: **What informed PocketPilot's evolution?**

---

## Suggested Folder Structure

```text
docs/
  README.md
  founder/
  governance/
  architecture/
  product/
  behaviours/
  strategies/
  roadmap/
  ux/
  knowledge/
  research/
  incoming/
  source/
```

### Folder Roles

- `founder/` = frozen-orienting docs that define identity and decision filters
- `governance/` = constitutional rules and operating constraints
- `architecture/` = technical models and canonical system seams
- `product/` = feature philosophy and behaviour intent
- `behaviours/` = cross-cutting behaviour rules and language rules
- `strategies/` = strategy-specific models and launch strategy definitions
- `roadmap/` = phases, runbooks, and phase reporting
- `ux/` = surface-level UX specs and experience design intent
- `knowledge/` = canonical Knowledge Library corpus, shelf indexes, register, template, and media scaffolding
- `research/` = historical exploration and supporting synthesis
- `incoming/` = temporary staging area for fresh imports awaiting triage
- `source/` = milestone PDFs and provenance artifacts only

---

## Current Canonical Product / Architecture Spine

As of the current documentation set, the core system spine is:

```text
Market Providers
-> Provider Router
-> QuoteBroker
-> MarketEvent
-> EventStream
-> EventLedger
-> Event Queries / Since Last Checked
-> OrientationContext
-> SnapshotModel
-> PreparedContextInputs
-> StrategyFitSummary
-> ThirtyThousandFootVM
-> ReorientationSummary
-> ReorientationSurfaceState
-> SnapshotBriefingState
-> Prepared message input context
-> Message profile tuning
-> MessagePolicyAvailability
-> SnapshotSurfaceVM
-> DashboardModel
-> DashboardSurfaceVM
-> ExplanationSummary
-> Dashboard why note
-> Dashboard why detail reuse path
-> Trade Hub Surface
-> Confirmation Session
-> Risk Tool VM
-> Execution Preview
-> Readiness Gate
-> Submission Intent
```

Knowledge baseline uses its own thin product seam:

```text
docs/knowledge + CONTENT_REGISTER
-> generate-knowledge-catalog
-> knowledgeCatalog
-> createKnowledgeLibraryVM
-> fetchKnowledgeLibraryVM
-> Knowledge Library tab
-> createKnowledgeTopicDetailVM
-> fetchKnowledgeTopicDetailVM
-> Knowledge topic detail screen
-> createContextualKnowledgeAvailability
-> fetchContextualKnowledgeAvailability
-> generic contextual availability for approved surfaces
```

P9-S2 adds one preview-owned knowledge follow-through on top of that same catalog:

```text
knowledgeCatalog
-> selectStrategyPreviewKnowledge
-> createStrategyNavigatorVM
-> fetchStrategyNavigatorVM
-> Strategy Preview follow-through section
```

Insights/Event History now uses its own thin reflection seam:

```text
EventLedger
-> EventLedgerQueries
-> Since Last Checked (when available)
-> OrientationContext
-> createInsightsHistoryVM
-> createInsightsContinuity
-> fetchInsightsHistoryVM
-> Insights tab
-> markInsightsHistoryViewed
```

P8-I3 adds one subordinate deeper shelf on that same seam:

```text
EventLedger
-> EventLedgerQueries
-> Since Last Checked (when available)
-> OrientationContext
-> createInsightsHistoryVM
-> createInsightsContinuity
-> createInsightsArchiveVM
-> fetchInsightsArchiveVM
-> Insights detail/archive shelf
```

P8-I4 adds one thin compare-period reflection path on that same interpreted spine:

```text
EventLedger
-> EventLedgerQueries
-> Since Last Checked (when available)
-> OrientationContext
-> createInsightsHistoryVM
-> createReflectionComparisonVM
-> fetchReflectionComparisonVM
-> Insights recent-comparison shelf
```

P9-S1 through P9-S4 now define the first thin Strategy Navigator / Preview path:

```text
core strategy catalog
-> strategyPreviewScenarios
-> createStrategyNavigatorVM
-> fetchStrategyNavigatorVM
-> Strategy Preview tab
```

Within `createStrategyNavigatorVM`, the same service-owned lane now calls `createStrategyPreviewContrast`, `createStrategyPreviewExplanation`, and `selectStrategyPreviewKnowledge` so the app still consumes one prepared preview contract.

Key rule: **services own truth, app renders prepared contracts**.

The UI should not be inventing interpretation logic from raw data. If it feels like the UI is "figuring things out," something has probably drifted.

Runtime data-plane rule: Provider Router is the role-aware routing seam, QuoteBroker is the quote-policy choke point, and current-phase runtime remains foreground-only.

Prepared runtime diagnostics rule: `services/debug/` owns the `RuntimeDiagnosticsVM` seam for provider health, quote policy, and per-symbol degradation inspection. `app/` may render that prepared contract only on an existing debug path.

For runtime/provider work, treat these as the authoritative PX-API1 doctrine set:

- `architecture/PROVIDER_ROUTER_MODEL.md`
- `architecture/QUOTE_BROKER.md`
- `architecture/RUNTIME_DIAGNOSTICS_MODEL.md`
- `governance/API_GOVERNANCE.md`
- `phases/PX-API1.md`
- `phases/PX-API2.md`
- `phases/PX-API3.md`
- `phases/PX-API4.md`
- `phases/PX-API5.md`

---

## Phase Framing

PocketPilot is easiest to read at three levels.

### Macro phases

- **Macro Phase 1 - Foundation**
- **Macro Phase 2 - Context and Reflection**
- **Macro Phase 3 - Intelligence**
- **Macro Phase 4 - Copilot and Hardening**

### Canonical product workstream families

- `P0` Vision, doctrine, architecture, repo discipline foundation
- `P1` Strategy engine foundations
- `P2` Snapshot / provider / governance / debug observatory foundation
- `P3` Event system and orientation layer
- `P4` Snapshot + Dashboard UX shaping
- `P5` Trade Hub and ProtectionPlan
- `P5-R1` Risk tool / position sizing foundation
- `P5-R2` Quote-assisted risk references
- `P5-R3` Prepared plan stop/target references
- `P5-R4` Prepared plan producers for risk references
- `P5-R5` Strategy-owned prepared stop/target publishing
- `P6` Alerts, message policy, and reorientation briefing seams
- `P6-A1` Alert and message policy foundation over the existing Snapshot/reorientation groundwork
- `P6-A2` Guarded-stop and referral rollout to Trade Hub and Dashboard through the same message-policy seam
- `P6-A3` Alert threshold and profile sensitivity tuning on the same canonical message-policy seam
- `P6-A4` Richer interpreted alert inputs on the same canonical message-policy seam
- `P6-R2` Snapshot placement for the foreground reorientation briefing
- `P6-R3` Durable dismiss persistence for the Snapshot reorientation briefing
- `P6-R4` Snapshot foreground-return truth refresh through the shared prepared VM path
- `P6-R5` Snapshot orientation cohesion through one canonical subordinate briefing zone
- `P6-R5A` Retire the legacy reorientation-only app presentation path so Snapshot keeps one canonical briefing surface
- `PX-C1` Strategy Fit / 30,000 ft View foundation
- `PX-C2` Richer volatility / structural context inputs on the same canonical context lane
- `PX-E1` Early explanation and lineage groundwork for the Dashboard Focus surface
- `PX-E2` Dashboard explanation deepening on the same canonical seam
- `P7` Knowledge baseline
- `P7-K1` Knowledge baseline foundation
- `P7-K2` Knowledge topic detail surface
- `P7-K3` Knowledge contextual eligibility seam
- `P8` Insights / Event Ledger / Since Last Checked / Reorientation
- `P8-I1` Insights / Event History foundation
- `P8-I2` Insights last-viewed continuity
- `P8-I3` Insights detail / archive navigation
- `P8-I4` Compare-period / reflection summary foundation
- `P9` Pattern Navigator / Strategy Navigator / richer explanation layer
- `P9-S1` Strategy Navigator / Preview foundation
- `P9-S2` Strategy Navigator preview-to-knowledge follow-through
- `P9-S3` Strategy Navigator preview explanation deepening
- `P9-S4` Strategy Navigator scenario contrast deepening
- `P10` Beta hardening
- `P11` Launch prep

### Cross-cutting / support phases

Use `PX-*` for cross-cutting, platform, runtime, hardening, cleanup, doctrine, audit, or support work that may happen before, after, or alongside numbered product families.

Current examples:

- `PX-API1` through `PX-API5` for runtime doctrine and hardening
- `PX-PM1` for this phase-map audit and roadmap alignment pass
- `PX-E1` and `PX-E2` are explanation groundwork, not proof that the richer `P9` family is complete.

Use `P#-subphase` only for scoped work inside one canonical family. Example: `P6-R5A` is cleanup within `P6`; it does not imply completion of `P7`, `P8`, or `P9`.

Canonical taxonomy, source-lens reconciliation, and the audited implementation ledger live in `phases/PHASE_MAP.md`.

If a feature is not scheduled in the runbook / phase model, it should not quietly appear in implementation.

---

## Document Maintenance Rules

1. **Markdown in this repo is canonical.** PDFs are source artifacts, snapshots, or provenance records.
2. **Prefer updating an existing canonical doc** over creating a near-duplicate.
3. **Do not create competing truths** for the same concept without explicit versioning or supersession.
4. **CANON overrides naming drift.** If docs disagree on terminology, CANON is the authority unless superseded intentionally.
5. **Guardrails and product spec must be updated when behaviour changes.**
6. **Architecture objects should be canonised before they ship.**
7. **Phase reports and handovers should be honest** about what was actually built, not what was hoped for.
8. **Source artifacts are for provenance, not day-to-day truth.**

---

## Known Naming and Drift Notes

PocketPilot has a few recurring terminology tensions. Treat these carefully:

- **Strategy Preview** and **Strategy Navigator** are the same feature family unless explicitly split later.
- **ProfileConfig** is the canonical primary profile object; voice policy is a nested subsystem.
- **Resolution** is the canonical final lifecycle state; **aftermath** is acceptable as explanatory copy.
- **Snapshot core is locked** even if secondary chips are allowed. Do not let enrichment quietly mutate the core triad.

When in doubt, resolve naming at the governance layer, then let downstream docs adapt.

---

## Incoming and Source Handling

### `incoming/`

Use for fresh imports from Google Docs, exported PDFs, or working-source artifacts that have not yet been triaged.

Files in `incoming/` should quickly become one of three things:

- converted into canonical Markdown or canonical knowledge-library content
- moved into `source/` for provenance
- removed once no longer needed

### `source/`

Use for milestone snapshots and provenance artifacts only.

Keep:

- milestone governance versions
- high-value architecture snapshots
- founder-level source artifacts
- forensic handovers and major reconciliation packs where provenance matters

Do not use `source/` as a dumping ground for every minor revision.

---

## Contribution Checklist

Before merging documentation or implementation changes, confirm:

- `CANON.md` still agrees with the change
- `GUARDRAILS.md` still agrees with the change
- relevant product / architecture doc has been updated
- no duplicate canonical doc was created
- phase placement is clear
- naming is consistent with current authority docs
- `npm run lint`, `npm run test`, and `npm run verify` remain green when code changed

If any of those are fuzzy, stop and reconcile before pushing.

---

## Practical Reading Paths

### Product / founder lens

`DOCTRINE` -> `COMPASS` -> `FOUNDER_ONE_PAGER` -> `PRODUCT_SPEC`

### Governance / engineering lens

`CANON` -> `GUARDRAILS` -> `CONTEXT_SUITE` -> `ENGINEERING_CONTRACT`

### Architecture / build lens

`ARCHITECTURE_OVERVIEW` -> `ARCHITECTURE_MAP` -> relevant architecture seam doc(s) -> phase/runbook doc

### Recovery / handover lens

`CANON` -> `GUARDRAILS` -> `PHASE_MAP` -> `PRODUCT_SPEC` -> latest forensic handover -> phase reports

---

## The Point of This Repo

PocketPilot should grow like this:

```text
Doctrine
-> Compass
-> Canon
-> Guardrails
-> Product Spec
-> Architecture
-> Phased implementation
```

Not like this:

```text
feature + feature + feature + feature = chaos goblin repo
```

The repo exists to keep PocketPilot coherent as it moves from strategy-first interpretation into execution-aware product reality without losing its calm, trustworthy core.

## Conversion Notes

Replaced prior section headings from the older index:

- `Documentation Principles`
- `Folder Structure`
- `Governance`
- `Product`
- `Architecture`
- `Phases`
- `Source Artifacts`
- `Incoming`
