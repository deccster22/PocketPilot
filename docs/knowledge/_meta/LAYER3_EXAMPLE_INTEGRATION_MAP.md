---
title: "Layer 3 Example Integration Map"
status: "active"
owner: "founder"
doc_class: "knowledge-meta"
purpose: "Tracks Layer 3 market-example and evidence standardization coverage, status, and deliberate gaps after P7-K17"
depends_on:
  - "P7-K13"
  - "P7-K16"
related_docs:
  - "/docs/knowledge/_register/CONTENT_REGISTER.csv"
  - "/docs/knowledge/market-examples/"
  - "/docs/knowledge/evidence/"
  - "/docs/phases/P7-K17.md"
canonical_path: "/docs/knowledge/_meta/LAYER3_EXAMPLE_INTEGRATION_MAP.md"
---

# Layer 3 Example Integration Map

This map records the P7-K17 standardization pass across existing Layer 3-ish canonical example topics.

## Audit-aligned status snapshot

- Total Layer 3-ish topics in scope: 18
- Market-example topics: 6
- Evidence topics: 12
- KEEP: 14
- UPGRADE: 4
- HOLD BACK: 0
- Main issue addressed: format and framing consistency, not missing broad content

## Live canonical topics standardized in P7-K17

Status key:
- `KEEP`: structure standardized, core narrative preserved
- `UPGRADE`: structure standardized plus sharpened behavior framing

| Canonical topic path | Family | Status | Related strategies | Related concepts | Runtime topic route exists |
| --- | --- | --- | --- | --- | --- |
| `docs/knowledge/market-examples/bitcoin-above-the-old-high.md` | market-examples | KEEP | `trend-follow`, `breakout-watcher`, `buy-the-dip`, `momentum-pulse` | `trend`, `breakout`, `momentum`, `support`, `resistance` | `no` |
| `docs/knowledge/market-examples/bitcoin-june-to-august-2022-relief-rally-inside-a-broken-structure.md` | market-examples | KEEP | `reversion-bounce`, `buy-the-dip`, `momentum-pulse`, `range-trader` | `reversion`, `momentum`, `trend`, `support`, `resistance`, `volatility` | `no` |
| `docs/knowledge/market-examples/bitcoin-19k-20k-bottoming-cluster-and-the-post-ftx-reclaim.md` | market-examples | KEEP | `confluence-alignment`, `trend-follow`, `breakout-watcher` | `confluence`, `trend`, `support`, `resistance`, `volatility` | `no` |
| `docs/knowledge/market-examples/bitcoin-august-2020-failed-escape-above-12000.md` | market-examples | KEEP | `breakout-watcher`, `range-trader`, `confluence-alignment` | `breakout`, `momentum`, `trend`, `support`, `resistance` | `no` |
| `docs/knowledge/market-examples/from-liquidity-tailwind-to-deleveraging-grind.md` | market-examples | KEEP | `trend-follow`, `breakout-watcher`, `buy-the-dip`, `confluence-alignment` | `trend`, `momentum`, `volatility`, `confluence`, `support`, `resistance` | `no` |
| `docs/knowledge/market-examples/terra-from-peg-wobble-to-exit-spiral.md` | market-examples | KEEP | `confluence-alignment`, `trend-follow`, `reversion-bounce` | `volatility`, `confluence`, `trend`, `support`, `resistance` | `no` |
| `docs/knowledge/evidence/trend-follow-bitcoin-above-the-old-high-worked.md` | evidence | KEEP | `trend-follow` | `trend`, `breakout`, `momentum`, `support` | `no` |
| `docs/knowledge/evidence/trend-follow-from-liquidity-tailwind-to-deleveraging-grind-caution.md` | evidence | KEEP | `trend-follow` | `trend`, `momentum`, `volatility`, `confluence` | `no` |
| `docs/knowledge/evidence/breakout-watcher-bitcoin-above-the-old-high-worked.md` | evidence | KEEP | `breakout-watcher` | `breakout`, `trend`, `support`, `resistance` | `no` |
| `docs/knowledge/evidence/breakout-watcher-bitcoin-august-2020-failed-escape-caution.md` | evidence | KEEP | `breakout-watcher` | `breakout`, `momentum`, `support`, `resistance` | `no` |
| `docs/knowledge/evidence/buy-the-dip-bitcoin-above-the-old-high-worked.md` | evidence | KEEP | `buy-the-dip` | `reversion`, `trend`, `support`, `momentum` | `no` |
| `docs/knowledge/evidence/buy-the-dip-bitcoin-june-to-august-2022-caution.md` | evidence | KEEP | `buy-the-dip` | `reversion`, `trend`, `support`, `volatility` | `no` |
| `docs/knowledge/evidence/momentum-pulse-bitcoin-above-the-old-high-worked.md` | evidence | KEEP | `momentum-pulse` | `momentum`, `trend`, `breakout`, `volatility` | `no` |
| `docs/knowledge/evidence/confluence-alignment-bitcoin-19k-20k-post-ftx-reclaim-worked.md` | evidence | KEEP | `confluence-alignment` | `confluence`, `trend`, `support`, `resistance`, `volatility` | `no` |
| `docs/knowledge/evidence/momentum-pulse-bitcoin-june-to-august-2022-caution.md` | evidence | UPGRADE | `momentum-pulse` | `momentum`, `trend`, `volatility`, `reversion` | `no` |
| `docs/knowledge/evidence/range-trader-bitcoin-august-2020-failed-escape-caution.md` | evidence | UPGRADE | `range-trader`, `breakout-watcher` | `support`, `resistance`, `breakout`, `volatility` | `no` |
| `docs/knowledge/evidence/reversion-bounce-bitcoin-june-to-august-2022-caution.md` | evidence | UPGRADE | `reversion-bounce`, `buy-the-dip` | `reversion`, `momentum`, `trend`, `support`, `volatility` | `no` |
| `docs/knowledge/evidence/confluence-alignment-terra-exit-spiral-caution.md` | evidence | UPGRADE | `confluence-alignment`, `trend-follow` | `confluence`, `volatility`, `trend`, `support`, `resistance` | `no` |

## Naming and framing normalization

- Visible "Worked Example" wording was removed from standardized headings/titles.
- File slugs and topic IDs that contain `worked` were intentionally kept unchanged for compatibility.
- Framing was shifted to behavior-first labels such as continuation, acceptance, caution, failed-hold, and danger-confluence.

## Missing coverage gaps (not created in this phase)

- Range Trader still needs a clean played-out example topic (future).
- Reversion Bounce still needs a clean played-out example topic (future).
- Candle Signals does not yet have a proper Layer 3 evidence topic.
- Fibonacci Zones does not yet have a proper Layer 3 evidence topic.

## Future topics not yet created and not surfaced

These slugs were mapped in prior wiring work, but they still have no canonical live topic doc and should not be surfaced as runtime links yet:

- `range-oscillation`
- `range-break`
- `fibonacci-reaction`
- `fibonacci-failure`
- `candle-signal-valid`
- `candle-signal-noise`

## Link-surfacing guardrail

- Do not add runtime routes for non-existent future topics.
- Do not add Trade Hub example links in this pass.
- Keep example integration descriptive and optional until missing coverage topics are authored and accepted.
