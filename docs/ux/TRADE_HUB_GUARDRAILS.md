---
title: "TRADE_HUB_GUARDRAILS"
status: "draft"
owner: "founder"
doc_class: "ux-spec"
purpose: "Canonical PocketPilot documentation artifact"
depends_on: []
related_docs: []
canonical_path: "/docs/ux/TRADE_HUB_GUARDRAILS.md"
---

# TRADE_HUB_GUARDRAILS.md

## Purpose
Defines the UX and behavior constraints that keep Trade Hub execution-aware but not execution-pushy.

## 1. Product role
Trade Hub is the action layer. It exists to reduce friction **when the user has chosen to act**, not to manufacture the urge to act.

## 2. Non-negotiables
- support, not enforcement by default
- confirmation required
- no one-tap execution by default
- no casino behavior
- capability-aware execution paths
- account-scoped truth
- bounded explanatory content
- strategy / risk / regime layers must not collapse into a silent override engine

## 3. Allowed responsibilities
Trade Hub may:
- present prepared `ProtectionPlan` values
- provide SL / TP calculator access
- show position size, max loss, and risk / reward outputs
- expose one calm, explicit risk-basis selector when the prepared contract supports it
- show prepared risk-per-trade context that explains framing without pushing action
- present readiness / constraints / rationale
- expose confirmation-safe quick actions where allowed
- adapt execution path by platform capability

## 4. Forbidden responsibilities
Trade Hub must not:
- auto-execute by default
- present hidden prioritization or silent action logic in UI
- pressure users with urgency copy
- force education before use
- behave like a slot machine with buttons

## 5. ProtectionPlan posture
`ProtectionPlan` is the main logic object behind action framing.
Trade Hub should consume prepared plans and render them, not recreate logic inside the UI.

Expected prepared data:
- primary plan
- limited alternatives
- rationale
- constraints
- readiness state
- risk basis availability
- selected risk basis
- prepared risk-per-trade context
- confirmation metadata
- capability path type

## 6. Quick action rules
Quick actions are advanced-only or explicitly unlocked.
They must:
- always require confirmation
- stay bounded to prepared actions
- remain capability-aware
- avoid casino-like behavior

## 7. Knowledge-link rules inside Trade Hub
Allowed:
- stop loss
- take profit
- risk / reward
- position sizing
- `ProtectionPlan`
- support-not-enforcement explanation

Blocked:
- broad strategy tutorials
- long educational detours
- cluttery "you should read this first" paths

## 8. Profile shaping
### Beginner
- more readiness explanation
- clearer constraints
- lighter surface exposure by default

### Intermediate
- balanced guidance
- bounded context

### Advanced
- compact review plus prepared action framing
- optional quick actions where policy allows

## 9. Capability-aware execution posture
Trade Hub should adapt path selection by platform capability:
- `BRACKET`
- `OCO`
- `GUIDED_SEQUENCE`
- `UNAVAILABLE`

The UI renders the prepared path only. It should not contain hidden execution logic.

## 10. Testing expectations
- confirmation-required tests
- quick-action visibility tests
- capability-path contract tests
- certainty wording tests
- non-directive beginner-copy tests

## 11. Anti-patterns to block
- one-tap execution drift
- urgency leakage
- hidden enforcement drift
- hidden risk-basis switching
- broad educational clutter
- silent logic in presentation layer
- action surfaces that look faster than they are trustworthy

## 12. Relationship to other docs
Sits beside:
- `NOTIFICATION_PHILOSOPHY.md`
- `PROFILE_EXPLANATION_MODEL.md`
- `KNOWLEDGE_LINKING_RULES.md`
- `TRADE_INTENT_MODEL.md`
- `RISK_LAYER_MODEL.md`
- `TRADE_HUB_RUNTIME_MODEL.md`
