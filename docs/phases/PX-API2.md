# PX-API2 - Runtime Contract Hardening

## Purpose
PX-API2 turns the PX-API1 Provider Router / QuoteBroker doctrine into a thin code-level runtime contract before more live/runtime work is added.

This phase exists to make future runtime work obey explicit semantics for:
- role-tagged requests
- trust metadata on quote-like results
- last-good preservation
- role-safe routing
- foreground-only behavior

## Why This Phase Happened Now
PX-API1 locked the doctrine, but the code still allowed too much ambiguity:
- request intent could still look generic
- runtime trust metadata was not yet unavoidable in code
- execution-vs-reference separation was still too easy to violate by accident
- last-good and cooldown behavior were not explicit enough at the contract seam

PX-API2 happens now so future runtime phases build on constrained contracts instead of broad, underspecified request/result shapes.

## What Changed In Code Contracts
- added shared runtime request/response contract types for:
  - provider request roles
  - freshness state
  - certainty state
  - provider request context
  - quote runtime metadata
  - explicit quote response metadata and failure-policy state
- Provider Router now consumes role-tagged requests and role-keyed provider chains
- Provider Router now rejects role-mismatched providers instead of silently tolerating them
- QuoteBroker now returns explicit runtime trust metadata with quote outputs
- QuoteBroker now surfaces last-good usage, cooldown-active skips, and stale-if-error behavior in result metadata
- downstream service seams preserve runtime trust metadata instead of relying on app-side inference

## What Runtime Complexity Was Deliberately Not Added
- no new provider integrations
- no broker API expansion
- no order dispatch
- no background polling
- no push notifications
- no datastore-backed runtime
- no hidden stale-while-revalidate engine
- no Snapshot, Dashboard, or Trade Hub redesign

PX-API2 stays intentionally thin.
It adds contract clarity, not a larger runtime system.

## Current Honest Runtime Posture
Implemented now:
- explicit role-tagged quote requests
- explicit quote trust metadata
- in-process last-good preservation
- minimal cooldown-active skip handling
- existing budget enforcement through clearer request context

Still future direction:
- datastore-backed prepared runtime state
- background refresh or polling
- richer provider health scoring
- true stale-while-revalidate machinery beyond the explicit placeholder contract field

The contract is intentionally ahead of the runtime machinery only where that limitation is stated plainly in code and docs.

## What Future Runtime Phases Should Build On
Future runtime phases should extend, not replace, these seams:
- role-keyed Provider Router chains
- QuoteBroker as the quote-policy choke point
- explicit trust metadata for quote-like outputs
- explicit failure-policy markers
- foreground-only honesty until a real broader runtime exists

If later phases add richer runtime behavior, they should fill in these explicit contracts rather than invent parallel ones.
