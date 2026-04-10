---
title: "TRADE_HUB_RUNTIME_MODEL"
status: "draft"
owner: "founder"
doc_class: "architecture"
purpose: "Canonical PocketPilot documentation artifact"
depends_on: []
related_docs: []
canonical_path: "/docs/architecture/TRADE_HUB_RUNTIME_MODEL.md"
---

# TRADE_HUB_RUNTIME_MODEL.md

## Purpose
Defines the runtime architecture that powers Trade Hub as a prepared, confirmation-safe action layer.

## 1. System role
Trade Hub consumes prepared action objects and renders execution-safe paths without embedding hidden decision logic in the UI.

## 2. Core rule
Prepared plan in, bounded action path out.

## 3. Suggested pipeline
`StrategyContext` + `AccountCapabilities` + `RiskLayer` + `ProtectionPlanGenerator` + `RiskBasisSelector`
-> `TradeHubAssembler`
-> `TradeHubModel`

## 4. Output shape
`TradeHubModel`
- `primaryPlan`
- `alternatePlans[]`
- `readinessState`
- `capabilityPath`
- `confirmationRequirements`
- `riskBasisAvailability`
- `selectedRiskBasis`
- `riskPerTradeContext`
- `boundedKnowledgeLinks[]`
- `rationaleSummary`

## 5. Capability paths
- `BRACKET`
- `OCO`
- `GUIDED_SEQUENCE`
- `UNAVAILABLE`

The view renders the selected prepared path only.

## 6. Hard constraints
- no one-tap default execution
- no hidden UI-side action reprioritization
- no hidden UI-side risk-basis switching
- no implicit urgency escalators
- no plan-creation logic in presentation code
- no UI-side risk math

## 7. Runtime subcomponents
### Protection plan generator
Produces canonical plan options.

### Risk basis selector
Determines which explicit risk bases are supported on the surface and preserves user-selected basis state without silent fallback in the app layer.

### Risk-per-trade context builder
Builds one calm prepared framing from selected basis, prepared plan references, and current selected-account context where honest.

### Capability mapper
Determines valid execution path by venue / platform constraints.

### Assembler
Builds `TradeHubModel` from prepared plan and capability context.

### Confirmation layer
Ensures required confirmation steps remain intact.

## 8. Testing expectations
- plan contract tests
- capability-path tests
- confirmation-required tests
- risk-basis explicitness tests
- prepared risk-context recomputation tests
- profile visibility tests
- knowledge-link boundary tests

## 9. Relationship to other docs
Sits beside:
- `TRADE_HUB_GUARDRAILS.md`
- `TRADE_INTENT_MODEL.md`
- `RISK_LAYER_MODEL.md`
- `PROFILE_EXPLANATION_MODEL.md`
