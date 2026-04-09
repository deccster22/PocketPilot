---
title: "KNOWLEDGE_NODE_MODEL"
status: "draft"
owner: "founder"
doc_class: "model"
purpose: "Canonical PocketPilot documentation artifact"
depends_on: []
related_docs: []
canonical_path: "/docs/architecture/KNOWLEDGE_NODE_MODEL.md"
---

# KNOWLEDGE_NODE_MODEL.md

## Purpose
Defines the canonical content object for PocketPilot's Knowledge Library.

## 1. Role
`KnowledgeNode` is the single canonical unit of knowledge content in PocketPilot. It allows the product to resolve contextual links, browse library content, and manage different media types without inventing parallel content shapes.

## 2. Core rule
**One canonical knowledge object by default.**

## 3. Canonical shape
`KnowledgeNode`
- `topicId`
- `title`
- `summary`
- `content`
- `mediaType`
- `difficulty`
- `strategyLinks[]`
- `signalLinks[]`
- `eventTypeLinks[]`
- `reviewStatus`
- `version?`
- `relatedTopics[]?`
- `surfaceHints[]?`

## 4. Required fields
- `topicId`
- `title`
- `content`
- `mediaType`
- `difficulty`

## 5. Optional extension fields
Allowed where useful:
- `summary`
- `relatedTopics`
- `surfaceHints`
- `lastReviewedAt`
- `futureMediaCandidates`

Extensions should remain additive, not mutate the base object into many competing classes.

## 6. Invariants
- `topicId` is unique
- knowledge nodes are stable link targets
- node content is user-facing
- knowledge nodes must remain optional and non-gating in product behavior
- canonical source should be repo-managed content, not floating UI-authored copy

## 7. Link resolution behavior
Contextual links should resolve to canonical `topicId` targets wherever possible.
Do not create unofficial explainers outside the `KnowledgeNode` system.

## 8. Media model
Supported:
- article
- diagram
- short video
- interactive explainer
- case study

## 9. Anti-patterns to block
- duplicate `topicId` values
- unofficial content fragments outside the node model
- "AI-only knowledge" with no canonical node target
- surface-specific rewritten truth nodes

## 10. Testing expectations
- `topicId` uniqueness tests
- required-field validation
- resolver integrity tests
- link-target stability tests

## 11. Relationship to other docs
Sits beside:
- `KNOWLEDGE_MODEL.md`
- `KNOWLEDGE_LAYER.md`
- `KNOWLEDGE_LINKING_RULES.md`
- `KNOWLEDGE_LINKING_ARCHITECTURE.md`
