---
title: "MASTER_INDEX"
status: "draft"
owner: "founder"
doc_class: "meta"
purpose: "Canonical PocketPilot documentation artifact"
depends_on: []
related_docs: []
canonical_path: "/docs/meta/MASTER_INDEX.md"
---

# PocketPilot Master Index

## Purpose
This document is the front door to the reconciled PocketPilot documentation stack.

It exists so a new reviewer, founder, designer, PM, or engineer can understand:
- what the major documentation layers are
- what each layer is for
- which order to read them in
- where the live canonical homes are in this repo
- which pack-era folder suggestions were *not* adopted as live taxonomy

This is the map for the city, not another building inside it.

## 1. The stack at a glance
PocketPilot's current live stack resolves into eight major layers:

1. **Founding truth**
2. **Knowledge Library**
3. **Product behavior**
4. **Behaviour follow-through**
5. **UX / implementation bridge**
6. **Architecture and object contracts**
7. **Phase ledger and implementation scope**
8. **Meta / traceability**

Useful shorthand:

**founding truth -> behavior -> surface rules -> system shape -> implementation scope -> traceability**

## 2. What each layer does
### 2.1 Founding truth
This is the identity and non-negotiables layer.

It defines:
- philosophy
- product laws
- trust posture
- core constraints
- phase framing at a high level

Primary homes:
- `docs/founder/`
- `docs/governance/`

Typical anchors:
- `POCKETPILOT_DOCTRINE.md`
- `PRODUCT_COMPASS.md`
- `CANON.md`
- `GUARDRAILS.md`
- `ENGINEERING_CONTRACT.md`

### 2.2 Knowledge Library
This is the canonical user-facing learning corpus.

It includes:
- orientation docs
- core language / interpretation docs
- strategy explainers
- action / risk explainers
- reflection explainers
- the knowledge register and template

Primary home:
- `docs/knowledge/`

### 2.3 Product behavior
This defines how PocketPilot should feel and behave as a product before surface wiring and implementation detail take over.

Primary home:
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

### 2.4 Behaviour follow-through
This makes the cross-cutting behaviour rules explicit and testable.

Primary home:
- `docs/behaviours/`

Key docs:
- `CONFIDENCE_LANGUAGE.md`
- `SIGNAL_EXPOSURE.md`
- `NOTIFICATION_SYSTEM.md`

### 2.5 UX / implementation bridge
This defines what the major surfaces are allowed to expose and how those surfaces should behave.

Primary home:
- `docs/ux/`

Key docs:
- `SNAPSHOT_SPEC.md`
- `DASHBOARD_EXPOSURE_RULES.md`
- `KNOWLEDGE_LINKING_RULES.md`
- `NOTIFICATION_EVENT_MATRIX.md`
- `STRATEGY_STATUS_RULES.md`
- `TRADE_HUB_GUARDRAILS.md`
- `EVENT_LEDGER_VIEW_MODEL.md`

### 2.6 Architecture and object contracts
This defines the system shapes, prepared seams, and canonical object contracts that keep product rules out of `app/`.

Primary home:
- `docs/architecture/`

Key docs:
- `SNAPSHOT_SYSTEM.md`
- `KNOWLEDGE_LINKING_ARCHITECTURE.md`
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

Current normalization rule:
- The final canonical pack proposed a separate `docs/models/` family.
- This repo keeps object-contract docs under `docs/architecture/` for now to preserve the existing canonical taxonomy.

### 2.7 Phase ledger and implementation scope
This records what is actually landed, what remains partial, and how new work should be named.

Primary home:
- `docs/phases/`

Anchor docs:
- `PHASE_MAP.md`
- relevant phase / subphase docs

### 2.8 Meta / traceability
This layer helps contributors navigate the stack and avoid duplicate canon.

Primary home:
- `docs/meta/`

Key docs:
- `MASTER_INDEX.md`
- `REPO_LANDING_MAP.md`
- `SOURCE_OF_TRUTH_RULES.md`
- `DOC_TRACEABILITY_MATRIX.md`
- `DEPENDENCY_MAP.md`

## 3. Recommended reading orders
### 3.1 Founder / leadership reading order
Best if the goal is to protect product intent and spot drift early.

Recommended order:
1. founder doctrine and compass
2. `CANON.md`
3. `GUARDRAILS.md`
4. product behavior docs
5. `PHASE_MAP.md`
6. architecture docs for the surface or seam in question
7. meta docs when reconciling structure or imports

### 3.2 Product / design reading order
Best if the goal is to understand surface behavior and product consistency.

Recommended order:
1. product behavior docs
2. behaviour docs
3. UX docs
4. knowledge docs where learning support matters
5. architecture docs where a prepared seam constrains the surface

### 3.3 Build / architecture reading order
Best if the goal is to implement without violating upstream truth.

Recommended order:
1. `SOURCE_OF_TRUTH_RULES.md`
2. `PHASE_MAP.md`
3. relevant founder / governance anchors
4. relevant product / behaviour docs
5. relevant UX docs
6. relevant architecture docs
7. relevant phase docs

## 4. Repo landing rules
Use these placement rules during reconciliation:

- founding truth lives in `docs/founder/` and `docs/governance/`, not `docs/foundations/`
- knowledge corpus lives in `docs/knowledge/`
- product behavior lives in `docs/product/`
- cross-cutting behaviour rules live in `docs/behaviours/`
- UX / implementation-bridge docs live in `docs/ux/`
- architecture companions and object-contract docs live in `docs/architecture/`
- implementation scope and naming truth live in `docs/phases/`
- navigation / traceability docs live in `docs/meta/`
- source artifacts live in `docs/source/`

The final canonical pack's folder suggestions are useful as layer hints.
They are not automatic live-taxonomy mandates.

## 5. Highest-risk drift zones
These areas deserve extra scrutiny whenever docs or implementation change:

- Snapshot
- notifications / message policy
- confidence language
- Trade Hub / risk support
- Strategy Status
- account-scoped truth
- knowledge linking in high-friction surfaces
- preview / explanation seams that could drift into advice

## 6. Practical review checklist
Before adding or moving a doc, ask:

1. What layer does this belong to?
2. What upstream source authorizes it?
3. What current canonical folder should own it?
4. Is this a new job, or a duplicate of an existing doc?
5. Will this change founder truth, behavior, surface rules, architecture, or implementation reporting?
6. Does `docs/README.md` or a maintained map need to change too?

## 7. One-line summary
PocketPilot's live repo stack now reads as:

**founder / governance truth -> product and behaviour rules -> UX bridge -> architecture and object contracts -> phase scope -> meta traceability**
