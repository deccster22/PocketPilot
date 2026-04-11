---
title: "RISK_LAYER_MODEL"
status: "draft"
owner: "founder"
doc_class: "model"
purpose: "Canonical PocketPilot documentation artifact"
depends_on: []
related_docs: []
canonical_path: "/docs/architecture/RISK_LAYER_MODEL.md"
---

# RISK_LAYER_MODEL.md

## Purpose
Defines the canonical risk-support layer that powers SL/TP, risk / reward, max loss, readiness, and related support objects.

## 1. Role
The Risk Layer is a support system, not an enforcement engine by default. It prepares structured risk context so the product can explain and constrain action without becoming paternalistic or silent.

## 2. Core rule
**Prepared risk context in, bounded support out.**

## 3. Suggested objects
Possible core objects:
- `RiskContext`
- `RiskConstraint`
- `RiskPreview`
- `RiskRewardCalculation`
- `MaxLossModel`
- `RiskBasisAvailability`
- `RiskPerTradeContext`
- `PositionSizingOutput`
- `PositionSizingAvailability`
- `RiskInputGuidance`
- `RiskInputGuidanceAvailability`
- `ReadinessState`

## 4. Responsibilities
- calculate structured risk context
- keep selected risk basis explicit and legible
- remember one preferred basis per account through a service-owned seam
- prepare bounded review outputs for Trade Hub
- support stop loss / take profit explanation
- provide consistent max loss / position sizing / risk-reward logic
- shape one canonical prepared sizing/max-loss output from the same service-owned inputs
- prepare risk-per-trade context without turning it into advice
- prepare one calm risk-input guidance note when sizing / max-loss context is thin or unsupported
- expose readiness constraints without silently overriding the user

## 5. Invariants
- account-scoped
- capability-aware where needed
- confidence-honest
- support-not-enforcement unless future policy explicitly changes that
- selected risk basis must flow through prepared summaries
- account-level preferred basis may seed the selected basis, but it must remain explicit in the prepared contract
- unsupported or incomplete risk-input guidance must stay support-first and non-enforcing by default
- no hidden action mutation in the UI layer

## 6. Consumers
- Trade Hub
- `ProtectionPlan`-style plan generators
- risk education explainers
- review and export flows where relevant

## 7. Anti-patterns to block
- silent override drift
- duplicated risk math in presentation layers
- raw constraint leakage without explanation
- "discipline scoring" disguised as risk support
- hidden preferred-basis switching in app code

## 8. Testing expectations
- calculation correctness tests
- explicit-basis selection tests
- account-scope tests
- consumer contract tests
- sizing-output availability tests
- unsupported / incomplete guidance tests
- support-vs-enforcement boundary tests

## 9. Relationship to other docs
Sits beside:
- `TRADE_INTENT_MODEL.md`
- `TRADE_HUB_RUNTIME_MODEL.md`
- `TRADE_HUB_GUARDRAILS.md`
- `TRADE_HUB_GUARDRAILS.md`
- position sizing / SL / TP knowledge docs
