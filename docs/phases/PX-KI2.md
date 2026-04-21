# PX-KI2 - Knowledge Catalog / Taxonomy Reconciliation

## Why This Phase Happened Now

`PX-KI1` completed the controlled v1.4 knowledge import and retired overlapping numbered shelves.

That left one explicit follow-up gap: active register/index/catalog-assumption references still pointed at retired `00-/10-/20-/30-` shelf paths in several docs/admin surfaces.

PX-KI2 happens now to reconcile those docs-side assumptions to the live family-based knowledge layout without widening runtime behavior.

## What PX-KI2 Added

- reconciled `docs/knowledge/_register/CONTENT_REGISTER.csv` to the live family tree under `docs/knowledge/<family>/`
- reconciled `docs/knowledge/_register/CONTENT_REGISTER.md` to match the same live family paths
- updated continuity/index docs that still referenced retired numbered shelf paths
- updated docs-side catalog-generation assumptions in `scripts/generate-knowledge-catalog.js` so docs-family taxonomy is the input baseline
- preserved current runtime grouping contracts by keeping docs-to-runtime family mapping in the generation helper (no runtime code changes)

## What PX-KI2 Deliberately Did Not Add

PX-KI2 does not add:

- runtime/app feature behavior
- glossary clickables
- inline-help wiring
- app navigation changes
- new external pack imports
- `docs/source` edits
- CANON edits

## What Future Work Can Build On

Later phases can build on PX-KI2 by:

- implementing runtime glossary/link wiring as a separate product/runtime rung
- revisiting runtime taxonomy contracts if and when the product needs one-to-one family exposure in service/view-model output
- expanding support-family curation policies for research/admin layers in dedicated governance/import phases

PX-KI2 is a docs/admin reconciliation pass only.
