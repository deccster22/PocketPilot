---
title: "DOC_TRACEABILITY_MATRIX"
status: "draft"
owner: "founder"
doc_class: "meta"
purpose: "Canonical PocketPilot documentation artifact"
depends_on: []
related_docs: []
canonical_path: "/docs/meta/DOC_TRACEABILITY_MATRIX.md"
---

# DOC_TRACEABILITY_MATRIX.md

## Purpose
Maps the major PocketPilot doc layers so a reviewer can see how founder doctrine flows into product behavior, surface rules, architecture, and implementation scope.

## 1. Traceability principle
PocketPilot should have a visible chain from:
- founder / governance truth
- product and behaviour docs
- UX / implementation-bridge docs
- architecture and object-contract docs
- phase and implementation reporting

This matrix exists so nothing becomes "important but floating."

## 2. Layer model
| Layer | Role | Typical homes |
|---|---|---|
| Founding truth | Identity, product laws, and non-negotiables | `docs/founder/`, `docs/governance/` |
| Product behavior | How PocketPilot should behave | `docs/product/`, `docs/behaviours/` |
| UX bridge | What major surfaces should show and suppress | `docs/ux/` |
| Architecture | How systems are shaped so rules survive build | `docs/architecture/` |
| Phase scope | What is landed, partial, or planned | `docs/phases/` |
| Knowledge content | Canonical in-product learning content | `docs/knowledge/` |
| Meta | Placement, dependency, and traceability help | `docs/meta/` |

## 3. Traceability matrix
| Source layer | Product / behaviour docs | UX docs | Architecture docs | Phase / scope docs |
|---|---|---|---|---|
| Doctrine / CANON / Guardrails | `SNAPSHOT_VISION.md`, `RELEVANCE_PRINCIPLE.md`, `NOTIFICATION_PHILOSOPHY.md`, `CONFIDENCE_LANGUAGE.md`, `SIGNAL_EXPOSURE.md` | `SNAPSHOT_SPEC.md`, `NOTIFICATION_EVENT_MATRIX.md`, `STRATEGY_STATUS_RULES.md`, `TRADE_HUB_GUARDRAILS.md` | `SNAPSHOT_SYSTEM.md`, `NOTIFICATION_ROUTER_MODEL.md`, `STRATEGY_STATUS_ENGINE.md`, `MARKET_EVENT_MODEL.md`, `ORIENTATION_CONTEXT.md` | `PHASE_MAP.md`, relevant `P*` / `PX-*` docs |
| Product behavior layer | `PROFILE_EXPLANATION_MODEL.md`, `LOG_AND_JOURNAL_MODEL.md`, `ASSET_NARRATIVE_MODEL.md`, `AI_EXPLANATION_LAYER.md` | `DASHBOARD_EXPOSURE_RULES.md`, `EVENT_LEDGER_VIEW_MODEL.md`, `KNOWLEDGE_LINKING_RULES.md` | `KNOWLEDGE_LINKING_ARCHITECTURE.md`, `EVENT_LEDGER_ARCHITECTURE.md`, `TRADE_HUB_RUNTIME_MODEL.md`, `RISK_LAYER_MODEL.md` | relevant family docs in `P4`, `P5`, `P6`, `P8`, `P9` |
| Knowledge layer | `KNOWLEDGE_LAYER.md` | `KNOWLEDGE_LINKING_RULES.md` | `KNOWLEDGE_LINKING_ARCHITECTURE.md`, `KNOWLEDGE_NODE_MODEL.md` | `P7-K1.md`, `P7-K2.md`, `P7-K3.md` |
| Reflection layer | `LOG_AND_JOURNAL_MODEL.md`, `ASSET_NARRATIVE_MODEL.md` | `EVENT_LEDGER_VIEW_MODEL.md` | `EVENT_LEDGER_ARCHITECTURE.md`, `EVENT_SYSTEM.md` | `P8-I1.md` to `P8-I4.md` |
| Preview / explanation layer | `AI_EXPLANATION_LAYER.md`, `PROFILE_EXPLANATION_MODEL.md` | relevant Strategy Preview / Snapshot / Dashboard UX docs | `STRATEGY_STATUS_ENGINE.md`, `ORIENTATION_CONTEXT.md`, supporting preview architecture docs already in repo | `P9-S1.md` to `P9-S5.md`, `PX-E1.md`, `PX-E2.md` |

## 4. Reading rule
Use this matrix in both directions:
- top-down: from doctrine to implementation
- bottom-up: from a surface, object, or phase doc back to source truth

## 5. Anti-patterns to block
- isolated docs with no upstream source
- implementation rules with no product-behavior basis
- architecture models with no consumer
- duplicate "source of truth" claims
