# QuoteBroker Model (PX-API1 / PX-API2 / PX-API3)

## Purpose
QuoteBroker is the single choke point for quote retrieval and quote-related runtime policy in PocketPilot.

Its job is not "live everything."
Its job is fresh enough for product truth while preserving trust, budgets, and calm product behavior.

QuoteBroker must be where users do not notice provider misses.
That means it hides avoidable turbulence through cache reuse, coalescing, last-good preservation, and honest stale labeling.
It does not hide semantic downgrades.

## Current-Phase Posture
This model is for the current PocketPilot posture:
- foreground-only requests
- no background monitoring
- no hidden automation
- no datastore-backed async refresh runtime yet

QuoteBroker may prepare internal state for app-facing consumers.
That does not imply a background quote daemon exists today.

## Responsibilities
QuoteBroker must own:
- cache lookup before network
- request coalescing for identical in-flight reads
- role-aware provider use
- consumption of per-role ranked chains from Provider Router
- cooldown and breaker enforcement
- stale-if-error behavior
- stale-while-revalidate behavior where appropriate
- last-good stamps and preservation
- provider health counters
- structured instrumentation and logging
- certainty and freshness labeling where trust matters

QuoteBroker must not:
- let quote-fetch behavior scatter across unrelated services
- let `app/` or `core/` talk to providers directly
- silently substitute execution truth with reference truth
- spray per-symbol network calls when a bulk path exists

## Quote Classes
QuoteBroker must keep quote intent explicit.

### Execution Quotes
- account-scoped
- execution-venue truth
- highest trust requirement
- never silently replaced with reference truth

### Reference Quotes
- broad market reference
- bulk-friendly
- may be estimated or less fresh than execution feeds

## Runtime Flow
The normal flow is:

`request -> cache check -> in-flight coalescing -> Provider Router chain -> provider call -> normalize -> stamp freshness/certainty -> update last-good -> return structured result`

If a provider is unavailable or cooling down, QuoteBroker must apply failure policy before attempting the next eligible chain member.

## Budgets
Existing guardrail budgets remain authoritative:
- `CALM <= 20 symbols / 5 min`
- `WATCHING_NOW <= 60 symbols / 5 min`

QuoteBroker must enforce these budgets as product truth constraints, not optional optimizations.

Instrumentation must continue to track at least:
- requests
- symbolsRequested
- symbolsFetched
- symbolsBlocked

## Tracked-Set Ingestion Doctrine
QuoteBroker must prefer tracked-set ingestion over "grab everything."

### Tier 0: Always-On Anchors
Small, intentional anchors that help keep product context stable.

Examples:
- app-level benchmark anchors
- explicitly approved market anchors used across surfaces

Rule:
hard-coded asset logic should be limited to intentional anchors only.

### Tier 1: Active Assets
The user's active account-scoped or surface-scoped assets.

Examples:
- held assets
- watch targets
- assets required for the current Snapshot or Dashboard state

Rule:
these assets should drive most foreground quote demand.

### Tier 2: Slow Catalog / Background-Style Expansion
Large-universe catalog refreshes, metadata repair, or broad enrichment sweeps.

Rule:
this is future direction only.
It must not be implemented as current-phase background behavior.

## Asset Registry Doctrine
PocketPilot must prefer an asset registry over ad-hoc symbol folklore.

The registry should be the seam that maps:
- internal asset ID
- display symbol
- provider IDs
- quote-currency support
- decimals / formatting rules
- status
- optional tags

Why this matters:
- provider symbol formats drift
- display symbols are not enough for robust routing
- future bulk and rescue logic need consistent identifiers

## Bulk-First Doctrine
For reference data, bulk-first is the default doctrine.

QuoteBroker should prefer:
- one bulk request for the tracked set
- then a narrow rescue call only for the missing subset if explicitly justified

QuoteBroker should avoid:
- one request per asset by default
- uncontrolled fan-out across providers

Explicit rule:
no per-asset spray unless a missing-subset rescue is explicitly needed.

## Freshness Policy By Data Class
Freshness is not one global number.
It must be defined by data class and product meaning.

### Execution Quotes
- tightest freshness expectation
- misses should prefer last-good execution truth with stale labeling over silent role substitution

### Reference Bulk Quotes
- freshness should support calm foreground product truth
- bulk refresh is preferred over symbol spray

### Macro Metrics
- slower freshness expectations are acceptable
- stale macro context is often better than noisy refetch churn

