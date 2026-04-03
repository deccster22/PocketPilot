# Explanation Model (PX-E1)

## Purpose
`services/explanation` is the first thin explanation seam for PocketPilot.

It answers three product questions without pretending certainty:
- Why am I seeing this?
- What interpreted events led here?
- How well-supported is this interpretation right now?

PX-E1 is groundwork, not the full `P9` explanation family.
It adds one calm, service-owned explanation contract that later surfaces can reuse.

## Contract
The canonical contract is `ExplanationAvailability`.

```ts
{
  status: 'UNAVAILABLE',
  reason: 'NO_EXPLANATION_TARGET' | 'INSUFFICIENT_INTERPRETED_CONTEXT' | 'NOT_ENABLED_FOR_SURFACE'
}
```

or

```ts
{
  status: 'AVAILABLE',
  explanation: {
    title: string
    summary: string
    confidence: 'LOW' | 'MODERATE' | 'HIGH'
    confidenceNote: string
    lineage: ExplanationLineageItem[]
    limitations: string[]
  }
}
```

`ExplanationLineageItem` is intentionally small:

```ts
{
  kind: 'MARKET_EVENT' | 'STATE_TRANSITION' | 'CONTEXT'
  label: string
  detail: string
  timestamp: string | null
}
```

Rules:
- lineage is capped at 3 items
- no raw signal arrays
- no event IDs
- no provider IDs or runtime diagnostics
- no strategy IDs in user-facing copy
- `UNAVAILABLE` is preferred over invented explanation

## Input Seams
PX-E1 explanation consumes already-interpreted seams only:
- `MarketEvent`
- `EventLedger` history as filtered through `OrientationContext`
- `Since Last Checked`
- prepared Dashboard prime-item state

It does not consume:
- raw provider output
- raw signal arrays
- runtime diagnostics
- app-side assembled context

The first builder is `createExplanationSummary`.
It sits above `OrientationContext`; it does not move interpretation into `app/`.

## Confidence Rules
Confidence in PX-E1 is about evidence support for the current interpretation.
It is not a prediction and not a proxy for profit expectancy.

Allowed meaning:
- `LOW`: the picture is narrow and lightly supported
- `MODERATE`: more than one prepared input supports the picture
- `HIGH`: current event, current state, and recent interpreted history all support the same picture

Required framing:
- confidence notes must explicitly say they reflect evidence support
- confidence notes must explicitly say they do not guarantee an outcome
- confidence must remain bounded and non-predictive

## Lineage Rules
PX-E1 lineage is calm interpreted lineage, not indicator soup.

Priority order:
1. the current interpreted market event
2. the current interpreted state transition or state read
3. recent interpreted history when it still supports the same picture

Lineage copy should read like a briefing note:
- factual
- concise
- non-urgent
- subordinate to the main Dashboard surface

## First Consumer Surface
The first consumer is Dashboard prime / Focus only.

Why Dashboard first:
- Snapshot remains lighter and more sacred
- Dashboard is the natural home for a subordinate why affordance
- the explanation note is attached to the prepared prime item rather than becoming a full standalone product surface

PX-E1 does not add explanation rendering to Snapshot or Trade Hub.

## Relationship To Later Work
PX-E1 is a Focus/Deep bridge.
It proves one canonical contract, one builder, and one service-owned fetch seam.

It does not yet build:
- a full Insights layer
- Pattern Navigator or Strategy Navigator
- a history archive
- journaling or exports
- AI-generated explanations
- multiple competing explanation surfaces

Later phases can extend this seam, but they should reuse the same doctrine:
- services own explanation shaping
- app renders prepared explanation contracts only
- explanation remains interpreted, honest, and calm
