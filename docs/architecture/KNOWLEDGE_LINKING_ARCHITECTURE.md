---
title: "KNOWLEDGE_LINKING_ARCHITECTURE"
status: "draft"
owner: "founder"
doc_class: "architecture"
purpose: "Canonical PocketPilot documentation artifact"
depends_on: []
related_docs: []
canonical_path: "/docs/architecture/KNOWLEDGE_LINKING_ARCHITECTURE.md"
---

# KNOWLEDGE_LINKING_ARCHITECTURE.md

## Purpose
Defines the architecture that resolves contextual knowledge links from canonical product state into stable `KnowledgeNode` targets.

## 1. System role
Knowledge links should be resolved by rules and canonical node references, not improvised in UI copy.

## 2. Core rule
Current view state + strategy + profile + surface + relevance = allowed knowledge targets.

## 3. Suggested pipeline
`SurfaceState` + `StrategyContext` + `Profile` + `RelevanceRules` + `KnowledgeIndex`
-> `KnowledgeLinkResolver`
-> `KnowledgeLinkSet`

## 4. Inputs
- current surface id
- visible interpreted entities
- selected strategy
- user profile
- current account / asset context
- `KnowledgeNode` index and topic metadata

## 5. Output shape
`KnowledgeLink`
- `topicId`
- `label`
- `placementHint`
- `surface`
- `priority`
- `rationaleTag`

## 6. Resolver responsibilities
- map visible concepts to canonical `topicId` values
- suppress links that violate surface rules
- shape visibility by profile
- prevent duplicate / overlapping links
- preserve Snapshot caution rules

## 7. Hard constraints
- no floating unofficial explainers
- no direct UI-authored knowledge drift
- no forced-link gating
- no surface-level link spam

## 8. Testing expectations
- topic resolution tests
- duplicate suppression tests
- surface-rule tests
- profile visibility tests

## 9. Relationship to other docs
Sits beside:
- `KNOWLEDGE_LINKING_RULES.md`
- `KNOWLEDGE_LAYER.md`
- `KNOWLEDGE_NODE_MODEL.md`
- `RELEVANCE_PRINCIPLE.md`
