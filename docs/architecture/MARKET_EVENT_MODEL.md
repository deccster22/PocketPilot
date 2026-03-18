# MARKET_EVENT_MODEL.md

- Title: PocketPilot - Market Event Model
- Status: Architecture
- Maturity: Core (Phase 3 Foundation)
- Source file: `docs/source/MARKET_EVENT_MODEL.pdf`
- Last updated: 2026-03

---

## 1. Purpose

The MarketEvent is the canonical unit of meaning within PocketPilot.

It represents a **material change in interpreted market state**, as understood through a specific strategy and account context.

The system does not operate on raw signals. It operates on MarketEvents.

All user-facing surfaces, alerts, and history are powered by MarketEvents.

---

## 2. Definition

A MarketEvent is:

> A structured, strategy-aware representation of meaningful market change.

It is:

- not a raw signal
- not a prediction
- not a recommendation

It is an **interpreted state transition**.

---

## 3. Design Principles

### 3.1 Interpretation-first

Signals are inputs. Events are meaning.

`quotes -> indicators -> signals -> interpretation -> MarketEvent`

Only MarketEvents are exposed to the product layer.

---

### 3.2 Strategy-bound

Every MarketEvent must be tied to a strategy.

There is no global market truth.

`strategyId` is mandatory

---

### 3.3 Account-scoped

Events must reflect execution reality.

`accountId` is mandatory

MarketEvents must align with:

- the price feed of the execution venue
- the context of the selected account

---

### 3.4 Deterministic

Given identical inputs, MarketEvent generation must produce identical outputs.

No randomness. No hidden state.

---

### 3.5 Meaningful-only

Events represent meaningful change.

They must not fire for:

- micro price movement
- indicator noise
- non-state transitions

---

### 3.6 Certainty-aware

All events must carry certainty metadata.

Estimated and confirmed states must be distinguishable.

---

## 4. Event Lifecycle

MarketEvents follow a simple lifecycle:

1. Generated (by strategy interpretation)
2. Emitted (to EventStream)
3. Consumed (Snapshot, Alerts, Insights)
4. Persisted (EventLedger)

Events are immutable once created.

---

## 5. Event Structure

Canonical schema:

```ts
MarketEvent {
  eventId: string
  timestamp: number
  accountId: string
  symbol: string
  strategyId: string
  eventType: EventType
  alignmentState: AlignmentState
  signalsTriggered: SignalFlag[]
  confidenceScore: number
  certainty: "confirmed" | "estimated"
  price: number
  pctChange: number
  metadata: object
}
```

---

## 6. Core Fields Explained

### eventType

Defines the type of meaningful change.

Examples:

- AlignmentStrengthening
- AlignmentWeakening
- AlignmentConfirmed
- AlignmentBroken
- VolatilityExpansion
- RegimeShift

---

### alignmentState

Represents current strategy alignment.

Examples:

- Strong
- Forming
- Neutral
- Weak

---

### signalsTriggered

Compact list of contributing signals.

Examples:

- rsi_oversold
- volatility_spike
- moving_average_cross

Signals are not exposed raw to the user. They support explainability.

---

### confidenceScore

Numerical representation of alignment strength.

Range: `0.0 -> 1.0`

Used for:

- internal ranking
- advanced profile visibility

Not used for:

- authoritative claims
- forced decisions

---

### certainty

Indicates data reliability.

Values:

- confirmed -> full data integrity
- estimated -> partial / inferred

Must propagate to all downstream surfaces.

---

### metadata

Flexible extension field.

Used for:

- strategy-specific context
- pattern lifecycle state
- regime overlays

Must not contain:

- UI-specific logic
- presentation formatting

---

## 7. Event Types (Initial Set)

Core event categories:

### Alignment Events

- AlignmentForming
- AlignmentStrengthening
- AlignmentWeakening
- AlignmentConfirmed
- AlignmentBroken

### Context Events

- VolatilityExpansion
- VolatilityCompression
- RegimeShift

### Pattern Events (Phase 3+)

- PatternForming
- PatternDeveloping
- PatternConfirmed
- PatternInvalidated
- PatternResolved

---

## 8. Event Boundaries

MarketEvents must NOT:

- expose raw indicator values
- include UI narration
- include recommendations
- include emotional language
- imply action

---

## 9. Relationship to Other Systems

### EventStream

Ordered sequence of MarketEvents.

Used for:

- real-time updates
- alert triggering

---

### EventLedger

Persistent storage of:

- MarketEvents
- UserActionEvents

Used for:

- history
- reflection
- export

---

### Snapshot

Displays latest relevant MarketEvent.

---

### Alerts

Triggered by MarketEvent transitions.

---

### Insights

Aggregates MarketEvents over time.

---

## 10. Anti-Patterns

The following are violations:

- Creating events from raw signals directly
- Emitting events without strategy context
- Mixing multiple strategies into one event
- Treating estimated as confirmed
- Embedding UI logic inside event objects

---

## 11. Future Extensions

Planned evolution:

- multi-event correlation (composite events)
- cross-symbol contextual events
- probabilistic confidence modelling
- pattern lifecycle integration

All extensions must preserve:

- determinism
- strategy binding
- clarity-first philosophy

---

## 12. Final Rule

If a change does not produce a meaningful MarketEvent, it does not exist in PocketPilot.
