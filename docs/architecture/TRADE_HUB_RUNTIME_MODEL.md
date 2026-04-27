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
User-facing copy should stay plain-language while preserving service-owned execution/risk semantics.

## 2. Core rule
Prepared plan in, bounded action path out.

## 3. Suggested pipeline
`StrategyContext` + `AccountCapabilities` + `RiskLayer` + `ProtectionPlanGenerator` + `PreparedStopTargetReferenceProducer` + `TradeHubRiskLaneComposer`
-> `TradeHubAssembler`
-> `TradeHubModel`

## 4. Output shape
`TradeHubModel`
- `primaryPlan`
- `alternatePlans[]`
- `readinessState`
- `capabilityPath`
- `confirmationRequirements`
- `riskLane`
  - `selectedRiskBasis`
  - `preparedRiskLane`
  - `preferredRiskBasisAvailability`
  - `positionSizingAvailability`
  - `riskInputGuidanceAvailability`
  - `guardrailPreferencesAvailability`
  - `guardrailEvaluationAvailability`
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
- no UI-side reinterpretation of readiness, submission, or adapter semantics
- no implicit urgency escalators
- no plan-creation logic in presentation code
- no UI-side risk math
- no default-blocking guardrail enforcement

## 7. Runtime subcomponents
### Protection plan generator
Produces canonical plan options.

### Prepared stop/target reference producer
Produces one explicit prepared stop/target availability contract for selected-plan context.
It remains service-owned, deterministic, support-first, and returns unavailable when context is thin.
It also owns canonical copy shaping for prepared reference labels, source labels, limitation notes, and unavailable-reason wording so downstream consumers do not duplicate phrasing logic.
Trade Hub preview consumers should render that prepared output in one compact subordinate block and keep unavailable output quiet unless the service-owned reason says a calm explanation is useful.

### Risk basis selector
Determines which explicit risk bases are supported on the surface and preserves user-selected basis state without silent fallback in the app layer.
It also seeds the prepared lane from one account-level preferred basis when the service layer has honestly saved one.

### Trade Hub risk lane composer
Groups the risk-basis selector, preferred-basis resolver, prepared risk-per-trade context, sizing output, guidance, guardrail preferences, and guardrail evaluation into one prepared lane object.
It receives selected-account truth through the shared surface-account normalization seam so the prepared lane does not rebuild account-derived shape in each surface service.

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

### Execution-boundary display-state shaper
Shapes readiness/submission/adapter status text in service-owned helpers so visible labels stay calm, plain-language, and non-dispatching without moving semantic ownership into `app/`.

## 8. Testing expectations
- plan contract tests
- capability-path tests
- confirmation-required tests
- risk-basis explicitness tests
- prepared risk-context recomputation tests
- prepared stop/target availability tests
- prepared stop/target copy-normalization tests (source labels, limitation notes, unavailable wording)
- prepared stop/target preview placement tests (compact, subordinate, and non-blocking)
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
