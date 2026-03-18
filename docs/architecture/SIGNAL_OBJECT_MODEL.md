---
Title: PocketPilot - Signal Object Model
Version: 2026-03
Source: docs/source/SIGNAL_OBJECT_MODEL.pdf
Last Updated: 2026-03-18
---

# SIGNAL_OBJECT_MODEL.md

Recommended location:
`/docs/architecture/SIGNAL_OBJECT_MODEL.md`

PocketPilot - Signal Object Model

Status: Architecture  
Maturity: Core (Phase 3 Foundation)  
Last Updated: 2026-03

---

## 1. Purpose

Signals are the structured inputs that feed PocketPilot's interpretation layer.

They are not the final user-facing product surface.

Signals represent meaningful strategy-relevant conditions detected from market data and indicator logic.

Those signals are then interpreted into MarketEvents, which power Snapshot, Alerts, Insights, and other product surfaces.

Canonical flow:

`quotes -> indicators -> signals -> strategy interpretation -> MarketEvents`

---

## 2. Philosophy

Signals are:

- structured
- deterministic
- strategy-relevant
- machine-readable
- confidence-aware

Signals are not:

- recommendations
- predictions
- UI messages
- user-facing alerts
- emotional prompts

PocketPilot does not expose raw signals as the primary product experience.

It exposes interpreted MarketEvents built from those signals.

---

## 3. Design Principles

### 3.1 Structured, not narrative

Signals must be represented as structured objects, never as free-form strings.

### 3.2 Deterministic

Given identical inputs, a strategy must emit the same signal set.

### 3.3 Strategy-aware

Signals are emitted within a strategy context.

The same market condition may matter differently to different strategies.

### 3.4 Explainable

Signals must support human explanation later, even if they are not directly shown to the user.

### 3.5 Confidence-aware

Signals must preserve certainty and supporting context so the system does not overstate confidence.

---

## 4. Canonical Role of Signals

Signals sit between indicator logic and interpreted product meaning.

They answer:

> "What relevant conditions are currently present for this strategy?"

They do not answer:

> "What should the user do?"

That distinction belongs to the interpretation layer and product messaging rules.

---

## 5. Canonical Signal Structure

Recommended canonical structure:

```ts
StrategySignal {
  signalCode: string
  strategyId: string
  accountId?: string
  symbol?: string

  strength?: number
  confidenceScore?: number
  certainty?: "confirmed" | "estimated"

  eventHint?: string
  title?: string
  message?: string

  metadata?: Record<string, unknown>
}
```

Field names may vary slightly to match implementation conventions, but the contract must preserve the same intent.

---

## 6. Required Fields

### signalCode

Machine-stable identifier for the signal.

Examples:

- `rsi_oversold`
- `volatility_spike`
- `drawdown_threshold`
- `momentum_break`
- `moving_average_cross`

This field is canonical and must not be replaced by titles or messages.

### strategyId

The strategy emitting the signal.

Signals are never global.

### eventHint

A structured hint about the type of MarketEvent this signal may contribute to.

Examples:

- `AlignmentForming`
- `AlignmentStrengthening`
- `AlignmentWeakening`
- `VolatilityExpansion`
- `PatternForming`

This allows event generation to remain machine-driven rather than title-driven.

---

## 7. Optional Fields

### symbol

Used when a signal is asset-specific.

### accountId

Used when the signal is account-scoped or venue-bound.

### strength

Relative weight or magnitude of the signal within strategy logic.

### confidenceScore

Optional score indicating the degree of confidence in the signal.

### certainty

Must reflect whether the supporting input data is confirmed or estimated.

### metadata

Strategy-specific supporting context.

Examples:

- indicator thresholds crossed
- volatility percentile
- regime context
- pattern subtype
- timeframe

Metadata must remain machine-usable and presentation-neutral.

---

## 8. Signal Lifecycle

Signals may exist in different effective states, but those states are not the same thing as MarketEvents.

A signal may be:

- detected
- active
- fading
- resolved

However, the product's primary visible lifecycle is handled through MarketEvents, not raw signal status.

Signals remain the upstream ingredients.

---

## 9. Relationship to MarketEvents

Signals feed MarketEvent generation.

Example:

- `signalCode: rsi_oversold`
- `signalCode: volatility_spike`
- `signalCode: support_proximity`

These may be interpreted as:

- `MarketEvent: AlignmentStrengthening`

This means multiple signals may contribute to one MarketEvent.

MarketEvents are the canonical interpreted product object.

Signals remain supporting evidence.

---

## 10. Relationship to UI

Signals may be visible in limited ways:

- debug observatory
- advanced detail layers
- explanation panels
- strategy diagnostics

But signals must not directly drive user-facing alerts or Snapshot states.

The correct path is:

`signals -> interpretation -> MarketEvents -> UI`

---

## 11. Certainty Rules

Signals must preserve certainty metadata from upstream quotes and data sources.

Rules:

- if any critical supporting data is estimated, the signal must be marked estimated
- estimated signals must not be narrated as confirmed
- certainty must propagate downstream into MarketEvents

This protects trust and prevents false authority.

---

## 12. Good vs Bad Signal Design

Good

- `rsi_oversold`
- `volatility_spike`
- `drawdown_threshold`
- `breakout_attempt`
- `pattern_confirmation`

Bad

- `"Looks bullish"`
- `"Buy setup"`
- `"Take action now"`
- `"Great opportunity"`

Signals must describe condition, not judgement.

---

## 13. Anti-Patterns

The following are violations:

- using titles/messages as canonical identifiers
- mixing UI copy into signal logic
- emitting unstructured strings instead of typed signals
- treating estimated signals as confirmed
- bypassing event generation and sending signals straight to product surfaces

---

## 14. Future Extensions

Potential later additions:

- signal grouping / clustering
- cross-signal confluence objects
- timeframe-aware signal hierarchies
- signal decay models
- historical signal quality analysis

All extensions must preserve:

- deterministic generation
- structured identity
- explainability
- separation from UI narration

---

## 15. Final Rule

Signals are the ingredients, not the meal.

If MarketEvents are the interpreted truth PocketPilot presents,

signals are the structured evidence that makes that truth explainable.

---

[Editor note: The source PDF includes the following trailing line on a separate final page, and its relationship to the canonical document body is unclear.]

> Once you've got Codex's branch pushed or PR'd, I'd move straight to this doc and then hand Codex **P3-2 EventLedger seam** after that.
