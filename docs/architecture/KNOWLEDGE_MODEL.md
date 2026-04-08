# Knowledge Model (P7-K1, P7-K2)

## Purpose

`services/knowledge` is PocketPilot's first canonical knowledge substrate.

`P7-K1` established the baseline shelf seam.
`P7-K2` extends that same seam with one subordinate topic detail contract without turning knowledge into a CMS, markdown browser, or gating system.

The current goal is simple:

- keep one canonical in-app knowledge tree
- shape that tree into one prepared library contract
- shape one selected topic into one prepared topic-detail contract
- keep `app/` passive and display-only
- keep knowledge optional, calm, and non-intrusive

## Canonical Contracts

The canonical product knowledge object is still `KnowledgeNode`.

```ts
type KnowledgeNode = {
  topicId: string;
  title: string;
  summary: string;
  content: string;
  mediaType: 'ARTICLE' | 'DIAGRAM' | 'VIDEO' | 'INTERACTIVE' | 'CASE_STUDY';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  strategyLinks: readonly string[];
  signalLinks: readonly string[];
  eventTypeLinks: readonly string[];
};
```

`P7-K2` adds one richer service-owned catalog entry internally so the same canonical tree can support both shelf and detail shaping:

```ts
type KnowledgeCatalogEntry = KnowledgeNode & {
  family:
    | 'orientation'
    | 'core-language'
    | 'strategies'
    | 'action-risk'
    | 'reflection'
    | 'knowledge-system';
  priority: 'NOW' | 'NEXT' | 'LATER';
  sections: readonly KnowledgeTopicSection[];
  relatedTopicIds: readonly string[];
};
```

The library surface remains intentionally smaller:

```ts
type KnowledgeLibraryVM = {
  title: string;
  summary: string;
  availability:
    | { status: 'UNAVAILABLE'; reason: 'NO_KNOWLEDGE_BASELINE' | 'NOT_ENABLED_FOR_SURFACE' }
    | {
        status: 'AVAILABLE';
        sections: readonly Array<{
          id: string;
          title: string;
          items: readonly Array<{
            topicId: string;
            title: string;
            summary: string;
            difficulty: KnowledgeDifficulty;
            mediaType: KnowledgeMediaType;
          }>;
        }>;
      };
};
```

The new topic-detail contract is also prepared for rendering rather than source browsing:

```ts
type KnowledgeTopicDetailVM = {
  generatedAt: string | null;
  availability:
    | {
        status: 'UNAVAILABLE';
        reason: 'NO_TOPIC_SELECTED' | 'TOPIC_NOT_FOUND' | 'NOT_ENABLED_FOR_SURFACE';
      }
    | {
        status: 'AVAILABLE';
        topic: {
          topicId: string;
          title: string;
          summary: string;
          difficulty: KnowledgeDifficulty | null;
          sections: readonly KnowledgeTopicSection[];
          relatedTopicIds: readonly string[];
          relatedTopics: readonly KnowledgeTopicRelatedItem[];
        };
      };
};
```

Rules:

- `topicId` is the only routing-safe identifier exposed forward
- `sections` are prepared text blocks, not markdown source fragments
- `relatedTopics` exist so `app/` never has to look up topic metadata locally
- no raw file paths, repo metadata, progress theatre, or recommendation scores are exposed to the UI

## Canonical Knowledge Tree

The runtime catalog now has one canonical source path:

```text
docs/knowledge/ + CONTENT_REGISTER
-> scripts/generate-knowledge-catalog.js
-> services/knowledge/knowledgeCatalog.ts
```

That generated catalog is the live in-app tree used by both shelf and detail shaping.
This keeps the app aligned with the normalized docs tree instead of leaving an old hand-maintained seed catalog drifting beside it.

## Service Path

The current service path is:

```text
knowledgeCatalog
-> createKnowledgeLibraryVM
-> fetchKnowledgeLibraryVM
-> Knowledge Library screen
-> createKnowledgeTopicDetailVM
-> fetchKnowledgeTopicDetailVM
-> Knowledge topic detail screen
```

Responsibilities:

- `services/knowledge/knowledgeCatalog.ts` owns the canonical runtime tree
- `services/knowledge/createKnowledgeLibraryVM.ts` owns shelf grouping and deterministic ordering
- `services/knowledge/createKnowledgeTopicDetailVM.ts` owns selected-topic shaping
- `services/knowledge/fetchKnowledgeLibraryVM.ts` owns library surface enablement
- `services/knowledge/fetchKnowledgeTopicDetailVM.ts` owns topic-detail surface enablement
- `app/screens/*knowledge*View.ts` files format prepared display text only
- `app/` does not read docs files, browse markdown, group raw nodes, or infer related-topic metadata

## Availability And Gating Rules

Knowledge stays optional in `P7-K1` and `P7-K2`.

Rules locked in this phase:

- the Knowledge Library remains available as a top-level destination
- the topic detail surface is subordinate to that same shelf
- other surfaces may still return `NOT_ENABLED_FOR_SURFACE`
- missing or unsupported topic selection must return explicit `UNAVAILABLE`
- unavailable knowledge must not block Dashboard, Snapshot, Trade Hub, or monitoring flows
- no background work, push notifications, or hidden recommendation engine are introduced

## Relationship To Later Work

`P7-K2` is still baseline work, not the whole knowledge family.

Later phases can build on this seam by:

- widening contextual links from strategies, signals, and events through service-owned eligibility rules
- adding richer detail presentation or media handling when the model honestly supports it
- connecting knowledge more deeply with `P8` reflection flows and future `P9` explanation work
- adding recommendation logic only after the shelf and detail contracts are already stable

Those later phases should extend the same catalog and fetch seams instead of inventing parallel knowledge paths.
