# PocketPilot Knowledge Library

Controlled live knowledge tree for in-product learning content.

## Live families
- `orientation`
- `strategies`
- `glossary`
- `interpretation`
- `market-examples`
- `action-risk`
- `evidence`

## Supporting families kept in repo
- `40-reflection`
- `50-knowledge-system`
- `90-media`
- `_register`
- `_templates`

## Catalog/register note
- `docs/knowledge/_register/CONTENT_REGISTER.csv` and `CONTENT_REGISTER.md` now track the live family-based tree directly.
- `scripts/generate-knowledge-catalog.js` consumes the same family-based register and applies a narrow docs-to-runtime family mapping when generation is explicitly run.

## Import note
`PX-KI1` imported the v1.4 knowledge payload into the live families above and retired overlapping legacy numbered shelves to avoid parallel live trees for the same concepts.
