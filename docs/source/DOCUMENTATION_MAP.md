# PocketPilot Documentation Map v2

- Title: PocketPilot Documentation Map
- Version: v2
- Source file: `docs/source/PocketPilot Documentation Map v3.pdf`
- Last updated: 2026-04-08

File: `docs/founder/PocketPilot Documentation Map`

Purpose: Shows where everything lives.

## Documentation Structure

### Tier 1 - Founder

- Doctrine
- Compass
- Product Identity
- Architecture Overview
- Documentation Map

Defines the identity and behaviour of the product.

### Tier 2 - Architecture

- Architecture Map
- Folder Scaffolding
- Config
- Provider Router
- Debug Panel
- Trade Hub
- Risk Layer
- Event System
- Strategy Engine
- QuoteBroker
- Snapshot System
- Multi Account
- Regime and Fit
- Event Stream
- Market Event
- Protection Plan
- Profile System
- Knowledge Node
- Signal Object Design
- Haptics event taxonomy
- Real provider decisions
- Key management strategy
- Operational thresholds
- Failure modes
- Response playbooks
- Testing and release mechanics
- Monitoring and support strategy

PX-API1 runtime doctrine lives primarily in:
- `docs/architecture/PROVIDER_ROUTER_MODEL.md`
- `docs/architecture/QUOTE_BROKER.md`

Technical system design.

### Tier 3 - Governance

- Canon
- Engineering Contract
- Guardrails
- Context Suite
- API Governance
- Secrets Model
- Security Model
- Data integrity Policy
- Observability Model
- Incident Response
- Release Model
- Beta Strategy
- Verification Model
- Compliance Copy Guide
- Agent Operating Model

PX-API1 runtime governance lives primarily in:
- `docs/governance/API_GOVERNANCE.md`
- `docs/phases/PX-API1.md`

Important Governance Documentation

### Tier 4 - Product

- Founder One Pager
- Product Spec
- Snapshot Vision
- Thirty Thousand Foot View
- Strategy Preview
- Profile Explanation Model
- Log and Journal Model
- Asset Narrative Model
- Knowledge Layer
- AI Explanation Layer
- Relevance Principle
- Notification Philosophy
- Alert / Message Policy
- Design Decisions
- Scan Focus Deep

Product Features

### Tier 5 - Behaviours

- Signal Exposure
- Confidence Language
- Notification System
- System Behaviour

System Behaviour

### Tier 6 - Strategies

- Strategy definitions
- Signal frameworks
- Alignment logic

Strategy modelling.

### Tier 7 - Roadmap

- Phase plan
- Runbook Execution
- Milestones
- Phase taxonomy and audited implementation ledger

Canonical phase taxonomy now lives in:
- `docs/phases/PHASE_MAP.md`

Use:
- `P#` for canonical product families
- `P#-subphase` for scoped work inside one canonical family
- `PX-*` for cross-cutting/platform/hardening/support phases that do not imply numbered-family completion

Build execution.

### Tier 8 - UX

- Orientation Layer
- Snapshot Spec
- Thirty Thousand Foot Spec
- Dashboard Spec
- Strategy Navigator Spec
- Profile Experience
- Strategy Aware UI

User experience behaviour.

### Tier 9 - Knowledge

- Knowledge Library README / shelf structure
- Shelf README files for orientation, core language, strategies, action-risk, reflection, knowledge-system, and media
- Canonical content register (`CONTENT_REGISTER.md` / `CONTENT_REGISTER.csv`)
- Canonical knowledge node template
- Live orientation, core-language, strategy, action-risk, reflection, and knowledge-system nodes

Knowledge Library corpus and support docs.

### Tier 10 - Research

- Early research
- Review merges
- Feature exploration

Historical knowledge.

## Index

### `/docs`

#### `/founder`

- `POCKETPILOT_DOCTRINE.md`
  - Status: Founder
  - Maturity: Active
  - Operational Expansion: locked
- `PRODUCT_COMPASS.md`
  - Status: Founder
  - Maturity: Active
  - Operational Expansion: locked
- `POCKETPILOT_ARCHITECTURE_OVERVIEW.md`
  - Status: Founder
  - Maturity: Active
  - Operational Expansion: if appropriate
- `POCKETPILOT_PRODUCT_IDENTITY.md`
  - Status: Founder
  - Maturity: Active
  - Operational Expansion: if appropriate
- `POCKETPILOT_DOC_MAP.md`
  - Status: Founder
  - Maturity: Active
  - Operational Expansion: if appropriate

