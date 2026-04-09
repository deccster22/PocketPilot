# SIGNAL_EXPOSURE.md

## Purpose
Defines how much signal detail PocketPilot exposes, to whom, and on which surfaces. This doc protects the product from raw-indicator drift, clutter, and false sophistication.

## 1. Role of signal exposure
PocketPilot is not a raw-signal showroom. Signal exposure exists to support strategy interpretation, not to overwhelm the user with technical exhaust.

A useful rule:
**Users should experience interpreted meaning first, raw signal detail second.**

## 2. Non-negotiable rules
Signal exposure must:
- remain strategy-first
- follow Strategy → Profile → Relevance
- keep raw indicators subordinate to interpreted state
- avoid alerting directly from raw indicators
- remain account-scoped where relevant

Signal exposure must not:
- turn Snapshot into an indicator wall
- create fake authority through density
- reward advanced users with clutter for its own sake
- flatten all signals into equal importance

## 3. Exposure layers
### 3.1 Hidden raw layer
Full underlying signal detail may exist in the system, but is not user-facing by default.

### 3.2 Interpreted user layer
The default product layer:
- Strategy Status
- MarketEvents
- fit
- regime
- meaningful change

### 3.3 Optional supporting detail
Selected subordinate signals may appear where they improve understanding.

## 4. Surface rules
### Snapshot
No raw-indicator sprawl. Only subordinate supporting detail if it protects zero-scroll calm.

### Dashboard
Best place for limited supporting signal detail because it is the focus workspace.

### Trade Hub
Only signals that improve readiness, constraints, or action understanding should appear.

### Insights
Can support deeper event/signal relationship explanation after the fact.

## 5. Profile shaping
### Beginner
- interpreted output first
- strongest suppression of raw signal detail
- supporting explanation in plain language

### Intermediate
- selected supporting details during ambiguity or deeper review
- more optional exposure than Beginner

### Advanced
- denser exposure allowed
- but still shaped, not raw flood
- optional drill-downs may be appropriate later

## 6. Signal classes PocketPilot may expose
Examples:
- contributing alignment signals
- pattern formation state
- volatility context
- supporting participation / momentum context
- subordinate explanatory signal groups

These should appear only when they improve interpretation.

## 7. Signal classes PocketPilot should suppress by default
- raw oscillator feeds
- endless watchlist changes
- indicator widgets with no strategy value
- technical details that duplicate one another
- novelty signals without clear user meaning

## 8. Anti-patterns to block
- indicator stacking
- fake sophistication
- profile bloat
- advanced user punishment by clutter
- signal-to-push direct pipelines

## 9. Practical decision test
1. Does this signal detail improve interpretation?
2. Is it relevant to the selected strategy?
3. Is it appropriate for this profile and surface?
4. Is it more helpful than the attention it consumes?
5. Would removing it materially reduce user understanding?

## 10. Relationship to other docs
Sits beside:
- RELEVANCE_PRINCIPLE.md
- PROFILE_EXPLANATION_MODEL.md
- SNAPSHOT_VISION.md
- NOTIFICATION_PHILOSOPHY.md
- future NOTIFICATION_SYSTEM.md
- CANON / Product Specification

## 11. Open questions
- whether advanced users get optional signal detail toggles
- how supporting signal groups should be named in-product
- how much signal lineage should be visible beneath MarketEvents
