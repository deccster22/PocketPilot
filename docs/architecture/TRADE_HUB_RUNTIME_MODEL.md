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
`StrategyContext` + `AccountCapabilities` + `RiskLayer` + `ProtectionPlanGenerator` + `RiskBasisSelector` + `PreparedSizingOutputBuilder` + `PreferredRiskBasisResolver` + `GuardrailPreferencesResolver` + `GuardrailEvaluationResolver` + `RiskInputGuidanceBuilder`
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
- `preferredRiskBasisAvailability`
- `guardrailPreferencesAvailability`
- `guardrailEvaluationAvailability`
- `riskPerTradeContext`
- `positionSizing`
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
- no hidden UI-side guardrail persistence
- no hidden UI-side guardrail evaluation
- no implicit urgency escalators
- no plan-creation logic in presentation code
- no UI-side risk math
- no default-blocking guardrail enforcement

## 7. Runtime subcomponents
### Protection plan generator
Produces canonical plan options.

### Risk basis selector
Determines which explicit risk bases are supported on the surface and preserves user-selected basis state without silent fallback in the app layer.
It also seeds the prepared lane from one account-level preferred basis when the service layer has honestly saved one.

### Preferred risk basis resolver
Resolves the saved account-level preferred basis through the service-owned seam without introducing silent cross-account fallback.

### Guardrail preferences resolver
Resolves optional account-level guardrail preferences through the service-owned seam without introducing silent defaults or UI-owned persistence.

### Guardrail evaluation resolver
Resolves the prepared plan against enabled guardrail preferences through the service-owned seam and returns calm descriptive status without blocking by default.

### Risk-per-trade context builder
Builds one calm prepared framing from selected basis, prepared plan references, and current selected-account context where honest.

### Prepared sizing output builder
Builds one calm prepared position-sizing and max-loss readout from the selected basis, prepared plan references, and current selected-account context where honest.

### Risk-input guidance builder
Builds one calm prepared explanation for unsupported or incomplete sizing context from the selected basis, prepared plan references, current selected-account context, and sizing availability where relevant.

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
- prepared sizing-output availability tests
- guardrail-preference explicitness tests
- guardrail-evaluation explicitness tests
- risk-input guidance availability tests
- profile visibility tests
- knowledge-link boundary tests

## 9. Relationship to other docs
Sits beside:
- `TRADE_HUB_GUARDRAILS.md`
- `TRADE_INTENT_MODEL.md`
- `RISK_LAYER_MODEL.md`
- `PROFILE_EXPLANATION_MODEL.md`
