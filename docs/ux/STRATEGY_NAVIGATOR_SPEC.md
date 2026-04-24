# Strategy Navigator Spec (P9-S1, P9-S2, P9-S3, P9-S4, P9-S5, P9-S6, P9-S7, P9-S8, P9-S9)

## Purpose

Strategy Navigator should feel like a quiet briefing simulator with one gentle next step.
`P9-S3` adds one calm why shelf inside that same briefing card.
`P9-S4` adds one calm scenario-contrast shelf inside that same briefing card.
`P9-S5` compacts that same card so the preview focus stays primary, supporting context stays lighter, and optional reading stays clearly optional.
`P9-S6` adds one calm fit-contrast proof path ("why this, not that") using prepared service output only.
`P9-S7` improves nearby-alternative selection quality for that same fit-contrast path using service-owned heuristics only.
`P9-S8` keeps that same visible path but normalizes fit/nearby comparison onto one service-owned strategy metadata registry.
`P9-S9` keeps those same semantics and adds conservative mobile progressive disclosure so secondary detail does not crowd first view.

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
- app may render one small prepared fit-contrast section inside that preview card only when services mark it available
- app may not choose nearby alternatives locally; it renders prepared comparator output only
- app may not resolve strategy metadata locally; metadata ownership stays in services
- app may render one small prepared explanation section inside that preview card only when services mark it available
- app may render one small prepared knowledge follow-through section inside that preview card only when services mark it available
- app may group prepared explanation and contrast into one lighter supporting-context shelf
- app may present prepared knowledge follow-through as one clearly optional helpful-next-reading shelf
- app may own local show more/less disclosure state for prepared secondary detail
- unavailable state stays honest and minimal
- no execution CTA
- no wizard flow
- no raw market tape
- no scoreboards, streaks, or progress loops

## Initial Layout

The `P9-S5` layout remains intentionally compact:

1. Title and short calming summary
2. Strategy selector
3. Scenario selector
4. Preview card or honest unavailable state
5. One dominant main-preview-focus block inside the preview card
6. One compact supporting detail stack for Dashboard shift, Market events, and Alert posture
7. One optional supporting-context shelf for explanation and scenario contrast
8. One optional supporting-context fit-contrast proof path
9. One optional helpful-next-reading shelf
10. Secondary supporting detail may start collapsed with explicit show more/less controls

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
- one dominant Snapshot emphasis line
- a short compact Dashboard shift list
- a short compact MarketEvents-that-matter list
- one alert-posture line in the same supporting detail stack
- zero or one light supporting-context shelf that groups prepared explanation, prepared fit contrast, and prepared scenario contrast
- zero or a few optional helpful-next-reading items

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

## Fit Contrast Guidance

The optional fit-contrast section should feel like:

- "Why this, not that"
- "Why this strategy fits better right now"
- "Why nearby alternatives are less suitable right now"
- "What ambiguity still remains"

It should stay:

- compact
- comparative
- calm
- interpretation-first
- based on service-owned nearby alternatives, not app-side ranking
- grounded in one canonical service-owned strategy metadata seam

It should not feel like:

- "Best strategy leaderboard"
- "Top strategies now"
- "Guaranteed setup"
- "Switch now"

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

- "Helpful next reading"
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

`P9-S1`, `P9-S2`, `P9-S3`, `P9-S4`, `P9-S5`, `P9-S6`, `P9-S7`, `P9-S8`, and `P9-S9` should still remain the reference for the core mood:

- calm
- exploratory
- non-directive
- service-owned

The preview-to-knowledge bridge should still stay:

- optional
- subordinate to the preview
- easy to ignore
- limited to prepared service-owned items
