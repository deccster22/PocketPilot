# PX-KI1 - Knowledge Payload v1.4 Controlled Import

## Why This Phase Happened Now

PocketPilot already had a live knowledge baseline from earlier `P7-K*` work, but the corrected Repo Truth Candidate v1.4 payload contained a richer and more coherent product-facing knowledge set that needed a controlled import.

PX-KI1 happens now to refresh live knowledge content without widening runtime behavior, changing product surfaces, or introducing governance drift.

## What PX-KI1 Added

- imported v1.4 core live knowledge families into `docs/knowledge/`:
  - `glossary`
  - `orientation`
  - `strategies`
  - `market-examples`
  - `action-risk`
  - `interpretation`
- selectively imported `docs/knowledge/evidence/` as active support content
- retired overlapping legacy numbered shelves for the same concepts to avoid parallel live trees
- added continuity updates across docs index, product knowledge posture, relevance posture, and phase ledger

## What PX-KI1 Deliberately Did Not Add

PX-KI1 does not add:

- runtime/app/service logic changes
- new UI surfaces, navigation, or feature wiring
- `docs/source` updates
- CANON edits
- blind import of research/admin/provenance pack material

Skipped-by-design families in this rung:

- `docs/knowledge/evidence-pilots/`
- `docs/knowledge/research-briefs/`
- `docs/knowledge/dr-briefs/`
- `docs/knowledge/search-briefs/`
- `docs/knowledge/integration-notes/`
- `docs/knowledge/_meta/`

## Governance Notes

- Import source is `PocketPilot_Repo_Truth_Candidate_v1.4.zip`.
- Wrapper handoff/readme/manifests/audits/correction notes are treated as reference context, not default live repo content.
- `docs/source` remains provenance-only and untouched by this phase.

## Recommendation Review

### Adopt Now

- keep the v1.4 core family import as the live product-facing knowledge baseline
- keep selective `evidence/` import for concrete supporting examples
- keep conservative skip policy for research/admin packs until a dedicated curation rung is scheduled

### Add To Backlog

- planned reconciliation of register-driven generation taxonomy with the refreshed docs family layout
- explicit curation criteria for when research/admin packs graduate into live knowledge support

### Decline For Now

- full-tree overwrite imports
- parallel live knowledge trees for the same concepts
- research/admin clutter in the live product-facing knowledge corpus
