---
title: "DEPENDENCY_MAP"
status: "draft"
owner: "founder"
doc_class: "meta"
purpose: "Canonical PocketPilot documentation artifact"
depends_on: []
related_docs: []
canonical_path: "/docs/meta/DEPENDENCY_MAP.md"
---

# DEPENDENCY_MAP.md

## Purpose
Shows the dependency graph across the PocketPilot documentation stack.

## 1. Core dependency idea
Every lower-level doc should be able to answer:
- what upstream rule authorizes me?
- what downstream docs or systems consume me?

## 2. High-level dependency flow
```mermaid
flowchart TD
    A["Founder / Governance Truth"] --> B["Product / Behaviour Docs"]
    B --> C["UX / Implementation Bridge"]
    C --> D["Architecture / Object Contracts"]
    D --> E["Phases / Implementation Scope"]
    B --> F["Knowledge Content and Linking"]
    A --> G["Meta / Traceability"]
    B --> G
    C --> G
    D --> G
    E --> G
    F --> G
```

## 3. Product-to-UX dependency map
```mermaid
flowchart TD
    SV["SNAPSHOT_VISION"] --> SS["SNAPSHOT_SPEC"]
    RP["RELEVANCE_PRINCIPLE"] --> DER["DASHBOARD_EXPOSURE_RULES"]
    NP["NOTIFICATION_PHILOSOPHY"] --> NEM["NOTIFICATION_EVENT_MATRIX"]
    KL["KNOWLEDGE_LAYER"] --> KLR["KNOWLEDGE_LINKING_RULES"]
    PEM["PROFILE_EXPLANATION_MODEL"] --> SSR["STRATEGY_STATUS_RULES"]
    LJ["LOG_AND_JOURNAL_MODEL"] --> ELVM["EVENT_LEDGER_VIEW_MODEL"]
```

## 4. UX-to-architecture dependency map
```mermaid
flowchart TD
    SS["SNAPSHOT_SPEC"] --> SSYS["SNAPSHOT_SYSTEM"]
    DER["DASHBOARD_EXPOSURE_RULES"] --> DM["DASHBOARD_MODEL"]
    KLR["KNOWLEDGE_LINKING_RULES"] --> KLA["KNOWLEDGE_LINKING_ARCHITECTURE"]
    NEM["NOTIFICATION_EVENT_MATRIX"] --> NRM["NOTIFICATION_ROUTER_MODEL"]
    SSR["STRATEGY_STATUS_RULES"] --> SSE["STRATEGY_STATUS_ENGINE"]
    THG["TRADE_HUB_GUARDRAILS"] --> THR["TRADE_HUB_RUNTIME_MODEL"]
    ELVM["EVENT_LEDGER_VIEW_MODEL"] --> ELA["EVENT_LEDGER_ARCHITECTURE"]
```

## 5. Architecture-to-contract dependency map
```mermaid
flowchart TD
    SSYS["SNAPSHOT_SYSTEM"] --> OC["ORIENTATION_CONTEXT"]
    SSYS --> SO["SNAPSHOT_OBJECT"]
    KLA["KNOWLEDGE_LINKING_ARCHITECTURE"] --> KN["KNOWLEDGE_NODE_MODEL"]
    SSE["STRATEGY_STATUS_ENGINE"] --> ME["MARKET_EVENT_MODEL"]
    NRM["NOTIFICATION_ROUTER_MODEL"] --> ME
    ELA["EVENT_LEDGER_ARCHITECTURE"] --> ES["EVENT_SYSTEM"]
    THR["TRADE_HUB_RUNTIME_MODEL"] --> RL["RISK_LAYER_MODEL"]
```

## 6. Review rule
A doc with no visible parent or child should be treated as suspicious until its place is clear.

## 7. Anti-patterns to block
- sideways duplicate docs claiming the same job
- architecture docs with no object contracts or consumers
- object contracts with no consumer
- surface specs that bypass product behavior
