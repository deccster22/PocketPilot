# PX-KI5 - Strategy and Concept Progressive Learning Layer Merge (v0.8 FULL)

## Why This Phase Happened Now

`PX-KI4` established the Trade Hub progressive knowledge import lane and validated active family/register guardrails for controlled docs merges.

With that lane stable, the next step was to merge the v0.8 strategy/concepts beginner front door into canonical strategy knowledge without replacing deeper existing strategy nuance.

PX-KI5 happens now to align strategy and concept learning posture before any future runtime concept-link or inline-help wiring phases.

## What v0.8 Added

- beginner-facing strategy layer inputs for:
  - `buy-the-dip`
  - `range-trader`
  - `reversion-bounce`
  - `trend-follow`
  - `breakout-watcher`
  - `momentum-pulse`
  - `candle-signals`
  - `fibonacci-zones`
  - `confluence-alignment`
- concept starter docs for:
  - `trend`
  - `support`
  - `resistance`
  - `breakout`
  - `momentum`
  - `reversion`
  - `volatility`
  - `confluence`
  - `candlestick-patterns`
  - `fibonacci-levels`
- glossary starter inputs for those concept terms
- concept-to-strategy mapping support metadata in `docs/knowledge/_meta/CONCEPT_TO_STRATEGY_MAP.md`

## How Beginner Layers Were Merged

- Existing canonical strategy files under `docs/knowledge/strategies/` were preserved as the single live home.
- A beginner-facing top layer was added at the top of each strategy with:
  - `What this means`
  - `When it shows up`
  - `What you're looking for`
  - `Why it can work`
  - `What can go wrong`
  - `Common misunderstanding`
- Existing richer strategy content remains below an explicit `## Deeper explanation` boundary.
- No separate beginner strategy file tree was created.

## How Existing Deeper Content Was Preserved

- `buy-the-dip`, `range-trader`, `reversion-bounce`, `trend-follow`, `breakout-watcher`, and `confluence-alignment` retained their existing structured strategy guidance sections beneath the new beginner layer.
- `candle-signals`, `fibonacci-zones`, and `momentum-pulse` retained their prior normalized `Quick version` and `Full version` depth blocks beneath the new beginner layer.
- No existing deeper section was deleted wholesale.

## Collision And Reconciliation Decisions

- Strategy doc collisions:
  - all 9 expected strategy docs already existed and were merged in place (no wholesale replacement).
- Concept doc collisions:
  - no `docs/knowledge/concepts/` family existed, so canonical concept docs were added once as a new active family.
- Glossary collisions:
  - existing richer glossary docs for `support`, `resistance`, `breakout`, `volatility`, and `confluence` were preserved unchanged.
  - missing glossary docs (`trend`, `momentum`, `reversion`, `candlestick-patterns`, `fibonacci-levels`) were added as lightweight entries.
- Topic ID convention:
  - repo convention remains hyphen-delimited (`strategy-*`, `concept-*`, `glossary-*`) rather than dotted IDs.

## What PX-KI5 Deliberately Did Not Add

PX-KI5 does not add:

- app/runtime behavior changes
- strategy-engine logic changes
- Strategy Navigator runtime copy or layout changes
- UI help/glossary tap wiring
- knowledge-link runtime wiring
- `docs/source` changes
- CANON changes

## Follow-Up Enabled By This Phase

- concept-to-strategy UI linkage
- strategy doc evidence/example layer deepening
- inline glossary/help connection where useful

## Recommendation Review

### Adopt Now

- keep progressive layering as the canonical strategy/concept merge pattern
- keep one live strategy doc per strategy with beginner layer on top and richer depth below
- keep `concepts` as an active validated knowledge family

### Add To Backlog

- deeper concept examples and evidence-backed strategy case links
- phase-scoped runtime linkage from concept/strategy maps to visible knowledge affordances
- additional conservative glossary alias work only when service-owned runtime matching needs it

### Decline For Now

- duplicate beginner-only strategy/concept trees
- flattening strategy nuance into short-only summaries
- runtime dependence on docs-side maps in this docs-only phase
