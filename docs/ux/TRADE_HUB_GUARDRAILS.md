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
- account-level preferred risk basis may seed the lane, but it must stay explicit and service-owned
- optional guardrail preferences may exist, but they must stay explicit, account-scoped, off by default, and non-blocking unless a future phase says otherwise
- the prepared risk lane should stay grouped into one service-owned contract rather than splitting basis, sizing, guidance, preferences, and evaluation across separate UI-owned paths
- prepared stop/target references must travel through one explicit service-owned availability contract and stay unavailable when context is thin
- prepared stop/target source labels, limitation notes, and unavailable wording must remain service-owned; `app/` must not reinterpret source confidence or rewrite phrasing locally
- prepared stop/target rendering must stay compact and subordinate inside existing Trade Hub planning support sections
- unavailable prepared-reference states must stay quiet and non-blocking; render calm copy only when the service-owned policy says it is useful
- user-facing Trade Hub/Risk Tool copy should prefer plain-language price terminology (`Entry price`, `Stop-loss price`, `Target price`, `Asset symbol`) and prepared-planning terminology (`Prepared planning levels`, `Prepared stop-loss level`, `Prepared target level`) even if internal contracts retain `reference` naming
- user-facing Trade Hub execution/risk section labels should avoid raw seam jargon (`service-owned`, `seam`) and prefer product wording (`planning view`, `sizing summary`, `readiness check`, `submission check`, `execution handoff`) while keeping the same boundary meaning
- one explicit non-dispatch line should remain visible in Trade Hub copy (for example, `This screen does not place trades.`)
- bounded explanatory content
- strategy / risk / regime layers must not collapse into a silent override engine

## 3. Allowed responsibilities
Trade Hub may:
- present prepared `ProtectionPlan` values
- provide SL / TP calculator access
- show one calm prepared sizing/max-loss output, including position size, max loss, and existing risk / reward framing
- expose one calm, explicit risk-basis selector when the prepared contract supports it
- show one calm account-level preferred-basis starting point when it exists
- show one calm grouped prepared risk lane when the prepared service contract supports it
- show prepared stop/target references only when the prepared service contract marks them available
- show one quiet unavailable prepared-reference line only when the service-owned unavailable policy says it should be visible
- show one calm optional guardrail-preferences summary and edit path when the prepared service contract supports it
- show one calm optional guardrail-evaluation summary when the prepared service contract supports it
- show prepared risk-per-trade context that explains framing without pushing action
- show one calm prepared risk-input guidance note when sizing context is thin or unsupported
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
- hide a preferred basis behind a global default
- hide guardrail preferences behind a global default or auto-blocking default-on posture
- hide guardrail evaluation behind a global default or auto-blocking default-on posture
- invent stop/target values when prepared context is thin or unsupported
- infer source-confidence or limitation wording in `app/` for prepared stop/target references
- turn unavailable prepared-reference states into alerts, badges, warning walls, or blockers
- turn incomplete-input guidance into a block, validator, or troubleshooting wall
- mutate preferred-basis state in app-owned persistence code
- mutate guardrail-preference state in app-owned persistence code
- turn guardrail evaluation into a blocker, validator, or warning wall

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
- prepared sizing/max-loss output
- prepared risk-per-trade context
- prepared stop/target reference availability
- grouped prepared risk-lane contract
- prepared guardrail evaluation status
- prepared risk-input guidance when the lane is incomplete
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
- calm guidance-placement tests
- optional guardrail preference summary tests
- prepared stop/target availability tests
- prepared stop/target placement and quiet-unavailable tests
- calm guardrail-evaluation status tests
- no-enforcement-by-default tests for guardrail preferences
- no-enforcement-by-default tests for guardrail evaluation

## 11. Anti-patterns to block
- one-tap execution drift
- urgency leakage
- hidden enforcement drift
- hidden risk-basis switching
- hidden guardrail blocking
- broad educational clutter
- silent logic in presentation layer
- action surfaces that look faster than they are trustworthy
- fear-language or compliance-theatre language

## 12. Relationship to other docs
Sits beside:
- `NOTIFICATION_PHILOSOPHY.md`
- `PROFILE_EXPLANATION_MODEL.md`
- `KNOWLEDGE_LINKING_RULES.md`
- `TRADE_INTENT_MODEL.md`
- `RISK_LAYER_MODEL.md`
- `TRADE_HUB_RUNTIME_MODEL.md`
