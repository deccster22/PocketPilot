# Knowledge Model (P7-K1)

## Purpose
`services/knowledge` is PocketPilot's first canonical knowledge substrate.

P7-K1 establishes one product-facing knowledge object, one library-shaping seam, and one first library VM without turning knowledge into a CMS or a gating system.

The phase goal is simple:
- define what a PocketPilot knowledge node is
- shape a small baseline catalog into one prepared library contract
- keep `app/` passive and display-only
- keep knowledge optional, calm, and always accessible

## Canonical Contracts
The canonical product knowledge object is `KnowledgeNode`.

```ts
type KnowledgeNode = {
  topicId: string
  title: string
  summary: string
  content: string
  mediaType: 'ARTICLE' | 'DIAGRAM' | 'VIDEO' | 'INTERACTIVE' | 'CASE_STUDY'
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  strategyLinks: readonly string[]
  signalLinks: readonly string[]
  eventTypeLinks: readonly string[]
}
```

Rules:
- `topicId` is the only routing-safe identifier exposed forward
- `title` and `summary` are user-facing and legible
- `content` is product knowledge content, not CMS body metadata
- links exist for future service-owned contextual eligibility only
- no progress, completion, streak, admin, or recommendation-score fields

The first prepared library contract is intentionally smaller:

```ts
type KnowledgeLibraryItem = {
  topicId: string
  title: string
  summary: string
  difficulty: KnowledgeDifficulty
  mediaType: KnowledgeMediaType
}

type KnowledgeLibrarySection = {
  id: string
  title: string
  items: readonly KnowledgeLibraryItem[]
}

type KnowledgeLibraryAvailability =
  | { status: 'UNAVAILABLE'; reason: 'NO_KNOWLEDGE_BASELINE' | 'NOT_ENABLED_FOR_SURFACE' }
  | { status: 'AVAILABLE'; sections: readonly KnowledgeLibrarySection[] }

type KnowledgeLibraryVM = {
  title: string
  summary: string
  availability: KnowledgeLibraryAvailability
}
```

This keeps the current library surface display-safe and prevents raw knowledge bodies or internal linkage metadata from leaking into `app/`.

## Service Path
P7-K1 creates one canonical library path:

```text
knowledgeCatalog
-> createKnowledgeLibraryVM
-> fetchKnowledgeLibraryVM
-> KnowledgeLibraryScreen
```

Responsibilities:
- `services/knowledge/knowledgeCatalog.ts` owns the small baseline content set
- `services/knowledge/createKnowledgeLibraryVM.ts` owns grouping and deterministic ordering
- `services/knowledge/fetchKnowledgeLibraryVM.ts` owns surface enablement and the app-facing VM
- `app/screens/knowledgeLibraryScreenView.ts` formats prepared display text only
- `app/` does not group raw nodes, author sections, or decide contextual eligibility

## Availability And Gating Rules
Knowledge stays optional in P7-K1.

Rules locked in this phase:
- the Knowledge Library is available as a top-level destination
- other surfaces may return `NOT_ENABLED_FOR_SURFACE`
- unavailable knowledge must not block Dashboard, Snapshot, Trade Hub, or monitoring flows
- `UNAVAILABLE` is preferred over filler or forced rollout
- no background work, push notifications, or hidden recommendation engine are introduced

## Content Boundaries
The seed baseline stays narrow on purpose.

Allowed in P7-K1:
- how PocketPilot thinks
- estimated versus confirmed context
- strategy-basics framing already reflected in product behaviour
- market-event interpretation basics
- discipline-before-action framing

Explicitly out of scope:
- broad crypto education corpus
- deep strategy handbooks
- raw provider or runtime diagnostics
- quizzes, streaks, or completion theatre
- AI tutoring or chat-style explanation
- contextual-link rollout across Snapshot, Dashboard, or Trade Hub

## Relationship To Later Work
P7-K1 is a baseline, not the whole knowledge family.

Later phases can build on this seam by:
- expanding the catalog with research-backed, PocketPilot-specific material
- adding detail views or richer media handling
- enabling contextual links from signals, strategies, or events through service-owned eligibility rules
- connecting knowledge with future `P8` reflection surfaces and `P9` richer explanation work

Those later phases should extend the same contracts rather than invent parallel knowledge paths.
