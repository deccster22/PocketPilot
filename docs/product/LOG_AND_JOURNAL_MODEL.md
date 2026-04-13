# LOG_AND_JOURNAL_MODEL.md

## Purpose

Defines how PocketPilot handles optional user reflection without becoming a guilt diary, ritual machine, or generic activity report.

## Founding stance

Reflection should help users remember what mattered, not make them perform self-improvement for the app.

## Reflection ladder

- Event Ledger is canonical structured truth.
- Compare-window reflections are service-owned bounded comparisons built from interpreted history.
- Monthly and quarterly summaries are service-owned calm period readbacks built from interpreted history.
- Summary Archive is the calm service-owned shelf where prepared period readbacks can be revisited later.
- Year in Review is one calm service-owned annual debrief built from the last completed calendar year.
- Export foundation is one calm service-owned preparation seam for reflection output that is already ready under Insights.
- Journal groundwork now adds one calm service-owned note subsection under Insights with explicit fetch / save / update seams.
- Since Last Checked is a separate calm Snapshot section for recent meaningful change, not an archive shelf or journal entry lane.
- Export dispatch now adds one calm service-owned file-creation seam plus one narrow journal-aware follow-through path where the current summary context and export format honestly support it.
- Log remains a later phase; journal scope is still intentionally narrow.

These layers should stay related without collapsing into one mixed voice.

## Distinction

### Log

Lighter, quicker, and more structured.

### Journal

Deeper, slower, and more reflective.

## Product job

- preserve decision context
- support learning memory
- enrich review surfaces
- support reflection without shame
- keep medium-horizon summaries descriptive rather than performative

## Non-negotiables

- optional
- non-judgmental
- not required for core product use
- separate from canonical ledger truth
- monthly / quarterly summaries stay calm and service-owned
- compare-window reflections stay calm, bounded, service-owned, and non-moralizing
- Year in Review stays calm, service-owned, and descriptive rather than evaluative
- summary archive stays service-owned, descriptive, and browseable without theatre
- reflection exports stay service-owned, explicit about coverage, timezone-labeled, and profile-aware
- the first journal lane stays service-owned, text-only, context-linked, and optional
- journal save / update stays explicit and user-authored
- journal-aware export follow-through stays explicit, optional, and narrow
- no reminders, no AI commentary, and no behavior scoring
- no scorecards, streaks, or performance theatre

## What monthly / quarterly summaries are for

- give one honest month or quarter readback when interpreted history is ready
- highlight what changed across a meaningful period without making the user feel graded
- stay narrower than Year in Review and lighter than journaling

## What compare-window reflections are for

- give one bounded side-by-side comparison such as last 90 days versus the prior 90 days, last quarter versus the quarter before, or last year versus the year before when interpreted history is ready
- keep compare-window selection and shaping in `services/` rather than turning `app/` into a review engine
- support calm comparison without turning reflection into grading, prediction, or analytics theatre
- stay honest when a requested boundary, such as before-versus-after strategy change, is not yet supported by the interpreted history spine

## What summary archive is for

- keep prepared monthly / quarterly readbacks available after the moment has passed
- provide one quiet shelf under Insights instead of pushing reflection into a reporting center
- stay narrower than Year in Review, exports, or journaling expansion

## What Year in Review is for

- give one honest annual debrief for the last completed calendar year when interpreted history is ready
- answer what stood out across the year without turning reflection into a brag reel or report card
- stay narrower than exports, journaling expansion, or a full analytics suite

## What export foundation and dispatch are for

- prepare one calm export request from reflection material that is already ready under Insights
- keep export shaping and dispatch preparation in `services/` rather than turning `app/` into a reporting engine
- expose profile-aware formats honestly: formatted PDF summary for all profiles, summary CSV for intermediate and advanced, and event-ledger CSV for advanced
- keep period selection explicit and timezone labeling visible for CSV-oriented exports
- support one explicit user-requested create-export path without background work or silent automation
- allow one narrow linked-summary-note follow-through only for the current PDF summary path when the note already exists and the user explicitly includes it
- stay narrower than a report center, export-management suite, or journaling workflow

## What the journal groundwork is for

- support one small optional note attached to a calm reflection context under Insights
- keep journal linkage, availability, and saved-note shaping in `services/`
- keep `app/` on prepared journal contracts rather than local context derivation
- preserve the user's own wording without rewriting, judging, or coaching it
- support later export follow-through only where the linked reflection context and chosen format can carry that note honestly
- stay narrower than a general-purpose notes app, reminder system, or analytics product

## What this family is not

- not a mini report card
- not a giant export digest or export-management center
- not a full notes app in this phase
- not a guilt loop
- not a behavior-scoring system

## Drift to block

- streaks
- guilt loops
- forced reflection
- diary coercion
- "good trader / bad trader" scoring
- moralizing period recaps
- performance-style annual recaps
- archive-as-dashboard drift
- export-center drift
- hidden note inclusion inside exports
- reminder-driven journaling
- note-center drift
- AI-generated reflection commentary
