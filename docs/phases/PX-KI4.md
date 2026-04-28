# PX-KI4 - Trade Hub Risk-Planning Knowledge Import (v0.8.1)

## Why This Phase Happened Now

`P5-R16` completed Trade Hub plain-language normalization for user-facing planning terms.

`PX-KI1` through `PX-KI3` already established the active knowledge family tree and deterministic register validation guardrails.

PX-KI4 happens now so Trade Hub risk-planning teaching content can land in the active canonical tree with aligned terminology before any wider runtime inline-help expansion.

## What The v0.8.1 Pack Added

- new canonical Trade Hub concept family docs under `docs/knowledge/trade-hub/`:
  - `entry-price`
  - `stop-loss-price`
  - `target-price`
  - `prepared-planning-levels`
  - `risk-amount`
  - `risk-percent`
  - `position-size`
  - `reward-risk`
  - `manual-override`
  - `guardrails`
  - `risk-limit-per-trade`
  - `daily-loss-threshold`
  - `cooldown-after-loss`
  - `confirmation-shell-and-non-dispatch-boundary`
- matching lightweight glossary entries under `docs/knowledge/glossary/` for those same terms
- Trade Hub term-map support metadata at `docs/knowledge/_meta/GLOSSARY_TERM_MAP.md`
- docs-only UI support copy references at:
  - `docs/ui-support/tooltips.md`
  - `docs/ui-support/first_run.md`
  - `docs/ui-support/edge_states.md`
- register updates in `docs/knowledge/_register/CONTENT_REGISTER.csv`
- validator/catalog family config updates in `scripts/knowledge-catalog-config.js` plus test coverage adjustment in `scripts/__tests__/validate-knowledge-register.test.js`

## Layered Learning Model Application

- Trade Hub concept topics were imported as canonical `trade-hub/` articles, not as beginner-duplicate shelves.
- Because no existing canonical Trade Hub concept files were present for these slugs, each imported file is now the canonical article with beginner-first structure and room for deeper sections later.
- Glossary nodes remain lightweight definition targets and are not used as full teaching articles.

## Collision And Reconciliation Decisions

- Trade Hub concept files: no filename collisions found in `docs/knowledge/trade-hub/` (new family path).
- Glossary files: no slug collisions found for the fourteen imported terms, so no destructive overwrite was required.
- Topic ID convention: repository convention uses hyphen-delimited IDs, so KI4 uses:
  - `trade-hub-...` for Trade Hub nodes
  - `glossary-...` for glossary nodes
  instead of dotted `trade-hub.*` suggestions.
- Term-map location: no existing `GLOSSARY_TERM_MAP.md` equivalent existed, so the map was added once under `docs/knowledge/_meta/` to avoid competing maps.

## What PX-KI4 Deliberately Did Not Add

PX-KI4 does not add:

- runtime/app behavior changes
- inline glossary/help wiring
- tooltip/first-run/edge-state runtime integration
- Trade Hub layout or runtime copy wiring changes
- `docs/source` changes
- CANON changes
- dispatch or order-execution behavior

## Follow-Up Enabled By This Phase

- Trade Hub term-to-Knowledge integration wiring in runtime surfaces
- inline glossary/help wiring for Trade Hub terms
- guardrail preference help integration on future Trade Hub help passes

## Recommendation Review

### Adopt Now

- keep `trade-hub` as an active validated knowledge family in register/config tooling
- keep glossary entries lightweight and canonical-term aligned with Trade Hub planning language
- keep UI-support copy docs as docs-only sources until an explicit runtime-wiring phase

### Add To Backlog

- deeper second-layer sections for Trade Hub concept articles once product scope calls for advanced teaching depth
- expanded Trade Hub term aliases only when service-owned runtime matching requires them
- phase-scoped runtime wiring tasks for Trade Hub inline glossary and help affordances

### Decline For Now

- direct runtime dependency on `docs/ui-support/*` drafts
- duplicate beginner-only Trade Hub article shelves
- broad taxonomy refactors outside this import lane
