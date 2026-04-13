# Knowledge Library Spec (P7-K1, P7-K2, P7-K7)

## Purpose

The Knowledge Library is PocketPilot's first dedicated learning surface.

In `P7-K1` it became one calm, always-accessible reference shelf.
In `P7-K2` it gains one subordinate topic detail route so a user can move from the shelf into a deeper topic without turning the app into a document browser.
In `P7-K7` that same topic detail route can receive one small prepared relevance frame when the topic came from the Dashboard or Trade Hub contextual shelf.

This is still a baseline knowledge system, not the finished knowledge family.

## Surface Rules

- one top-level destination with one subordinate topic route only in this phase
- library shelf remains the entry point
- app renders prepared sections, items, and topic detail only
- no app-side grouping, topic lookup, or node assembly
- no recommendation rail
- no gamification
- no urgency language
- no patronising lesson flow
- no contextual framing when the topic was opened from a non-contextual path

If knowledge is unavailable, the surface should show a minimal honest state rather than decorative filler.

## Surface Contracts

The shelf consumes the prepared `KnowledgeLibraryVM`.
The detail view consumes the prepared `KnowledgeTopicDetailVM`.

Current shelf shape:

```ts
{
  title: string
  summary: string
  availability:
    | { status: 'UNAVAILABLE'; reason: 'NO_KNOWLEDGE_BASELINE' | 'NOT_ENABLED_FOR_SURFACE' }
    | {
        status: 'AVAILABLE'
        sections: readonly Array<{
          id: string
          title: string
          items: readonly Array<{
            topicId: string
            title: string
            summary: string
            difficulty: KnowledgeDifficulty
            mediaType: KnowledgeMediaType
          }>
        }>
      }
}
```

Current detail shape:

```ts
{
  generatedAt: string | null
  availability:
    | {
        status: 'UNAVAILABLE'
        reason: 'NO_TOPIC_SELECTED' | 'TOPIC_NOT_FOUND' | 'NOT_ENABLED_FOR_SURFACE'
      }
    | {
        status: 'AVAILABLE'
        topic: {
          topicId: string
          title: string
          summary: string
          difficulty: KnowledgeDifficulty | null
          sections: readonly Array<{
            heading: string
            body: readonly string[]
          }>
          relatedTopicIds: readonly string[]
          relatedTopics: readonly Array<{
            topicId: string
            title: string
            summary: string
            difficulty: KnowledgeDifficulty | null
            mediaType: KnowledgeMediaType | null
          }>
        }
      }
}
```

The screen may format labels for display, but it must not:

- import or shape raw `KnowledgeNode` content
- read markdown files or repo paths
- decide section taxonomy
- infer related-topic metadata locally
- infer contextual eligibility

## P7-K7 Topic-Detail Framing
The topic detail screen may receive one optional prepared context frame from `services/knowledge` when a contextual shelf item opens it.

Rules:

- the frame is optional and subordinate
- the frame explains why the current surface made the topic relevant
- the frame can appear only when the service says the origin surface is eligible
- the frame must not become a recommendation feed, gate, or advice surface
- the library entry path stays unchanged when no contextual origin exists

## Initial Structure

The first structure remains intentionally boring and legible.

Baseline shelf sections:

- Orientation
- Core Language
- Strategy Guides
- Action and Risk

The topic view should show:

- one back path to the shelf
- one summary
- one optional difficulty badge
- prepared sections for one topic
- a small related-topics list

The point is easy scanning and one calmer deeper step, not taxonomy sophistication.

## Presentation Guidance

- use simple cards or list rows on the shelf
- let title, summary, difficulty, and media type do the work
- let the topic view read like a calm article, not a file inspector
- prefer whitespace and restraint over visual theatre
- treat related topics as optional follow-on reading, not a required path

## Explicit Exclusions

`P7-K2` does not add:

- Dashboard contextual links
- Snapshot contextual links
- Trade Hub contextual links
- raw markdown or repo-file browsing
- search or ranking systems
- quizzes, streaks, badges, or completion bars
- AI chat or personalized tutoring
- push notifications or background polling
