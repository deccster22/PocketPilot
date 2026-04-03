# Explanation Model (PX-E2)

## Purpose
`services/explanation` is PocketPilot's canonical explanation seam.

It answers three product questions without pretending certainty:
- Why am I seeing this?
- What interpreted lineage led here?
- How well-supported is this interpretation right now?

PX-E2 deepens the PX-E1 seam. It does not replace it and it does not claim that the richer `P9` explanation family is complete.

## Contract
The canonical contract remains `ExplanationAvailability`.

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
    contextNote?: string
    confidence: 'LOW' | 'MODERATE' | 'HIGH'
    confidenceNote: string
    lineage: ExplanationLineageItem[]
    limitations: string[]
  }
}
```

`contextNote` is the only PX-E2 contract refinement. It is optional and exists so Dashboard can reuse the same prepared explanation in one slightly deeper path without inventing new prose in `app/`.

`ExplanationLineageItem` remains intentionally small:

```ts
{
  kind: 'MARKET_EVENT' | 'STATE_TRANSITION' | 'CONTEXT'
  label: string
  detail: string
  timestamp: string | null
}
```

Rules:
- one canonical explanation contract
- lineage remains capped at 3 items
- no raw signal arrays
- no event IDs
- no strategy IDs in user-facing copy
- no provider IDs, runtime metadata, or diagnostics in product explanation
- `UNAVAILABLE` remains better than invented explanation

## Input Seams
PX-E2 explanation still consumes interpreted seams only:
- `MarketEvent`
- `EventLedger` history as already filtered through `OrientationContext`
- `Since Last Checked`
- prepared Dashboard prime-item state

It does not consume:
- raw provider output
- raw signal arrays
- runtime diagnostics
- app-side assembled context

The builder remains `createExplanationSummary`.
The Dashboard fetch seam remains `fetchDashboardExplanationVM`.

## Lineage Selection Rules
PX-E2 improves lineage quality without broadening scope.

Selection rules:
1. Prefer the current interpreted market event when it exists.
2. Keep at least one state or context item when that adds explanatory value.
3. Prefer one distinct supporting interpreted event over repetitive duplicates.
4. If support is repetitive or generic, collapse it into one calm history-context item.
5. Fewer lineage items are better than padded filler.

Priority shape:
1. current interpreted event
2. current interpreted state or context read
3. one additional distinct interpreted support item, or one aggregated recent-history item

This keeps lineage explanatory rather than numerous.

## Confidence Rules
Confidence remains evidence support for the current interpreted picture.
It is not a prediction, not a trade probability, and not a prompt to act.

Allowed meaning:
- `LOW`: the picture is narrow or lightly supported
- `MODERATE`: more than one prepared input supports the picture
- `HIGH`: current event, current state, and recent interpreted history support the same reading without estimated context weakening that support

Required framing:
- confidence notes must explicitly say they reflect evidence support
- confidence notes must explicitly say they do not guarantee an outcome
- estimated supporting context should prevent inflated confidence

## Dashboard Reuse Path
Dashboard remains the only explanation consumer surface in PX-E2.

PX-E2 allows two Dashboard presentation depths on the same prepared explanation:
- a compact why card
- an optional deeper Dashboard-only context view inside that same card

Rules:
- one explanation truth only
- no second builder in `app/`
- no second explanation fetch seam
- no Snapshot explanation path
- no Trade Hub explanation path

`app/` may reveal or hide prepared sections, but it may not assemble explanation content from raw data.

## Relationship To Later Work
PX-E2 is still explanation groundwork.

It does not yet build:
- a full Insights product
- Pattern Navigator or Strategy Navigator
- a history archive
- journaling or exports
- AI-generated explanations
- multiple competing explanation surfaces

Later phases should extend this seam rather than replace it:
- services continue to own explanation shaping
- app continues to render prepared contracts only
- explanation stays interpreted, honest, calm, and subordinate
