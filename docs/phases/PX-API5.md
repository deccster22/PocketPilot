# PX-API5 - Prepared Runtime Diagnostics Surface

## Purpose
PX-API5 adds one prepared runtime diagnostics seam in `services/debug/`.

This phase exists to make the explicit runtime facts from PX-API2, PX-API3, and PX-API4 inspectable in one coherent place without adding new runtime machinery.

This phase does not dispatch orders.

## Why This Phase Happened Now
PX-API2 locked the role-tagged runtime request and quote metadata contract.
PX-API3 added explicit coalescing, symbol-level degradation state, and thin provider-policy metadata.
PX-API4 added bounded recent-window provider health summaries and scoring.

What was still missing:
- one prepared seam for runtime diagnostics in `services/debug/`
- one coherent diagnostics contract for tests and future debug consumers
- a way to inspect runtime trust, health, and policy state without reverse-engineering multiple raw seams

PX-API5 happens now so future runtime work can build on a stable inspection seam before any broader runtime complexity is introduced.

## What Prepared Diagnostics Were Added
- canonical `RuntimeDiagnosticsVM` types in `services/debug/`
- `createRuntimeDiagnosticsVM` as the deterministic builder for prepared diagnostics
- `fetchRuntimeDiagnosticsVM` as the canonical service entry point for diagnostics assembly
- integration of the prepared diagnostics VM into the existing debug observatory payload
- optional rendering of that prepared diagnostics VM on the existing development-only Snapshot debug panel

The diagnostics VM now prepares:
- provider health entries
- quote policy summary
- per-symbol degradation entries
- sparse factual notes about current runtime limitations

## Surfaced Runtime Facts
PX-API5 surfaces current explicit runtime facts only:
- provider health state
- provider score
- recent attempts / successes / failures / cooldown skips when explicit
- recent health timestamps when explicit
- `coalescedRequest`
- `providersTried`
- `cooldownSkippedProviders`
- `usedLastGood`
- `freshness`
- `certainty`
- per-symbol policy state
- per-symbol current source attribution and timestamps when the current quote output truly carries them

The diagnostics seam consumes existing metadata rather than inventing new provider behavior.

## What Runtime Complexity Was Deliberately Not Added
- no new broker APIs
- no new providers or provider sprawl
- no background polling
- no push notifications
- no datastore/runtime backend
- no adaptive reranking
- no long-memory provider reputation
- no user-facing system-status feature
- no raw signal leakage
- no fake observability theatre

PX-API5 remains foreground-only.

## Current Honest Runtime Posture
Implemented now:
- provider health is inspectable through one prepared diagnostics VM
- quote policy state is inspectable through one prepared diagnostics VM
- per-symbol degradation state is inspectable through one prepared diagnostics VM
- diagnostics can remain partially populated without inventing missing sections
- the existing debug observatory can render the prepared diagnostics VM without moving runtime logic into `app/`

Still intentionally limited:
- `staleWhileRevalidate` remains `NOT_IMPLEMENTED_FOREGROUND_ONLY`
- provider health remains a thin recent-window read and may stay `UNKNOWN`
- no background runtime or persistent health history exists
- no execution-truth to reference-truth substitution is implied or authorized

## What Future Phases Can Safely Consume
Future phases may safely consume:
- `fetchRuntimeDiagnosticsVM` as the canonical diagnostics entry point
- `RuntimeDiagnosticsVM` as the canonical prepared diagnostics contract
- the existing service-owned diagnostics seam for deterministic tests and debug tooling

Future phases should not bypass this seam by rebuilding runtime diagnostics inside `app/` or by re-deriving health/trust semantics from nulls.

## Intended Use
PX-API5 is for:
- inspection
- tests
- debug-oriented service consumers

PX-API5 is not for:
- user-facing runtime theatre
- hidden automation
- claims that outrun the current runtime

Diagnostics should stay boring, inspectable, and trustworthy.
