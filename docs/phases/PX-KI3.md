# PX-KI3 - Knowledge Register Validation / Catalog Hygiene

## Why This Phase Happened Now

`PX-KI1` refreshed the live knowledge payload and `PX-KI2` reconciled taxonomy/register paths to the family-based tree.

That made one remaining risk explicit: `CONTENT_REGISTER.csv` and catalog-generation assumptions still needed a deterministic validation guardrail so future knowledge/runtime work does not build on stale paths, duplicate topic IDs, or retired shelf references.

PX-KI3 happens now to lock register/catalog metadata hygiene before wider follow-on knowledge work.

## What PX-KI3 Added

- added `scripts/validate-knowledge-register.js` as a deterministic local validator for:
  - register file presence and required columns
  - canonical path existence on disk
  - unique `topicId` enforcement
  - retired numbered-shelf path rejection (`00-`, `10-`, `20-`, `30-`)
  - family/path prefix alignment to the active family-based layout
  - required core family representation
- added one shared tooling config in `scripts/knowledge-catalog-config.js` so register validation and `scripts/generate-knowledge-catalog.js` consume the same family ordering and allowlist assumptions
- added script-level tests covering valid and failing register scenarios
- added `npm run validate:knowledge` and wired it into `npm run verify` for deterministic pre-merge hygiene checks

## What PX-KI3 Deliberately Did Not Add

PX-KI3 does not add:

- runtime/app behavior changes
- glossary clickable/UI behavior changes
- taxonomy rewrites or broad knowledge-content rewrites
- external validation services
- `docs/source` changes
- CANON changes
- generated artifact rewrites by default

## What Future Work Can Build On

Later phases can build on PX-KI3 by:

- adding deeper register linting rules only when they stay deterministic and phase-scoped
- extending catalog generation checks with additional metadata constraints if runtime contracts require them
- widening runtime knowledge behavior in separate product/runtime phases with cleaner metadata confidence

PX-KI3 is docs/tooling hygiene only and preserves non-dispatching PocketPilot behavior.

## Recommendation Review

### Adopt Now

- keep `validate:knowledge` in the standard verify gate
- keep one shared family config for generator and validator to prevent silent taxonomy drift
- keep register checks local, deterministic, and read-only

### Add To Backlog

- optional future checks for duplicate canonical paths and stricter status/review metadata rules
- optional enforcement that generated catalog output is up to date only if repo policy later formalizes commit expectations for generated artifacts

### Decline For Now

- external docs-validation services
- runtime-coupled behavior changes from register-validation outcomes
- full knowledge taxonomy redesign in this hygiene phase
