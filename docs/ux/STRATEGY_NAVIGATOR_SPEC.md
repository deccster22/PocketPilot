# Strategy Navigator Spec (P9-S1)

## Purpose
The first Strategy Navigator surface should feel like a quiet briefing simulator.

It should help a user compare strategy lenses without:

- pressure
- hype
- prediction theatre
- simulator complexity

## Surface Rules

- one top-level Preview destination in this phase
- app renders prepared strategy and scenario options only
- app renders one prepared preview card only
- app may render one prepared contextual knowledge card only when services mark it available
- unavailable state stays honest and minimal
- no execution CTA
- no wizard flow
- no raw market tape
- no scoreboards, streaks, or progress loops

## Initial Layout

The P9-S1 layout is intentionally plain:

1. Title and short calming summary
2. Strategy selector
3. Scenario selector
4. Preview card or honest unavailable state
5. Optional contextual knowledge card

This is enough for orientation.
The first surface does not need a full multi-panel transformation yet.

## Interaction Guidance

- selecting a strategy should immediately refresh the prepared preview
- selecting a scenario should immediately refresh the prepared preview
- every state change should remain deterministic
- the user should never feel trapped in a flow

## Preview Card Guidance

The preview card should show:

- the selected strategy and scenario
- one Snapshot emphasis line
- a short Dashboard shift list
- a short MarketEvents-that-matter list
- one alert-posture line

The card should not show:

- charts pretending to be live
- buy or sell language
- implied profit probability
- signal IDs or provider internals
- celebratory or alarmist styling

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

## Relationship To Later UX Work

Future `P9` UX may introduce richer transformations, context links, or deeper explanation shelves.

P9-S1 should still remain the reference for the core mood:

- calm
- exploratory
- non-directive
- service-owned

The P7-K3 proof path should still stay:

- optional
- subordinate to the preview card
- easy to ignore
- limited to prepared service-owned candidates
