# Knowledge Model (P7-K1, P7-K2, P7-K3, P7-K4, P7-K5, P9-S2)

## Purpose

`services/knowledge` is PocketPilot's first canonical knowledge substrate.

`P7-K1` established the baseline shelf seam.
`P7-K2` extends that same seam with one subordinate topic detail contract without turning knowledge into a CMS, markdown browser, or gating system.
`P7-K3` adds one thin contextual-eligibility seam without turning knowledge into a recommendation engine or broad rollout system.
`P7-K4` carries that same seam into a calm live-surface rollout for Dashboard and Trade Hub.
`P7-K5` refines the live rollout with one explicit density/placement presentation seam without turning it into a feed or gate.
`P9-S2` adds one preview-owned follow-through seam in `services/strategyNavigator/` that consumes the same canonical knowledge catalog.

The current goal is simple:

- keep one canonical in-app knowledge tree
- shape that tree into one prepared library contract
- shape one selected topic into one prepared topic-detail contract
- shape one interpreted surface into one prepared contextual-eligibility result
- shape one live contextual shelf into one prepared presentation result
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

`P7-K3` adds one explicit contextual-eligibility contract:

```ts
type ContextualKnowledgeAvailability =
  | {
      status: 'UNAVAILABLE';
      reason:
        | 'NO_RELEVANT_TOPIC'
        | 'NOT_ENABLED_FOR_SURFACE'
        | 'INSUFFICIENT_INTERPRETED_CONTEXT';
    }
  | {
      status: 'AVAILABLE';
      surface: 'SNAPSHOT' | 'DASHBOARD' | 'TRADE_HUB' | 'INSIGHTS' | 'STRATEGY_PREVIEW';
      items: readonly Array<{
        topicId: string;
        title: string;
        reason: string;
      }>;
    };
```

Rules:

- `services/knowledge` owns candidate selection and ordering
- `app/` consumes the ordered candidates only
- contextual reasons are prepared copy, not raw source metadata
- unsupported or thin context returns explicit unavailable states
- the contract stays small and does not include markdown, docs paths, or progress mechanics

`P7-K5` adds one explicit contextual presentation contract:

```ts
type ContextualKnowledgePresentation = {
  maxVisibleTopics: number;
  emphasis: 'SUBORDINATE' | 'LIGHT' | 'STANDARD';
  shouldRenderShelf: boolean;
};
```

Rules:

- `services/knowledge/createContextualKnowledgePresentation.ts` owns density and placement shaping
- `services/knowledge/createContextualKnowledgeLane.ts` owns the live shelf composition seam and applies the presentation to the selected topics
- `app/` consumes the prepared presentation only
- the shelf can stay available but intentionally not render when relevance is too thin
- the contract stays small and does not include gating, recommendation, or inbox behaviour

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
-> createContextualKnowledgeAvailability
-> fetchContextualKnowledgeAvailability
-> createContextualKnowledgePresentation
-> createContextualKnowledgeLane
-> contextual live shelf
```

`P9-S2` then adds a preview-specific follow-through path on top of the same catalog:

```text
knowledgeCatalog
-> selectStrategyPreviewKnowledge
-> createStrategyNavigatorVM
-> fetchStrategyNavigatorVM
-> Strategy Preview follow-through section
```

Responsibilities:

- `services/knowledge/knowledgeCatalog.ts` owns the canonical runtime tree
- `services/knowledge/createKnowledgeLibraryVM.ts` owns shelf grouping and deterministic ordering
- `services/knowledge/createKnowledgeTopicDetailVM.ts` owns selected-topic shaping
- `services/knowledge/fetchKnowledgeLibraryVM.ts` owns library surface enablement
- `services/knowledge/fetchKnowledgeTopicDetailVM.ts` owns topic-detail surface enablement
- `services/knowledge/createContextualKnowledgePresentation.ts` owns contextual density / placement shaping
- `services/knowledge/createContextualKnowledgeLane.ts` owns the contextual live-lane composition and applies the presentation to the selected topics
- `services/knowledge/createContextualKnowledgeAvailability.ts` owns contextual candidate shaping
- `services/knowledge/fetchContextualKnowledgeAvailability.ts` owns contextual surface interpretation
- `services/strategyNavigator/selectStrategyPreviewKnowledge.ts` owns preview-specific follow-through selection
- `app/screens/*knowledge*View.ts` files format prepared display text only
- `app/` does not read docs files, browse markdown, group raw nodes, infer related-topic metadata, or rank contextual candidates locally

## Availability And Gating Rules

Knowledge stays optional in `P7-K1`, `P7-K2`, `P7-K3`, `P7-K4`, and `P7-K5`.

Rules locked in this phase:

- the Knowledge Library remains available as a top-level destination
- the topic detail surface is subordinate to that same shelf
- the contextual seam is allowed to return `AVAILABLE` only when interpreted surface context is strong enough
- the contextual shelf may still remain hidden when the presentation says the relevant context is too thin for the current profile or surface
- Strategy Preview is the only proof-path consumer in `P7-K3`
- Dashboard and Trade Hub are the only live-surface consumers in `P7-K4` and `P7-K5`
- `P9-S2` keeps actual preview follow-through selection inside `services/strategyNavigator/`
- other surfaces may still return `NOT_ENABLED_FOR_SURFACE`
- missing or unsupported topic selection must return explicit `UNAVAILABLE`
- unavailable knowledge must not block Dashboard, Snapshot, Trade Hub, or monitoring flows
- no background work, push notifications, or hidden recommendation engine are introduced

## Relationship To Later Work

`P7-K3`, `P7-K4`, and `P7-K5` are still baseline work, not the whole knowledge family.

Later phases can build on this seam by:

- widening contextual links from strategies, signals, and events through the same service-owned eligibility rules
- adding richer detail presentation or media handling when the model honestly supports it
- tuning the density rules further only if a later rung keeps the shelf calm and subordinate
- connecting knowledge more deeply with `P8` reflection flows and future `P9` explanation work
- adding recommendation logic only after the shelf and detail contracts are already stable

Those later phases should extend the same catalog and service-owned selection seams instead of inventing UI-side knowledge paths.
