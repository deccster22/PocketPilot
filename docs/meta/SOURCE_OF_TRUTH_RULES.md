---
title: "SOURCE_OF_TRUTH_RULES"
status: "draft"
owner: "founder"
doc_class: "meta"
purpose: "Canonical PocketPilot documentation artifact"
depends_on: []
related_docs: []
canonical_path: "/docs/meta/SOURCE_OF_TRUTH_RULES.md"
---

# SOURCE_OF_TRUTH_RULES.md

## Purpose
Defines which PocketPilot docs count as source of truth for which kinds of decisions.

## 1. Why this exists
Once a system has enough docs, the danger stops being "missing docs" and starts being "multiple things pretending to be authoritative."

## 2. Founding rule
PocketPilot should have one source of truth per layer, not one source of truth per mood.

## 3. Source-of-truth hierarchy
### 3.1 Founding truth
Source of truth for:
- philosophy
- product laws
- non-negotiables
- trust posture

Primary homes:
- `docs/founder/`
- `docs/governance/`

Typical anchors:
- `POCKETPILOT_DOCTRINE.md`
- `PRODUCT_COMPASS.md`
- `CANON.md`
- `GUARDRAILS.md`

### 3.2 Product and behaviour truth
Source of truth for:
- how the product should behave
- how signals / confidence / notifications should be framed
- explanation, relevance, and reflection posture

Primary homes:
- `docs/product/`
- `docs/behaviours/`

### 3.3 Surface / UX truth
Source of truth for:
- what a surface includes
- what a surface excludes
- what users can see on that surface

Primary home:
- `docs/ux/`

### 3.4 Architecture and object truth
Source of truth for:
- prepared seams
- assemblers / routers / engines
- consumer boundaries
- canonical object contracts

Primary home:
- `docs/architecture/`

Current taxonomy note:
- object-contract docs live under architecture in this repo
- there is no separate live `docs/models/` tree in the current canonical structure

### 3.5 Knowledge content truth
Source of truth for:
- canonical knowledge-node content
- shelf structure
- content registers

Primary home:
- `docs/knowledge/`

### 3.6 Phase and implementation-status truth
Source of truth for:
- current phase naming
- landed vs partial vs planned status
- implementation-scope reporting

Primary home:
- `docs/phases/`

Anchor doc:
- `PHASE_MAP.md`

### 3.7 Meta / traceability truth
Source of truth for:
- how docs are organized
- how layers depend on one another
- how to place or reconcile docs

Primary home:
- `docs/meta/`

Important limit:
- meta docs do not override founder, governance, product, UX, architecture, knowledge, or phase truth

## 4. Conflict rule
If two docs conflict:
1. founder / governance truth wins over all lower layers
2. product / behaviour docs win over UX and architecture on behavior questions
3. UX docs win over architecture on surface inclusion / exclusion questions
4. architecture docs win on system-shaping and contract questions
5. knowledge docs win on live knowledge content
6. phase docs report scope and status, but they do not silently rewrite higher-layer product truth
7. meta docs clarify placement and traceability, but they do not trump upstream authority

## 5. UI rule
The UI is never the source of truth for:
- strategy meaning
- certainty level
- event creation
- risk logic
- knowledge content truth

It consumes truth. It does not author it.

## 6. Source-artifact rule
`docs/source/` is provenance only.
PDFs, zips, and source-side markdown mirrors do not outrank the live canonical markdown tree unless a reconciliation pass explicitly promotes content into that tree.

## 7. Anti-patterns to block
- UI-authored business logic
- object contracts drifting away from behavior docs
- architecture docs that quietly change product rules
- phase docs claiming authority beyond scope / status reporting
- docs that speak with more authority than their layer deserves

## 8. Practical review test
Ask of any rule:
- what layer does this belong to?
- what upstream source authorizes it?
- what downstream consumer implements it?
- what current canonical folder should own it?
