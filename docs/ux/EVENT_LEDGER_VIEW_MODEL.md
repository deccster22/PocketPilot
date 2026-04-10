---
title: 'EVENT_LEDGER_VIEW_MODEL'
status: 'draft'
owner: 'founder'
doc_class: 'ux-spec'
purpose: 'Canonical PocketPilot documentation artifact'
depends_on: []
related_docs: []
canonical_path: '/docs/ux/EVENT_LEDGER_VIEW_MODEL.md'
---

# EVENT_LEDGER_VIEW_MODEL.md

## Purpose

Defines how Event Ledger should be exposed to users in product surfaces without turning canonical event memory into noise, blame, or raw developer logs.

## 1. Product role

Event Ledger is the memory spine for market events and user action events.
The **view model** is the user-facing layer that decides:

- how entries are grouped
- how much context is shown
- how system truth and user meaning remain distinct
- how ledger surfaces support reflection without moralizing

## 2. Non-negotiables

- Event Ledger is canonical memory, not optional note-taking
- stores both market and user action events
- contextualizes, not moralizes
- no ad hoc event formats outside the canonical contract
- no shame language
- no report-card framing

## 3. Canonical entry model

User-facing ledger views should be built from canonical event data such as:

- event id
- class (`market` / `user_action`)
- account
- symbol
- strategy
- timestamp
- alignment state
- signal context
- payload

The view layer may format or group these, but must not distort them.

## 4. Primary view modes

### Chronological stream

Default history-oriented view.

### Grouped cluster view

Groups related events into one narrative block or period cluster.

### Filtered strategy view

Shows events through the currently selected strategy.

### Action-context view

Shows user actions with surrounding event context.

## 5. What a ledger entry should show

A good ledger row / card should help the user answer:

- what happened
- when
- for which strategy / account / asset
- under what alignment context
- whether this was a market event or a user action

## 6. What a ledger entry should not show by default

- raw provider payloads
- developer-shape internals
- every microscopic signal
- moral judgment
- pseudo-performance labels

## 7. Relationship to user action events

User action events should be shown with:

- strategy active at the time
- alignment state
- signal context
- price
- action metadata

This is what later allows reflection summaries to compare aligned vs outside-strategy actions without shaming language.

## 8. Relationship to summaries

Since Last Checked, Reorientation, summaries, and reviews should be **built from** Event Ledger.
They should not compete with or replace it.
Ledger is the memory spine; summaries are the readable condensation layer.

Monthly and quarterly summaries should arrive as prepared period briefings:

- shaped in `services/`
- calm and descriptive in tone
- limited to a few stronger notes plus honest limitations
- never assembled into KPI dashboards or report cards in `app/`

Summary archive should arrive as prepared summary stubs:

- shaped in `services/`
- ordered as a quiet record shelf
- explicit about covered period and prepared date labels
- kept separate from raw ledger browsing
- never derived into analytics theatre or report cards in `app/`

## 9. Relationship to Log and Journal

Event Ledger = canonical structured truth.
Log / Journal = optional user-authored meaning.
These must stay visually and conceptually distinct in any combined view.

## 10. Filtering rules

Ledger views should support filters such as:

- strategy
- account
- symbol
- event class
- time range
- aligned / mixed / weak action context where appropriate

Filtering should increase clarity, not become a query-builder hobby.

## 11. Anti-patterns to block

- raw event-dump UX
- blame-oriented action history
- mixing system truth and user feeling into one voice
- redundant shadow history systems
- flattening market and user events until context disappears

## 12. Practical decision test

1. Does this make the memory layer more understandable?
2. Does it preserve canonical event truth?
3. Does it help the user connect events and actions without moralizing?
4. Is the view more useful than a raw log, not just prettier?
5. Can later summaries build cleanly from this?

## 13. Relationship to other docs

Sits beside:

- `LOG_AND_JOURNAL_MODEL.md`
- `ASSET_NARRATIVE_MODEL.md`
- `EVENT_SYSTEM.md`
- `EVENT_LEDGER_ARCHITECTURE.md`
- `MARKET_EVENT_MODEL.md`
