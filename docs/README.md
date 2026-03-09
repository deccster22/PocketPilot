Title: PocketPilot Documentation Index
Version: Unspecified in source
Source: docs/incoming/README.pdf
Last Updated: 2026-03-09

# PocketPilot Documentation Index

This folder contains the canonical project documentation for PocketPilot.

PocketPilot docs are organized into five groups:
- Governance
- Product
- Architecture
- Phases
- Source Artifacts

Use this index as the starting point for contributors, agents, and future dev chats.

---

## Documentation Principles

1. Markdown files in this repo are the **working canonical versions**.
2. Source PDFs in `docs/source/` are retained only for:
   - milestone versions
   - high-value governance artifacts
   - provenance / audit purposes
3. Do not create duplicate Markdown docs for the same concept unless intentionally versioned.
4. Prefer updating an existing canonical Markdown file over creating a new near-duplicate.
5. Preserve fidelity when converting source artifacts into repo Markdown.

---

## Folder Structure

```text
docs/
  README.md
  incoming/
  source/
  governance/
  product/
  architecture/
  phases/
```

## Governance

Core operating rules, engineering guardrails, and safety models.

- `governance/CANON.md`
  - Core product philosophy and locked decisions
- `governance/ENGINEERING_CONTRACT.md`
  - Architecture boundaries and engineering obligations
- `governance/GUARDRAILS.md`
  - CI, testing, security, and implementation guardrails
- `governance/CONTEXT_SUITE.md`
  - Cross-chat continuity rules and context transfer model
- `governance/API_GOVERNANCE.md`
  - Provider classification, fallback logic, and API discipline
- `governance/SECRETS_MODEL.md`
  - Secrets handling, config boundaries, and storage rules
- `governance/SECURITY_MODEL.md`
  - Security posture for client, config, and future integrations
- `governance/DATA_INTEGRITY_POLICY.md`
  - Rules for execution-bound vs analysis-only data use
- `governance/OBSERVABILITY_MODEL.md`
  - Debugging, telemetry, diagnostics, and failure visibility
- `governance/INCIDENT_RESPONSE.md`
  - How to handle outages, bad data, and release regressions
- `governance/RELEASE_MODEL.md`
  - Branching, PR, CI, and release flow
- `governance/BETA_STRATEGY.md`
  - Beta rollout, tester cohorts, and launch-risk handling
- `governance/VERIFICATION_MODEL.md`
  - What "verify" means now and how it expands later
- `governance/COMPLIANCE_COPY_GUIDE.md`
  - Safe language rules for product copy and AI-generated explanation
- `governance/AGENT_OPERATING_MODEL.md`
  - Rules for Codex/agent participation in the project

## Product

User-facing philosophy, feature models, and UX intent.

- `product/FOUNDER_ONE_PAGER.md`
  - Product DNA and top-level vision
- `product/SNAPSHOT_VISION.md`
  - Snapshot concept, scope, and interpretation model
- `product/PROFILE_EXPLANATION_MODEL.md`
  - Beginner / Middle / Advanced explanation strategy
- `product/SIGNAL_OBJECT_DESIGN.md`
  - Structured signal model and future-proofing principles
- `product/LOG_AND_JOURNAL_MODEL.md`
  - Event log, user journal, and reflection architecture
- `product/ASSET_NARRATIVE_MODEL.md`
  - Asset-specific timeline/context model
- `product/KNOWLEDGE_LAYER.md`
  - Learning surfaces, knowledge links, and strategy support content
- `product/AI_EXPLANATION_LAYER.md`
  - Future AI layer as translator, not signal generator
- `product/RELEVANCE_PRINCIPLE.md`
  - PocketPilot only surfaces portfolio-relevant, watchlist-relevant, or strategy-relevant information
- `product/NOTIFICATION_PHILOSOPHY.md`
  - Signal relevance, calm tone, and anti-spam principles

## Architecture

Technical design, system structure, and component-level models.

- `architecture/ARCHITECTURE_MAP.md`
  - Layering and dependency boundaries
- `architecture/FOLDER_SCAFFOLDING.md`
  - Repo layout and where code belongs
- `architecture/SIGNAL_PIPELINE.md`
  - Quotes -> deltas -> strategies -> snapshot flow
- `architecture/CONFIG_MODEL.md`
  - Config module structure and environment access rules
- `architecture/PROVIDER_ROUTER_MODEL.md`
  - Quote provider routing, fallback, and telemetry
- `architecture/DEBUG_PANEL_MODEL.md`
  - Debug observatory panel and scan inspection design
- `architecture/TRADE_HUB_MODEL.md`
  - Trade Hub structure, ProtectionPlan, and execution adaptation
- `architecture/RISK_LAYER_MODEL.md`
  - SL/TP calculator, risk basis, and guardrail layering
- `architecture/MULTI_ACCOUNT_MODEL.md`
  - Account-scoped strategy/state architecture
- `architecture/REGIME_AND_FIT_MODEL.md`
  - Regime exposure and strategy-fit representation
- `architecture/EVENT_STREAM_MODEL.md`
  - Event-first design for logs, replay, and analysis

## Phases

Implementation-phase contracts and execution docs.

- `phases/P0.md`
- `phases/P1.md`
- `phases/P2A.md`
- `phases/P2B.md`
- `phases/P2C.md`

Future:
- `phases/P2D.md`
- `phases/P3.md`
- `phases/P4.md`
- `phases/P5.md`
- `phases/P6.md`
- `phases/P7.md`
- `phases/P8.md`
- `phases/P9.md`
- `phases/P10.md`
- `phases/P11.md`

## Source Artifacts

Original exported source documents for provenance and milestone archiving.

Rules:
- Keep milestone versions for governance / architecture documents
- Replace minor working versions rather than hoarding every revision

Examples:
- `source/CANON_v0.3.pdf`
- `source/CANON_v0.4.pdf`
- `source/FOUNDER_ONE_PAGER_v0.1.pdf`
- `source/ENGINEERING_CONTRACT_v0.1.pdf`

## Incoming

Temporary landing zone for fresh imports from Google Docs before conversion.

Examples:
- `incoming/CANON_v0.4.pdf`
- `incoming/SNAPSHOT_VISION_v0.2.docx`

Files in `incoming/` should either:
- be converted into canonical Markdown
- be moved into `source/`
- or be removed once no longer needed
