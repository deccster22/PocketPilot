# PX-API3 - Runtime Policy Hardening

## Purpose
PX-API3 hardens the thin runtime-policy layer on top of the PX-API2 contracts.

This phase exists to make the current foreground quote path:
- less wasteful through deterministic in-flight coalescing
- more explicit about per-symbol degradation and last-good reuse
- easier for service seams to inspect without app-side inference

## Why This Phase Happened Now
PX-API2 locked the request/result doctrine, but the runtime path still had practical gaps:
- identical in-flight requests could still fan out into duplicate fetches
- mixed multi-symbol results could degrade without enough symbol-level clarity
- provider cooldown and policy outputs were still too easy to infer indirectly
- downstream services had the trust metadata, but not enough prepared policy state

PX-API3 happens now so future runtime phases can build on explicit, tested policy behavior instead of widening the live-data surface area.

## What Runtime Policy Behaviors Were Added
- deterministic in-flight request coalescing for contract-identical quote requests
- contract-aware coalescing boundaries across role, account, quote currency, budget context, time input, symbol set, and cached fallback input
- explicit `coalescedRequest` metadata on the quote response seam
- explicit per-symbol policy state for `FRESH`, `STALE`, `LAST_GOOD`, and `UNAVAILABLE`
- stronger mixed-result handling so one degraded symbol does not mask the others
- explicit cooldown-skipped provider output
- thin provider health summaries derived from the existing broker counters
- propagation of the richer runtime metadata through Provider Router, quote services, scan output, and debug observatory seams

## What Runtime Complexity Was Deliberately Not Added
- no new broker or provider integrations
- no background polling
- no push notifications
- no datastore-backed runtime or cache platform
- no hidden stale-while-revalidate worker
- no fake async runtime engine
- no execution dispatch
- no semantic substitution of execution truth into reference truth

PX-API3 stays foreground-only.
It makes the existing runtime path clearer and safer.

## Current Honest Runtime Posture
Implemented now:
- in-flight dedupe only while the request is actively pending
- per-symbol degradation reporting where the current broker can truly know it
- broker-level provider health summaries from existing counters
- explicit cooldown skip reporting

Still intentionally limited:
- no long-lived cache beyond current in-process last-good reuse
- no background refresh loop
- no datastore-backed prepared runtime
- no broader observability platform beyond the thin seam-friendly summary fields
- no richer policy states that would imply machinery the app does not actually have

## What Future Runtime Phases Should Build On
Future phases should extend these seams rather than replacing them:
- QuoteBroker remains the single quote-policy choke point
- Provider Router remains the role-safe routing seam
- quote responses continue to carry explicit trust and runtime-policy metadata
- per-symbol degradation can become richer only when the underlying runtime truly supports it
- any future async/runtime layer should fill the existing explicit fields before inventing parallel contracts

If future work adds datastore-backed prepared state or richer provider health scoring, it should build on the PX-API3 metadata rather than bypassing it.
