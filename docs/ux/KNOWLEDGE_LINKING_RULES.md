---
title: "KNOWLEDGE_LINKING_RULES"
status: "draft"
owner: "founder"
doc_class: "ux-spec"
purpose: "Canonical PocketPilot documentation artifact"
depends_on: []
related_docs: []
canonical_path: "/docs/ux/KNOWLEDGE_LINKING_RULES.md"
---

# KNOWLEDGE_LINKING_RULES.md

## Purpose
Converts Knowledge Layer philosophy into concrete linking rules for product surfaces.

## 1. Product role
Knowledge links are contextual bridges into the Knowledge Library. They should explain what the user is currently seeing without turning the app into a course platform.

## 2. Non-negotiables
- optional
- accessible
- non-intrusive
- strategy-first
- never punitive
- never block core execution or navigation
- respect Strategy -> Profile -> Relevance

## 3. Canonical link types
### Surface-linked explainer
Attached to a visible concept on the current screen.
Examples:
- Strategy Status
- `MarketEvent`
- fit
- regime
- stop loss
- `ProtectionPlan`

### Strategy-linked follow-on
Attached to the user's selected strategy or strategy cluster.

### Reflection-linked follow-on
Attached to Insights / Event Ledger / summaries / reorientation surfaces.

### Trade Hub bounded explainer
Short risk / readiness support links in the action layer.

## 4. Surface rules
### Snapshot
Weakest link surface.
Links here, if any, must be passive and subordinate.
No clusters, no rabbit holes.

### Dashboard
Strongest link surface.
Best home for:
- concept explainers
- strategy links
- event interpretation links
- contextual glossary-like support

### Trade Hub
Bounded link surface.
Allowed:
- stop loss
- take profit
- risk / reward
- position sizing
- `ProtectionPlan`
- support-not-enforcement explanation

Blocked:
- broad educational detours
- "learn more" clutter clouds

### Insights
Strong fit for deeper follow-ons:
- Event Ledger
- Reorientation
- Summary Archive
- review surfaces
- log / journal explanation

## 5. Profile rules
### Beginner
- links more visible
- plain-language labels
- stronger presence where concepts are new

### Intermediate
- contextual surfacing during ambiguity or drift
- moderate visibility

### Advanced
- links remain available
- less constant surfacing
- more reference-like behavior

## 6. Linking criteria
A knowledge link should exist only if:
1. it explains something currently in view
2. it reduces confusion quickly
3. it is relevant to the selected strategy or surface
4. it is easy to ignore
5. it improves clarity more than it adds visual weight

## 7. Link label rules
Good labels:
- "What Strategy Status Means"
- "What Market Regime Means"
- "What Protection Plans Are For"

Bad labels:
- "Must Read"
- "Learn This First"
- "Before You Continue"
- "Recommended Reading" in an action-critical moment

## 8. Placement rules
Prefer:
- inline secondary affordance
- small help chip
- compact "learn why" pattern
- drawer / tooltip / side panel where appropriate

Avoid:
- modal traps
- forced navigations
- stacked link lists
- visual dominance over primary state

## 9. Relationship to KnowledgeNode model
Links should resolve to canonical `KnowledgeNode` targets wherever possible.
Do not create floating unofficial explanation content that bypasses the knowledge system.

## 10. Analytics posture
If link analytics exist later, they should be used to improve clarity, not to pressure engagement.
No streaks. No "users who tapped this performed better" nonsense.

## 11. Anti-patterns to block
- knowledge spam
- Snapshot study-hall drift
- action-layer detours
- patronizing beginner overlinking
- advanced-user dead UI through hidden knowledge
- unofficial explainers outside the canonical node system

## 12. Practical decision test
1. Does this explain the thing currently in front of the user?
2. Is this surface an appropriate place for the link?
3. Is the link optional and visually subordinate?
4. Does this support the selected strategy / user state?
5. Would removing the link materially reduce clarity?

## 13. Relationship to other docs
Sits beside:
- `KNOWLEDGE_LAYER.md`
- `RELEVANCE_PRINCIPLE.md`
- `PROFILE_EXPLANATION_MODEL.md`
- `SNAPSHOT_SPEC.md`
- `DASHBOARD_EXPOSURE_RULES.md`
- `KNOWLEDGE_LINKING_ARCHITECTURE.md`
