---
title: "DASHBOARD_EXPOSURE_RULES"
status: "draft"
owner: "founder"
doc_class: "ux-spec"
purpose: "Canonical PocketPilot documentation artifact"
depends_on: []
related_docs: []
canonical_path: "/docs/ux/DASHBOARD_EXPOSURE_RULES.md"
---

# DASHBOARD_EXPOSURE_RULES.md

## Purpose
Defines what the Dashboard is allowed to expose, how it should prioritize information, and how strategy / profile shaping works without collapsing into user-built chaos.

## 1. Product role
Dashboard is the **focus** surface. It is the deep workspace for monitoring and analysis.
Its job is to answer:
- what signals are active
- what the market is doing
- what my strategy thinks

## 2. Non-negotiables
- strategy-aware shaping
- account-scoped truth
- relevance-filtered exposure
- customizable through priority tuning, not free-form chaos
- interpreted meaning first
- raw detail only when useful and subordinate

## 3. Zone model
Dashboard should consume a prepared surface model with zones such as:
- Prime
- Secondary
- Deep

Prime shows the most strategy-relevant items.
Secondary shows useful but subordinate context.
Deep holds lower-priority drill-down or inspection content.

## 4. Strategy shaping
Dashboard automatically reshapes by selected strategy.
Relevant `MarketEvent` values and supporting metrics are emphasized.
Irrelevant event families are scaled down or removed.

## 5. Profile shaping
### Beginner
- simpler density
- more visible labels
- more contextual support

### Intermediate
- balanced density
- optional deeper context

### Advanced
- denser prime / secondary exposure
- tighter phrasing
- still relevance-filtered, not raw flood

## 6. What belongs in Prime
Examples:
- core strategy-driving `MarketEvent` values
- central alignment / trajectory clues
- key support context for the chosen strategy
- bounded top-priority fit or volatility context where relevant

## 7. What belongs in Secondary
Examples:
- supporting signal groups
- secondary fit / regime context
- contextual knowledge links
- explanatory chips

## 8. What belongs in Deep
Examples:
- drill-down explanations
- deeper event lineage
- historical comparison hooks
- richer context panels

## 9. Customization rule
Dashboard customization should be:
- priority tuning
- hide / show within safe limits
- bounded by canonical relevance rules

It should not be:
- full drag-and-drop dashboard construction
- free-form widget chaos
- logic mutation by layout

## 10. Knowledge linking posture
Dashboard is the strongest contextual-link surface.
Links should explain what the user is seeing, not distract from it.

## 11. Testing expectations
- zone assignment tests
- strategy shaping tests
- account-scope tests
- profile-density tests
- no-chaos customization boundary tests

## 12. Anti-patterns to block
- Dashboard drift into a generic market terminal
- free-form user-built chaos
- irrelevant signal density
- strategy-agnostic layouts
- explanation clutter that overwhelms prime context

## 13. Relationship to other docs
Sits beside:
- `RELEVANCE_PRINCIPLE.md`
- `SIGNAL_EXPOSURE.md`
- `PROFILE_EXPLANATION_MODEL.md`
- `KNOWLEDGE_LINKING_RULES.md`
- `DASHBOARD_SPEC.md`
- `DASHBOARD_MODEL.md`
