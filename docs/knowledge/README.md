# PocketPilot Knowledge Library

Controlled live knowledge tree for in-product learning content.

## Live families
- `orientation`
- `strategies`
- `concepts`
- `glossary`
- `trade-hub`
- `interpretation`
- `market-examples`
- `action-risk`
- `evidence`

## Supporting families kept in repo
- `40-reflection`
- `50-knowledge-system`
- `90-media`
- `_meta`
- `_register`
- `_templates`

## Catalog/register note
- `docs/knowledge/_register/CONTENT_REGISTER.csv` and `CONTENT_REGISTER.md` now track the live family-based tree directly.
- `scripts/generate-knowledge-catalog.js` consumes the same family-based register and applies a narrow docs-to-runtime family mapping when generation is explicitly run.
- Runtime `services/knowledge/knowledgeCatalog.ts` is currently maintained as a curated/hybrid runtime artifact (not auto-regenerated on every register change).
- `scripts/validate-knowledge-register.js` validates register hygiene before downstream docs/runtime work depends on stale metadata.

## Validation note
- Run `npm run validate:knowledge` to check register path existence, topic ID uniqueness, retired shelf rejection, family/path alignment, and required core family coverage.
- Run `npm run validate:knowledge:runtime` to verify the explicit runtime-required register topic scope resolves in `services/knowledge/knowledgeCatalog.ts`, detect missing runtime topic IDs, detect duplicate runtime topic IDs, and keep legacy unregistered runtime IDs explicit.
- `npm run verify` now includes both `npm run validate:knowledge` and `npm run validate:knowledge:runtime` so register/runtime drift is caught in the normal quality gate.
- Validation is read-only and deterministic; it does not rewrite register or catalog artifacts.

## Import note
`PX-KI1` imported the v1.4 knowledge payload into the live families above and retired overlapping legacy numbered shelves to avoid parallel live trees for the same concepts.

`PX-KI4` imports Trade Hub risk-planning teaching topics, matching lightweight glossary terms, and supporting term-map material into the same active family-based tree without adding runtime wiring.

`PX-KI5` merges v0.8 beginner-facing strategy and concept layers into canonical strategy/concept docs, preserves deeper strategy detail under progressive sections, and adds `concepts` as an active validated family.

`P7-K11` adds the first bounded Trade Hub term-to-knowledge integration plan in `docs/knowledge/_meta/TRADE_HUB_HELP_INTEGRATION_PLAN.md`, including first-rollout scope and no-link-soup rules for later service-owned wiring.

`P7-K12` implements that first bounded runtime rollout through one service-owned Trade Hub help-affordance seam, wiring only stop-loss price, target price, active risk-basis label, and guardrails while keeping app-side behavior render-only.

`P7-K13` adds a runtime catalog sync guard that protects the first rollout and other explicitly runtime-required register topics from drifting out of the runtime knowledge catalog.

`P7-K14` completes the Trade Hub Layer 2 docs merge for all 14 canonical trade-hub topics by preserving Layer 1 beginner content first and appending calm deeper-thinking sections; runtime `knowledgeCatalog.ts` Trade Hub topic detail content is updated for those same 14 topic IDs without adding new help terms or changing app UI wiring.

`P7-K15` completes the Strategy Layer 2 merge for all 9 canonical launch strategies by preserving Layer 1 beginner content first and appending a bounded `Layer 2: Deeper behaviour` section set; runtime `knowledgeCatalog.ts` strategy topic detail content is updated for the same 9 strategy topic IDs without changing Strategy Navigator/Preview runtime behavior or help placement.
