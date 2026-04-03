# PX-E1 - Why / Lineage / Explanation Foundation

## Why This Phase Happened Now
PocketPilot already had the interpreted seams needed for a first explanation layer:
- `MarketEvent`
- `EventLedger`
- event queries
- `Since Last Checked`
- `OrientationContext`
- prepared Dashboard state

PX-E1 happens now because the substrate is finally strong enough to support one honest explanation path without falling back to raw signal leakage, provider diagnostics, or UI-side assembly.

This phase creates the first thin explanation seam while keeping the product calm and subordinate.
It does not claim that the richer `P9` explanation family is complete.

## What PX-E1 Added
PX-E1 adds four foundational pieces:

1. One canonical explanation contract in `services/explanation/types.ts`.
2. One canonical explanation builder in `services/explanation/createExplanationSummary.ts`.
3. One Dashboard-owned fetch seam in `services/dashboard/fetchDashboardExplanationVM.ts`.
4. One first consumer surface on Dashboard prime / Focus only.

The current Dashboard path is now:

`EventStream -> EventLedger -> EventLedgerQueries -> Since Last Checked -> OrientationContext -> createExplanationSummary -> fetchDashboardExplanationVM -> DashboardScreen`

## Confidence And Lineage Rules
Confidence in PX-E1 is about evidence support for the current interpreted picture.
It is not about likely profit, likely win rate, or future certainty.

Rules locked in this phase:
- confidence must be `LOW`, `MODERATE`, or `HIGH`
- confidence notes must say they reflect evidence support
- confidence notes must say they do not guarantee an outcome
- lineage is capped at 3 items
- lineage uses interpreted events, state transitions, and context only
- raw signal arrays, event IDs, strategy IDs, and provider/runtime metadata stay out of user-facing explanation
- when context is too thin, `UNAVAILABLE` is preferred over invented explanation

## First Consumer Surface
The first consumer surface is Dashboard prime / Focus only.

Why Dashboard first:
- Snapshot should stay lighter and more sacred
- Dashboard is the natural home for a subordinate why affordance
- the Focus layer is where users are most likely to ask why an item is leading the surface

PX-E1 deliberately does not wire explanation into:
- Snapshot
- Trade Hub
- multiple surfaces at once

## What PX-E1 Deliberately Did Not Add
PX-E1 does not add:
- a full Insights product
- journaling, exports, or archives
- push notifications
- background polling
- AI-generated explanations
- provider/runtime diagnostics inside product explanation
- raw signal escape hatches
- a generic knowledge wiki
- predictive confidence language
- a second explanation path in `app/`

## Why The Label Is PX-E1
This work is explanation groundwork, but it is not the full richer explanation / navigator family.

`PX-E1` is the right label because the work is:
- cross-cutting infrastructure
- intentionally thin
- reusable by later surfaces
- not evidence that the canonical `P9` family is underway or complete

## What Future Phases Should Build On Top Of It
Later explanation, history, and insights phases should reuse this seam instead of creating competing explanation paths.

Natural next steps:
- extend the same contract to a deeper Focus view without changing Dashboard ownership rules
- add richer lineage selection above the same interpreted seams
- connect future explanation work to deeper history or pattern navigation once those product families are explicitly scheduled
- keep explanation shaping in `services/` and preserve calm, non-predictive copy rules
