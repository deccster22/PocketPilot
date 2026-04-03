# PX-API4 - Thin Provider Health Windows / Scoring

## Purpose
PX-API4 adds a thin recent-window provider-health layer on top of the PX-API2 and PX-API3 runtime seams.

This phase exists to make current foreground quote/runtime behavior:
- more coherent about recent provider success, failure, and cooldown patterns
- easier for QuoteBroker, Provider Router, and debug/service seams to inspect directly
- still explicit, deterministic, and role-safe

## Why This Phase Happened Now
PX-API2 locked the role-tagged quote contract.
PX-API3 hardened coalescing, symbol-level degradation, and explicit policy metadata.

What was still missing:
- recent provider-health context was mostly ad hoc counters
- downstream seams could see cooldown skips, but not a bounded recent health read
- router and broker policy inspection still required too much interpretation of raw counters

PX-API4 happens now so future runtime work can build on explicit recent health seams without pretending PocketPilot already has a larger runtime or observability platform.

## What Recent-Window / Scoring Behavior Was Added
- a bounded in-process recent health window per provider and request role
- count-based recent health tracking over the most recent 6 health events
- tracked event kinds:
  - attempt success
  - attempt failure
  - cooldown skip
- explicit recent window fields:
  - recent attempts
  - recent successes
  - recent failures
  - recent cooldown skips
  - last attempt / success / failure timestamps
- explicit health states:
  - `UNKNOWN`
  - `HEALTHY`
  - `DEGRADED`
  - `COOLDOWN_ACTIVE`
- a simple numeric score when data is thick enough:
  - recent success-rate percentage over recent attempts only
  - `null` when recent attempt data is too thin
- propagation of the recent health summary through QuoteBroker, Provider Router, quotes-service, and debug-observatory seams

## How Health State Is Used
- health state is inspectable in runtime metadata
- cooldown-active state remains visible separately from request-failure state
- same-role routing metadata can surface recent degradation or cooldown context
- current implementation keeps active cooldown skip behavior explicit in policy metadata

## How Health State Is Not Used
- no cross-role fallback
- no silent execution-truth to reference-truth substitution
- no background retries
- no adaptive AI routing system
- no long-memory provider reputation ledger
- no datastore-backed runtime or observability backend
- no app-side provider-health inference

## What Runtime Complexity Was Deliberately Not Added
- no new broker or provider integrations
- no provider sprawl
- no background polling
- no push notifications
- no hidden stale-while-revalidate worker
- no datastore/runtime backend
- no full observability platform
- no order dispatch

PX-API4 remains foreground-only.

## Current Honest Runtime Posture
Implemented now:
- recent health windows are count-based, bounded, and in-memory only
- recent cooldown skips influence health state without being mislabeled as failures
- `UNKNOWN` is preferred over fake certainty when recent attempt data is too thin
- QuoteBroker and Provider Router preserve recent health context in explicit metadata

Still intentionally limited:
- no persistence across app restarts
- no background health accumulation
- no adaptive chain re-ranking
- no weighted or black-box provider score
- no health-based semantic substitution across roles

## What Future Runtime Phases Should Build On
Future runtime phases should build on these seams rather than replacing them:
- QuoteBroker remains the single quote-policy choke point
- Provider Router remains the role-safe routing seam
- recent health counts, state, and score should stay explicit and inspectable
- richer weighting, longer windows, or datastore-backed health history should arrive only when the runtime genuinely supports them
- any future health-aware routing logic must preserve current role-safe semantics and honest metadata
