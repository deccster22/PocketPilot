---
title: "Layer 3 Example Integration Map"
status: "active"
owner: "founder"
doc_class: "knowledge-meta"
purpose: "Tracks Layer 3 example/evidence standardization plus first-wave runtime follow-through routing state"
depends_on:
  - "P7-K13"
  - "P7-K17"
  - "P7-K18"
  - "P7-K19"
related_docs:
  - "/docs/knowledge/_register/CONTENT_REGISTER.csv"
  - "/docs/knowledge/market-examples/"
  - "/docs/knowledge/evidence/"
  - "/docs/phases/P7-K17.md"
  - "/docs/phases/P7-K19.md"
canonical_path: "/docs/knowledge/_meta/LAYER3_EXAMPLE_INTEGRATION_MAP.md"
---

# Layer 3 Example Integration Map

This map tracks the Layer 3 example/evidence corpus after standardization (`P7-K17`) and first-wave runtime follow-through surfacing (`P7-K19`).

## Current scope snapshot

- Total Layer 3-ish topics in scope: 18
- Market-example topics: 6
- Evidence topics: 12
- KEEP: 14
- UPGRADE: 4
- HOLD BACK: 0

## Runtime surfacing model

- First wave uses hidden runtime-resolvable follow-through topics.
- No visible Examples shelf is enabled.
- Evidence topics only in first wave.
- Market-example topics remain docs-side in this phase.
- Trade Hub example links remain off in this phase.

## Canonical topic routing status

Status key:
- `docs-only`: canonical topic exists but is not runtime-routable in this wave
- `runtime-first-wave-hidden`: runtime-routable follow-through topic, hidden from top-level library shelves

| Canonical topic path | Family | KEEP/UPGRADE | First-wave runtime status | Notes |
| --- | --- | --- | --- | --- |
| `docs/knowledge/market-examples/bitcoin-above-the-old-high.md` | market-examples | KEEP | `docs-only` | held as docs-side narrative for now |
| `docs/knowledge/market-examples/bitcoin-june-to-august-2022-relief-rally-inside-a-broken-structure.md` | market-examples | KEEP | `docs-only` | held as docs-side narrative for now |
| `docs/knowledge/market-examples/bitcoin-19k-20k-bottoming-cluster-and-the-post-ftx-reclaim.md` | market-examples | KEEP | `docs-only` | held as docs-side narrative for now |
| `docs/knowledge/market-examples/bitcoin-august-2020-failed-escape-above-12000.md` | market-examples | KEEP | `docs-only` | held as docs-side narrative for now |
| `docs/knowledge/market-examples/from-liquidity-tailwind-to-deleveraging-grind.md` | market-examples | KEEP | `docs-only` | held as docs-side narrative for now |
| `docs/knowledge/market-examples/terra-from-peg-wobble-to-exit-spiral.md` | market-examples | KEEP | `docs-only` | held as docs-side narrative for now |
| `docs/knowledge/evidence/trend-follow-bitcoin-above-the-old-high-worked.md` | evidence | KEEP | `runtime-first-wave-hidden` | first-wave strategy follow-through |
| `docs/knowledge/evidence/trend-follow-from-liquidity-tailwind-to-deleveraging-grind-caution.md` | evidence | KEEP | `runtime-first-wave-hidden` | first-wave strategy follow-through |
| `docs/knowledge/evidence/breakout-watcher-bitcoin-above-the-old-high-worked.md` | evidence | KEEP | `runtime-first-wave-hidden` | first-wave strategy follow-through |
| `docs/knowledge/evidence/breakout-watcher-bitcoin-august-2020-failed-escape-caution.md` | evidence | KEEP | `runtime-first-wave-hidden` | first-wave strategy follow-through |
| `docs/knowledge/evidence/buy-the-dip-bitcoin-above-the-old-high-worked.md` | evidence | KEEP | `runtime-first-wave-hidden` | first-wave strategy follow-through |
| `docs/knowledge/evidence/buy-the-dip-bitcoin-june-to-august-2022-caution.md` | evidence | KEEP | `runtime-first-wave-hidden` | first-wave strategy follow-through |
| `docs/knowledge/evidence/momentum-pulse-bitcoin-above-the-old-high-worked.md` | evidence | KEEP | `docs-only` | second wave candidate |
| `docs/knowledge/evidence/confluence-alignment-bitcoin-19k-20k-post-ftx-reclaim-worked.md` | evidence | KEEP | `docs-only` | second wave candidate |
| `docs/knowledge/evidence/momentum-pulse-bitcoin-june-to-august-2022-caution.md` | evidence | UPGRADE | `docs-only` | second wave candidate |
| `docs/knowledge/evidence/range-trader-bitcoin-august-2020-failed-escape-caution.md` | evidence | UPGRADE | `docs-only` | held pending cleaner played-out counterpart |
| `docs/knowledge/evidence/reversion-bounce-bitcoin-june-to-august-2022-caution.md` | evidence | UPGRADE | `docs-only` | held pending cleaner played-out counterpart |
| `docs/knowledge/evidence/confluence-alignment-terra-exit-spiral-caution.md` | evidence | UPGRADE | `docs-only` | second wave candidate |

## First-wave source-link scope in runtime

Runtime follow-through links were added from these source strategy topics only:

- `strategy-trend-follow` -> 2 first-wave trend-follow evidence topics
- `strategy-breakout-watcher` -> 2 first-wave breakout-watcher evidence topics
- `strategy-buy-the-dip` -> 2 first-wave buy-the-dip evidence topics

Concept-source linking was intentionally deferred in `P7-K19` because concept topic IDs are not currently runtime-routable, and adding them would widen this wave beyond the accepted first-wave scope.

## Missing coverage gaps (still visible)

- Range Trader still needs a clean played-out example topic (future).
- Reversion Bounce still needs a clean played-out example topic (future).
- Candle Signals does not yet have a proper Layer 3 evidence topic.
- Fibonacci Zones does not yet have a proper Layer 3 evidence topic.

## Future slugs not yet created and not routable

These slugs remain non-live and non-routable:

- `range-oscillation`
- `range-break`
- `fibonacci-reaction`
- `fibonacci-failure`
- `candle-signal-valid`
- `candle-signal-noise`

## Guardrails carried forward

- Do not surface non-live future slugs as runtime routes.
- Do not enable Trade Hub example links in this phase.
- Do not create a visible Examples shelf in this phase.
- Do not surface all 18 topics at once; keep first-wave scope bounded.