#### `/architecture`

- `ARCHITECTURE_MAP.md`
  - Status: Architecture
  - Maturity: Evolving Draft
  - Operational Expansion: progressive
- `FOLDER_SCAFFOLDING.md`
  - Status: Architecture
  - Maturity: Working Draft
  - Operational Expansion: Point in time
- `CONFIG_MODEL.md`
  - Status: Architecture
  - Maturity: Draft
  - Operational Expansion: Not required
- `PROVIDER_ROUTER_MODEL.md`
  - Status: Architecture
  - Maturity: Active doctrine
  - Operational Expansion: future provider runtime work must conform
- `DEBUG_PANEL_MODEL.md`
  - Status: Architecture
  - Maturity: Active
  - Operational Expansion: later phase
- `RUNTIME_DIAGNOSTICS_MODEL.md`
  - Status: Architecture
  - Maturity: Active
  - Operational Expansion: later phase
- `TRADE_HUB_MODEL.md`
  - Status: Architecture
  - Maturity: To be developed
  - Operational Expansion: Before Trade Hub
  - [Editor note: PDF includes inline note "need real operational detail".]
- `RISK_LAYER_MODEL.md`
  - Status: Architecture
  - Maturity: To be developed
  - Operational Expansion: Before Trade Hub
- `EVENT_SYSTEM.md`
  - Status: Architecture
  - Maturity: To be developed unless redundant with other Market_EVENT docs
  - Operational Expansion: Near Future
- `QUOTE_BROKER.md`
  - Status: Architecture
  - Maturity: Active doctrine
  - Operational Expansion: future quote/runtime work must conform
- `STRATEGY_ENGINE.md`
  - Status: Architecture
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `SNAPSHOT_SYSTEM.md`
  - Status: Architecture
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `MULTI_ACCOUNT_MODEL.md`
  - Status: Architecture
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `REGIME_AND_FIT_MODEL.md`
  - Status: Architecture
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `EVENT_STREAM_MODEL.md`
  - Status: Architecture
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `INSIGHTS_HISTORY_MODEL.md`
  - Status: Architecture
  - Maturity: Active
  - Operational Expansion: progressive
- `EXPLANATION_MODEL.md`
  - Status: Architecture
  - Maturity: Active
  - Operational Expansion: progressive
- `STRATEGY_FIT_MODEL.md`
  - Status: Architecture
  - Maturity: Active
  - Operational Expansion: progressive
- `THIRTY_THOUSAND_FOOT_MODEL.md`
  - Status: Architecture
  - Maturity: Active
  - Operational Expansion: progressive
- `STRATEGY_NAVIGATOR_MODEL.md`
  - Status: Architecture
  - Maturity: Active
  - Operational Expansion: progressive
- `MARKET_EVENT_MODEL.md`
  - Status: Architecture
  - Maturity: Active
  - Operational Expansion: If needed
- `PROTECTION_PLAN.md`
  - Status: Architecture
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `PROFILE_SYSTEM.md`
  - Status: Architecture
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `KNOWLEDGE_NODE_MODEL.md`
  - Status: Architecture
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `SIGNAL_OBJECT_DESIGN.md`
  - Status: Architecture
  - Maturity: Active
  - Operational Expansion: If needed
  - [Editor note: PDF includes inline note "most important missing pieces".]
- `HAPTICS_EVENT_TAXONOMY.md`
  - Status: Architecture
  - Maturity: Active
  - Operational Expansion: If needed
- `REAL_PROVIDER_DECISIONS`
  - Status: Architecture
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `KEY_MANAGEMENT_STRATEGY`
  - Status: Architecture
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `OPERATIONAL_THRESHOLDS`
  - Status: Architecture
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `FAILURE_MODES`
  - Status: Architecture
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `RESPONSE_PLAYBOOKS`
  - Status: Architecture
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `TESTING_AND_RELEASE_MECHANICS`
  - Status: Architecture
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `MONITORING_AND_SUPPORT_STRATEGY`
  - Status: Architecture
  - Maturity: To be developed
  - Operational Expansion: Near Future

#### `/governance`

- `CANON.md`
  - Status: Constitutional
  - Maturity: Active v.05
  - Operational Expansion: Updates from vision sweep
- `ENGINEERING_CONTRACT.md`
  - Status: Constitutional
  - Maturity: Active
  - Operational Expansion: Later Phase
- `GUARDRAILS.md`
  - Status: Constitutional
  - Maturity: Active
  - Operational Expansion: Updates from vision sweep
