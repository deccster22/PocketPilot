---
title: "NOTIFICATION_EVENT_MATRIX"
status: "draft"
owner: "founder"
doc_class: "ux-spec"
purpose: "Canonical PocketPilot documentation artifact"
depends_on: []
related_docs: []
canonical_path: "/docs/ux/NOTIFICATION_EVENT_MATRIX.md"
---

# NOTIFICATION_EVENT_MATRIX.md

## Purpose
Defines which event classes are allowed to surface through which attention channels.

## 1. Product role
This doc operationalizes Notification Philosophy by mapping meaningful interpreted events to:
- passive indicators
- in-app haptics
- in-app notices
- push (where phase-legal later)

## 2. Non-negotiables
- no raw-indicator notifications
- no data-twitch notifications
- foreground-only constraints respected while phase rules require it
- strategy / account relevance required
- calm phrasing only
- least invasive channel wins by default

## 3. Canonical event families
Use canonical `MarketEvent` classes or equivalent interpreted event families only.

Examples:
- `StrategyAlignmentChange`
- `VolatilityExpansion`
- `RegimeShift`
- `CandlePatternFormation`
- `PriceThresholdMeaningChange`
- `ProtectionPlanPrepared`
- `TradeReadinessChanged`
- `UserActionRecorded` (usually passive only)

## 4. Channel matrix
### Passive indicator only
Good candidates:
- minor but meaningful alignment drift
- Since Last Checked updates
- summary availability
- reflection artifacts
- non-urgent new insight availability

### Passive + in-app haptic
Good candidates:
- meaningful strategy state transition while app is open
- signal confirmation while app is open
- notable fit / regime shift that materially changes interpretation

### In-app notice
Good candidates:
- major alignment strengthening / weakening
- relevant volatility expansion
- confirmation or invalidation event with clear strategy impact
- Trade Hub readiness / plan prepared state

### Push (future / phase-gated)
Potential later candidates:
- only highest-value interpreted events
- only if background behavior becomes legally / canonically allowed
- only if trust rules and throttles are strong

## 5. Events that should never page the user by default
- raw RSI / MACD / oscillator moves
- small price changes
- general market drama not tied to the selected strategy
- educational content availability
- guilt-based re-entry prompts
- passive ledger accumulation

## 6. Event severity considerations
Severity is not "market drama."
Severity means interruption-worthiness in PocketPilot terms:
- strategy impact
- account relevance
- novelty
- time sensitivity
- explanation cost if deferred

## 7. Duplicate and suppression rules
If a stronger event already explains the state, weaker related events should collapse into it.
Repeated same-family events should cool down.
Contradictory notices should not fire side by side without synthesis.

## 8. Profile shaping
Profiles may change:
- which eligible events become visible
- whether phrasing is fuller or tighter
- tolerance for secondary notices

Profiles may not change:
- canonical event truth
- background policy
- urgency rules

## 9. Suggested starter matrix
| Event family | Passive | Haptic | In-app notice | Push later |
|---|---|---|---|---|
| Strategy alignment change | Yes | Yes | Yes | Maybe |
| Major volatility shift | Yes | Yes | Yes | Maybe |
| Regime shift affecting strategy | Yes | Maybe | Yes | Maybe |
| Signal confirmation | Yes | Yes | Yes | Maybe |
| Minor price move | No | No | No | No |
| Raw indicator fluctuation | No | No | No | No |
| Summary / review available | Yes | No | Maybe | No |
| ProtectionPlan prepared | Yes | Maybe | Yes | No by default |

## 10. Testing expectations
- channel eligibility tests
- suppression / cooldown tests
- foreground-only tests
- certainty wording tests
- profile exposure tests

## 11. Anti-patterns to block
- event proliferation
- duplicate storms
- alert spam by reclassification
- urgency by channel escalation
- push inflation once phase-gated features appear

## 12. Relationship to other docs
Sits beside:
- `NOTIFICATION_PHILOSOPHY.md`
- `NOTIFICATION_SYSTEM.md`
- `NOTIFICATION_ROUTER_MODEL.md`
- `RELEVANCE_PRINCIPLE.md`
- `PROFILE_EXPLANATION_MODEL.md`
