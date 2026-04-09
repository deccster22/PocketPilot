---
title: "REPO_LANDING_MAP"
status: "draft"
owner: "founder"
doc_class: "meta"
purpose: "Canonical PocketPilot documentation artifact"
depends_on: []
related_docs: []
canonical_path: "/docs/meta/REPO_LANDING_MAP.md"
---

# REPO_LANDING_MAP.md

## Purpose
Provides a one-page landing map showing where each major document family should live in the repo.

## Canonical landing map
### Founding truth
`/docs/founder/` and `/docs/governance/`

Keep here:
- doctrine
- compass
- founder orientation docs
- CANON
- Guardrails
- engineering / security / verification governance

### Knowledge
`/docs/knowledge/`

Keep here:
- canonical knowledge corpus
- shelf READMEs
- content registers
- knowledge templates

### Product behavior
`/docs/product/`

Keep here:
- product philosophy docs
- explanation posture
- relevance rules at the product layer
- reflection / narrative product models

### Behaviour rules
`/docs/behaviours/`

Keep here:
- confidence language
- signal exposure rules
- notification-system behavior

### UX / implementation bridge
`/docs/ux/`

Keep here:
- surface-specific exposure rules
- event / notification matrices
- view-model rules
- Trade Hub guardrails
- Strategy Status surface rules

### Architecture and object contracts
`/docs/architecture/`

Keep here:
- architecture companions
- routers / assemblers / runtime models
- canonical object-contract docs

Current normalization note:
- the final canonical pack proposed a separate `/docs/models/`
- this repo keeps model-contract docs in `/docs/architecture/` to preserve the existing taxonomy

### Phases and implementation scope
`/docs/phases/`

Keep here:
- `PHASE_MAP.md`
- phase docs
- scoped subphase docs
- cross-cutting `PX-*` docs

### Meta / traceability
`/docs/meta/`

Keep here:
- master index
- repo landing guidance
- source-of-truth rules
- traceability maps
- dependency maps

### Provenance / source artifacts
`/docs/source/`

Keep here:
- PDFs
- source zips
- provenance artifacts
- historical handoff material where source retention matters

Do not treat this as a second live markdown tree.

### Staging
`/docs/incoming/`

Keep here:
- fresh imports awaiting triage

## Consolidation note
If future packs suggest `docs/foundations/` or other new top-level families, do not adopt them blindly.
Only add a new top-level live folder when it improves clarity without creating a second competing canon.
