# Strategy Navigator Spec (P9-S1, P9-S2, P9-S3, P9-S4)

## Purpose

Strategy Navigator should feel like a quiet briefing simulator with one gentle next step.
`P9-S3` adds one calm why shelf inside that same briefing card.
`P9-S4` adds one calm scenario-contrast shelf inside that same briefing card.

It should help a user compare strategy lenses without:

- pressure
- hype
- prediction theatre
- simulator complexity
- homework-flow energy

## Surface Rules

- one top-level Preview destination in this phase
- app renders prepared strategy and scenario options only
- app renders one prepared preview card only
- app may render one small prepared scenario-contrast section inside that preview card only when services mark it available
- app may render one small prepared explanation section inside that preview card only when services mark it available
- app may render one small prepared knowledge follow-through section inside that preview card only when services mark it available
- unavailable state stays honest and minimal
- no execution CTA
- no wizard flow
- no raw market tape
- no scoreboards, streaks, or progress loops

## Initial Layout

The `P9-S4` layout remains intentionally plain:

1. Title and short calming summary
2. Strategy selector
3. Scenario selector
4. Preview card or honest unavailable state
5. Optional what-changes-in-this-scenario section inside the preview card
6. Optional why-this-strategy-cares section inside the preview card
7. Optional related-reading section inside the preview card

This is enough for orientation.
The first surface still does not need a full multi-panel transformation.

## Interaction Guidance

- selecting a strategy should immediately refresh the prepared preview
- selecting a scenario should immediately refresh the prepared preview
- if prepared knowledge is available, opening a topic should feel like an optional shelf step, not a branch in a funnel
- every state change should remain deterministic
- the user should never feel trapped in a flow

## Preview Card Guidance

The preview card should show:

- the selected strategy and scenario
- one Snapshot emphasis line
- a short Dashboard shift list
- a short MarketEvents-that-matter list
- one alert-posture line
- zero or one short prepared scenario-contrast section
- zero or one short prepared explanation section
- zero or a few optional related-reading items

The card should not show:

- charts pretending to be live
- buy or sell language
- implied profit probability
- signal IDs or provider internals
- celebratory or alarmist styling
- markdown content blocks

## Preview Contrast Guidance

The optional contrast section should feel like:

- "What changes in this scenario"
- "What this strategy pays more attention to here"
- "What fades into the background here"

It should stay:

- short
- calm
- descriptive
- subordinate to the preview

It should not feel like:

- "Which strategy wins"
- "Most likely outcome"
- "Best setup now"
- "Strategy battle"

## Preview Explanation Guidance

The optional explanation section should feel like:

- "Why this strategy cares here"
- "What this lens is noticing"
- "Why that matters for this worldview"

It should stay:

- short
- calm
- educational
- subordinate to the preview

It should not feel like:

- "What to do next"
- "Expected move"
- "Best strategy here"
- "Simulated outcome score"

## Knowledge Follow-Through Guidance

The optional section should feel like:

- "Core concepts behind this preview"
- "Related strategy reading"
- "Read next if helpful"

It should not feel like:

- "Complete this first"
- "Recommended path"
- "Start onboarding"
- "Unlock the next step"

## Tone Guidance

Preferred tone:

- steady
- modest
- observational
- confidence-limited

Avoid:

- red-alert framing
- heroic language
- coaching pressure
- challenge or game framing
- guilt-based educational tone

## Relationship To Later UX Work

Future `P9` UX may introduce richer transformations, context links, or deeper explanation shelves.

`P9-S1`, `P9-S2`, `P9-S3`, and `P9-S4` should still remain the reference for the core mood:

- calm
- exploratory
- non-directive
- service-owned

The preview-to-knowledge bridge should still stay:

- optional
- subordinate to the preview
- easy to ignore
- limited to prepared service-owned items
