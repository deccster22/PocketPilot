# Knowledge Layer

## Product Intent

PocketPilot's knowledge layer exists to make the user feel steadier and better oriented, not more managed.

The product promise is:

- always accessible
- optional
- non-intrusive
- calm in tone
- supportive of strategy understanding and event interpretation

Knowledge is there when the user wants a clearer frame.
It is not there to delay access, demand completion, or perform as a motivational system.

## P7 Baseline Posture

`P7-K1`, `P7-K2`, and `P7-K3` together define the first usable knowledge baseline.

What that now means:

- one canonical in-app knowledge catalog aligned to the normalized `docs/knowledge/` tree
- one service-owned library VM
- one service-owned topic-detail VM
- one service-owned contextual-eligibility seam
- one top-level Knowledge Library shelf
- one subordinate topic detail view keyed by `topicId`
- one thin Strategy Preview proof path for optional contextual knowledge

What it still does not mean:

- a giant content-management system
- a generic crypto encyclopedia
- a tutoring product
- forced reading before other flows
- contextual rollout across every major surface

The library should still feel like a quiet reference shelf.
The topic view should feel like opening one calm article, not browsing repo files.

## Accessibility Without Pressure

Knowledge should be easy to reach and easy to ignore.

Rules:

- the Knowledge Library remains a top-level destination
- topic detail opens from the library shelf, related topics, and one approved Strategy Preview proof path
- library access does not gate Snapshot, Dashboard, Trade Hub, or monitoring flows
- missing knowledge content must degrade honestly instead of manufacturing filler
- contextual support stays narrow, optional, and service-owned in this phase

## Tone And Copy Rules

Knowledge copy must stay aligned with PocketPilot's product ethics.

Keep:

- calm phrasing
- concise summaries
- explanatory framing
- uncertainty honesty
- discipline-forward wording

Avoid:

- hype
- urgency
- condescension
- homework tone
- promises of profit or certainty

## Topic Detail Rules

P7-K2 and P7-K3 add calmer deeper steps, not a second knowledge product.

Rules:

- app renders prepared topic sections only
- app renders prepared contextual candidates only
- no raw markdown or file-path browsing
- no quizzes, streaks, or progress theatre
- no unlocks, gates, or required reading prompts
- related topics and contextual affordances may deepen reading, but they must stay optional and low-pressure

## Contextual Eligibility Rules

`P7-K3` adds one thin contextual seam before any broad rollout.

Rules:

- `services/knowledge` decides whether a contextual affordance is available
- `app/` does not rank or infer relevance locally
- unsupported or thin context returns explicit unavailable states
- contextual knowledge can appear only when the interpreted surface has enough signal to justify it
- Strategy Preview is the only proof-path surface in this phase
- Snapshot and Trade Hub remain deliberately out of rollout for now

## Audience Fit

The same knowledge layer should still feel natural across profiles.

- Beginner: clear foundational references that reduce confusion
- Intermediate: enough interpretation depth to connect strategy and event language
- Advanced: concise references that stay available without constant prompting

`P7-K2` deepens that shared base with one canonical topic view.
`P7-K3` adds one minimal eligibility seam so later contextual rollout can build on a prepared contract instead of UI-side guesses.
Broader profile-sensitive contextual surfacing can still come later once this thinner seam has proven stable.