- `CONTEXT_SUITE.md`
  - Status: Constitutional
  - Maturity: Active
  - Operational Expansion: Updates from vision sweep
- `API_GOVERNANCE.md`
  - Status: Operational Strategy
  - Maturity: Active doctrine
  - Operational Expansion: future runtime/provider work must conform
- `SECRETS_MODEL.md`
  - Status: Constitutional
  - Maturity: Draft
  - Operational Expansion: Near Future
- `SECURITY_MODEL.md`
  - Status: Constitutional
  - Maturity: Draft
  - Operational Expansion: Near Future
- `DATA_INTEGRITY_POLICY.md`
  - Status: Constitutional
  - Maturity: Active
  - Operational Expansion: Later Phase
- `OBSERVABILITY_MODEL.md`
  - Status: Constitutional
  - Maturity: Draft
  - Operational Expansion: Near Future
- `INCIDENT_RESPONSE.md`
  - Status: Constitutional
  - Maturity: Draft
  - Operational Expansion: Before Beta
- `RELEASE_MODEL.md`
  - Status: Constitutional
  - Maturity: Draft
  - Operational Expansion: Before Beta
- `BETA_STRATEGY.md`
  - Status: Constitutional
  - Maturity: Draft
  - Operational Expansion: Before Beta
- `VERIFICATION_MODEL.md`
  - Status: Constitutional
  - Maturity: Draft
  - Operational Expansion: Near Future
- `COMPLIANCE_COPY_GUIDE.md`
  - Status: Constitutional
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `AGENT_OPERATING_MODEL.md`
  - Status: Constitutional
  - Maturity: Draft
  - Operational Expansion: Near Future

#### `/product`

- `FOUNDER_ONE_PAGER.md`
  - Status: Product
  - Maturity: Active
  - Operational Expansion: Later Phase
- `SNAPSHOT_VISION.md`
  - Status: Product
  - Maturity: To be developed
  - Operational Expansion: Near Future
  - [Editor note: PDF includes inline note "most important missing pieces".]
- `PROFILE_EXPLANATION_MODEL.md`
  - Status: Product
  - Maturity: To be developed
  - Operational Expansion: Near Future
  - [Editor note: PDF includes inline note "most important missing pieces".]
- `LOG_AND_JOURNAL_MODEL.md`
  - Status: Product
  - Maturity: To be developed
  - Operational Expansion: Near Future
  - [Editor note: PDF includes inline note "most important missing pieces".]
- `ASSET_NARRATIVE_MODEL.md`
  - Status: Product
  - Maturity: To be developed
  - Operational Expansion: Near Future
  - [Editor note: PDF includes inline note "most important missing pieces".]
- `KNOWLEDGE_LAYER.md`
  - Status: Product
  - Maturity: To be developed
  - Operational Expansion: Near Future
  - [Editor note: PDF includes inline note "most important missing pieces".]
- `AI_EXPLANATION_LAYER.md`
  - Status: Product
  - Maturity: To be developed
  - Operational Expansion: Near Future
  - [Editor note: PDF includes inline note "most important missing pieces".]
- `RELEVANCE_PRINCIPLE.md`
  - Status: Product
  - Maturity: To be developed
  - Operational Expansion: Near Future
  - [Editor note: PDF includes inline note "most important missing pieces".]
- `NOTIFICATION_PHILOSOPHY.md`
  - Status: Product
  - Maturity: To be developed
  - Operational Expansion: Near Future
  - [Editor note: PDF includes inline note "most important missing pieces".]
- `DESIGN_DECISIONS.md`
  - Status: Product
  - Maturity: To be developed
  - Operational Expansion: Near Future
  - [Editor note: PDF includes inline note "most important missing pieces".]
- `SCAN_FOCUS_DEEP.md`
  - Status: Product
  - Maturity: To be developed
  - Operational Expansion: Near Future

#### `/behaviour rules`

- `SIGNAL_EXPOSURE.md`
  - Status: Behavioural
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `CONFIDENCE_LANGUAGE.md`
  - Status: Behavioural
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `NOTIFICATION_SYSTEM.md`
  - Status: Behavioural
  - Maturity: To be developed
  - Operational Expansion: Near Future

#### `/strategies`

- `DIP_BUYING.md`
  - Status: Strategy
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `RANGE_TRADER.md`
  - Status: Strategy
  - Maturity: To be developed
  - Operational Expansion: Near Futu
  - [Editor note: PDF text appears truncated.]
