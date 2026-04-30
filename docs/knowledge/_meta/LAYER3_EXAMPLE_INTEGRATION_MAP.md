---
title: "Layer 3 Example Integration Map"
status: "active"
owner: "founder"
doc_class: "knowledge-meta"
purpose: "Tracks P7-K16 example wiring status between strategy/concept/trade-hub docs and existing or future example topics"
depends_on:
  - "P7-K13"
  - "P7-K14"
  - "P7-K15"
related_docs:
  - "/docs/knowledge/_register/CONTENT_REGISTER.csv"
  - "/docs/knowledge/market-examples/"
  - "/docs/knowledge/evidence/"
canonical_path: "/docs/knowledge/_meta/LAYER3_EXAMPLE_INTEGRATION_MAP.md"
---

# Layer 3 Example Integration Map

This map records how payload example slugs were integrated during `P7-K16` without creating a second examples tree or dead runtime routes.

Status values:
- `mapped-existing-topic`: wired to an existing canonical market-example or evidence doc
- `mapped-future-topic`: mapped with cross-references, but no canonical live topic yet
- `not-yet-created`: no canonical topic currently available

| Example slug | Related strategies | Related concepts | Related Trade Hub topics | Status | Canonical topic path today | Runtime topic route exists |
| --- | --- | --- | --- | --- | --- | --- |
| `bitcoin-old-high` | `trend-follow` | `trend`, `breakout`, `momentum` | `none` | `mapped-existing-topic` | `docs/knowledge/market-examples/bitcoin-above-the-old-high.md` | `no` |
| `failed-breakout` | `breakout-watcher` | `breakout`, `momentum` | `none` | `mapped-existing-topic` | `docs/knowledge/market-examples/bitcoin-august-2020-failed-escape-above-12000.md` | `no` |
| `range-oscillation` | `range-trader` | `support`, `resistance` | `none` | `mapped-future-topic` | `none` | `no` |
| `range-break` | `range-trader`, `breakout-watcher` | `breakout`, `trend` | `none` | `mapped-future-topic` | `none` | `no` |
| `dip-recovery` | `buy-the-dip` | `reversion`, `support` | `entry-price`, `target-price` | `mapped-existing-topic` | `docs/knowledge/evidence/buy-the-dip-bitcoin-above-the-old-high-worked.md` | `no` |
| `dip-failure` | `buy-the-dip` | `trend`, `momentum` | `stop-loss-price`, `reward-risk` | `mapped-existing-topic` | `docs/knowledge/evidence/buy-the-dip-bitcoin-june-to-august-2022-caution.md` | `no` |
| `momentum-continuation` | `momentum-pulse` | `momentum`, `trend` | `entry-price`, `target-price` | `mapped-existing-topic` | `docs/knowledge/evidence/momentum-pulse-bitcoin-above-the-old-high-worked.md` | `no` |
| `momentum-exhaustion` | `momentum-pulse` | `momentum` | `stop-loss-price`, `reward-risk` | `mapped-existing-topic` | `docs/knowledge/evidence/momentum-pulse-bitcoin-june-to-august-2022-caution.md` | `no` |
| `fibonacci-reaction` | `fibonacci-zones` | `fibonacci-levels`, `confluence` | `entry-price`, `target-price` | `mapped-future-topic` | `none` | `no` |
| `fibonacci-failure` | `fibonacci-zones` | `fibonacci-levels` | `stop-loss-price`, `reward-risk` | `mapped-future-topic` | `none` | `no` |
| `candle-signal-valid` | `candle-signals` | `candlestick-patterns` | `entry-price`, `target-price` | `mapped-future-topic` | `none` | `no` |
| `candle-signal-noise` | `candle-signals` | `candlestick-patterns` | `stop-loss-price`, `reward-risk` | `mapped-future-topic` | `none` | `no` |
| `confluence-strong` | `confluence-alignment` | `confluence` | `entry-price`, `target-price` | `mapped-existing-topic` | `docs/knowledge/evidence/confluence-alignment-bitcoin-19k-20k-post-ftx-reclaim-worked.md` | `no` |
| `confluence-weak` | `confluence-alignment` | `confluence` | `stop-loss-price`, `reward-risk` | `mapped-existing-topic` | `docs/knowledge/evidence/confluence-alignment-terra-exit-spiral-caution.md` | `no` |

## Notes

- The payload `docs/knowledge/examples/*.md` slugs are treated as wiring stubs in this phase, not new canonical narrative imports.
- No `docs/knowledge/examples/` live tree was created.
- No runtime catalog entries were added for non-existent example slugs.
