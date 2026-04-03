# Knowledge Library Spec (P7-K1)

## Purpose
The Knowledge Library is PocketPilot's first dedicated learning surface.

In P7-K1 it exists to provide one calm, always-accessible reference shelf for:
- how PocketPilot thinks
- how to read basic strategy language
- how to interpret market-event framing
- why the product keeps discipline ahead of urgency

This is the baseline library, not the finished knowledge system.

## Surface Rules
- one top-level destination only in this phase
- app renders prepared sections and items only
- no app-side grouping, sorting, or node assembly
- no recommendation rail
- no gamification
- no urgency language
- no patronising lesson flow

If knowledge is unavailable, the surface should show a minimal honest state rather than decorative filler.

## Surface Contract
The screen consumes the prepared `KnowledgeLibraryVM`.

Current shape:

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

The screen may format labels for display, but it must not:
- import or shape raw `KnowledgeNode` content
- decide section taxonomy
- infer contextual eligibility

## Initial Structure
The first structure is intentionally boring and legible.

Baseline sections:
- Getting Started
- Strategy Basics
- Event Interpretation
- Risk and Discipline

The point is easy scanning, not taxonomy sophistication.

## Presentation Guidance
- use simple cards or list rows
- let title, summary, difficulty, and media type do the work
- prefer whitespace and restraint over visual theatre
- treat the surface as reference material, not a task queue

## Explicit Exclusions
P7-K1 does not add:
- Dashboard contextual links
- Snapshot contextual links
- Trade Hub contextual links
- article-detail navigation complexity
- search or ranking systems
- streaks, quizzes, badges, or completion bars
- AI chat or personalised tutoring