- `REVERSION_BOUNCE.md`
  - Status: Strategy
  - Maturity: To be developed
  - Operational Expansion: Near Futu
  - [Editor note: PDF text appears truncated.]
- `MOMENTUM_PULSE.md`
  - Status: Strategy
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `TREND_FOLLOW.md`
  - Status: Strategy
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `BREAKOUT_WATCHER.md`
  - Status: Strategy
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `CANDLE_SIGNALS.md`
  - Status: Strategy
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `FIBONACCI_ZONES.md`
  - Status: Strategy
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `CONFLUENCE_ALIGNMENT.md`
  - Status: Strategy
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `ALTSEASON.md`
  - Status: Strategy
  - Maturity: To be developed
  - Operational Expansion: Near Future

#### `/roadmap`

- `DEV_ROUTINE.md`
  - Status: Process Doc
  - Maturity: Active
  - Operational Expansion: as needed
- `RUNBOOK_EXECUTION.md`
  - Status: Planning Doc
  - Maturity: Active
  - Operational Expansion: as needed
- `PHASE_REPORTS.md`
  - Status: Reporting Doc
  - Maturity: Was active in Canon, to be moved to new doc
  - Operational Expansion: progressive
- `ROADMAP.md`
  - Status: Strategy
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `MILESTONES.md`
  - Status: Strategy
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `BUILD_PHASES.md`
  - Status: Strategy
  - Maturity: To be developed
  - Operational Expansion: Near Future

#### `/phases`

- `PHASE_MAP.md`
  - Status: Taxonomy + Ledger
  - Maturity: Active
  - Operational Expansion: canonical phase naming and historical reconciliation
- `PX-API1.md` through `PX-API5.md`
  - Status: Cross-cutting runtime doctrine
  - Maturity: Active
  - Operational Expansion: future runtime/provider work must conform
- `P7-K1.md`
  - Status: Knowledge baseline phase
  - Maturity: Active
  - Operational Expansion: future knowledge rollout
- `P8-I1.md` through `P8-I4.md`
  - Status: Insights / reflection subphases
  - Maturity: Active
  - Operational Expansion: future reflection family
- `P9-S1.md`
  - Status: Strategy Navigator / Preview foundation
  - Maturity: Active
  - Operational Expansion: future P9 family work

#### `/ux`

- `ORIENTATION_LAYER.md`
  - Status: UX
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `SNAPSHOT_SPEC.md`
  - Status: UX
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `DASHBOARD_SPEC.md`
  - Status: UX
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `STRATEGY_AWARE_UI.md`
  - Status: UX
  - Maturity: To be developed
  - Operational Expansion: Near Future
- `PROFILE_EXPERIENCE.md`
  - Status: UX
  - Maturity: To be developed if becomes a genuine UX layer
  - Operational Expansion: Near Future

#### `/knowledge`

- `README.md`
  - Status: Knowledge
  - Maturity: Active canonical shelf entry point
  - Operational Expansion: update when shelf structure changes
- `00-orientation/README.md` through `50-knowledge-system/README.md`
  - Status: Knowledge
  - Maturity: Active shelf indexes
  - Operational Expansion: keep aligned with live shelf contents
- `90-media/README.md`
  - Status: Knowledge
  - Maturity: Reserved
  - Operational Expansion: when media assets become canonical
- `_register/CONTENT_REGISTER.md` and `_register/CONTENT_REGISTER.csv`
  - Status: Knowledge
  - Maturity: Active canonical register
  - Operational Expansion: update with live corpus changes only
- `_templates/KNOWLEDGE_NODE_TEMPLATE.md`
  - Status: Knowledge
  - Maturity: Active canonical authoring template
  - Operational Expansion: refine only when the node contract changes
- numbered shelf corpus files under `00-orientation/`, `10-core-language/`, `20-strategies/`, `30-action-risk/`, `40-reflection/`, and `50-knowledge-system/`
  - Status: Knowledge
  - Maturity: Active canonical corpus
  - Operational Expansion: progressive as the live P7 corpus grows

#### `/research`

- `EARLY_RESEARCH.md`
  - Status: Research
  - Maturity: Planned
  - Operational Expansion: as historical synthesis is imported
- `REVIEW_MERGES.md`
  - Status: Research
  - Maturity: Planned
  - Operational Expansion: as historical synthesis is imported
- `FEATURE_EXPLORATION.md`
  - Status: Research
  - Maturity: Planned
  - Operational Expansion: as historical synthesis is imported
- supporting reconciliation / handoff packs
  - Status: Research
  - Maturity: archival
  - Operational Expansion: as needed