### Enrichment
- best-effort only
- absence is acceptable

### Asset Metadata
- slow-changing
- can tolerate much longer refresh intervals than quotes

PocketPilot does not need live everything.
It needs data that is fresh enough for product truth.

## Failure Policy
QuoteBroker must apply the following policy explicitly:

### Stale-While-Revalidate
When acceptable for the data class, return usable cached data immediately and refresh in the foreground request path without forcing raw provider turbulence into the UI contract.

### Stale-If-Error
If a refresh attempt fails, preserve and return the last-good value when policy allows, clearly labeled as stale or estimated where trust requires it.

### Cooldown-Active
If a provider is in cooldown or breaker-open state, do not call it.

### Last-Good Preservation
Last-good preservation is a trust feature, not implementation trivia.
It keeps the product calm when providers wobble, while still surfacing that freshness has degraded.

## Certainty And Freshness Labels
Where trust materially affects interpretation, QuoteBroker must emit freshness and certainty metadata that downstream services can preserve.

Examples:
- `estimated: true`
- stale indicator or freshness age
- source role / source provenance
- last-good timestamp

The UI must consume prepared state from services rather than infer trust from raw provider behavior.

## PX-API2 / PX-API3 Code Contract
PX-API2 made QuoteBroker's quote runtime contract explicit in code.
PX-API3 hardens the runtime-policy behavior on top of that contract without adding background runtime complexity.

QuoteBroker now consumes an explicit runtime request context with:
- `role`
- `accountId`
- `symbols`
- optional budget and quote-currency hints

QuoteBroker now returns structured quote metadata that makes trust inspectable:
- `role`
- `providerId`
- `freshness`
- `certainty`
- `lastUpdatedAt`
- `lastGoodAt`
- `usedLastGood`
- requested/returned/missing symbol sets
- providers tried
- source-by-symbol provenance
- explicit failure-policy state
- `coalescedRequest`
- per-symbol policy state
- provider health summary
- cooldown-skipped providers

Current implemented semantics in PX-API2 / PX-API3:
- in-process last-good preservation
- stale-if-error signaling
- minimal cooldown-active skip behavior
- budget enforcement through the explicit request context
- deterministic in-flight coalescing for contract-identical requests only
- per-symbol runtime state for fresh, stale, last-good, and unavailable outcomes
- seam-friendly provider health output for downstream services and debug inspection

### PX-API3 Runtime Hardening
PX-API3 adds the next thin runtime-policy layer without turning QuoteBroker into a hidden runtime engine.

What is now implemented:
- identical in-flight requests coalesce onto one underlying fetch path
- the coalescing key is contract-aware and includes the request fields that change meaning
- execution and reference requests do not coalesce together
- requests with different account scope, quote currency, budget context, time input, or cached fallback inputs do not coalesce together
- mixed multi-symbol results preserve symbol-level degradation instead of flattening everything into one opaque result mood
- cooldown skips, coalescing, and provider health counters are explicit in result metadata

What PX-API3 still does not imply:
- no background polling
- no datastore-backed cache
- no hidden stale-while-revalidate worker
- no semantic substitution across roles
- no fake async runtime layer beyond the foreground request path

Current non-goals remain honest in code:
- no datastore-backed cache/runtime
- no background polling
- no hidden refresh worker
- no real stale-while-revalidate runtime yet

The current stale-while-revalidate field exists to keep the contract explicit.
In PX-API2 it reports `NOT_IMPLEMENTED_FOREGROUND_ONLY` rather than pretending background machinery already exists.

## Provider Health And Instrumentation
QuoteBroker must maintain structured counters and logs for:
- provider requests
- provider failures
- cooldown activations
- chain fallthroughs
- cache hits
- stale returns
- missing-subset rescues

Logging belongs at the seam where routing and quote policy decisions are visible.
That is how future runtime work stays inspectable without leaking provider mood swings into product surfaces.

## What QuoteBroker Is Protecting
QuoteBroker protects three things at once:
- product trust
- budget discipline
- semantic correctness

If those conflict, semantic correctness wins first, then trust-preserving fallback, then aggressiveness.

## Future-Phase Direction
Future phases may add:
- datastore-backed prepared quote state
- async replenishment jobs
- broader catalog ingestion
- richer provider scoring and health windows

Those are future-phase extensions only.
PX-API1 does not authorize background polling, hidden refresh workers, or backend runtime infrastructure.
