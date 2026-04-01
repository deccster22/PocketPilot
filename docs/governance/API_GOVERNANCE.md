# API Governance (PX-API1)

## Purpose
This document defines the non-negotiable runtime governance rules for external data behavior in PocketPilot.

It exists to stop silent drift before live-data complexity grows further.

This is doctrine for:
- Provider Router
- QuoteBroker
- provider-layer boundaries
- runtime failure handling
- foreground-only posture

This phase does not authorize order dispatch, background polling, or backend runtime infrastructure.

## Non-Negotiable Runtime Boundaries
### All External Calls Go Through `providers/`
All network or device-facing provider integrations must flow through `providers/`.

No exceptions for convenience.

### No Direct `app/` -> Provider Calls
`app/` consumes prepared service outputs and prepared internal state seams.
PocketPilot should read prepared internal state/seams, not raw provider mood swings.

### No Direct `core/` -> Provider Calls
`core/` stays deterministic and pure.
It must not call providers, read network state, or own fallback logic.

### Runtime Chokepoints Are Mandatory
Provider Router and QuoteBroker are the runtime chokepoints.

- Provider Router owns role-aware provider chain selection.
- QuoteBroker owns quote retrieval policy and runtime protection for quote reads.

Quote behavior must not bypass those seams.

## Role Separation Is Mandatory
PocketPilot must keep these source roles distinct:
- execution
- reference
- macro
- enrichment

These roles are not interchangeable.

Execution truth must never silently degrade into reference truth.
Reference data must never be presented as execution-equivalent truth by accident.
Macro data must not masquerade as quote truth.
Enrichment is informational only.

## Execution Account Feed Explicitness
Execution-bound decisions must use the selected execution account's feed or an explicitly execution-eligible equivalent defined by Provider Router doctrine.

This applies to:
- strategy alignment
- execution-aware prompts
- risk or protection calculations
- trade support flows

PocketPilot is execution-aware because trust matters more than synthetic purity.

## Quote Retrieval Governance
### QuoteBroker Is Mandatory
All quote retrieval must flow through QuoteBroker.

QuoteBroker owns:
- cache-first lookup
- request coalescing
- provider ranking consumption
- cooldown and breaker enforcement
- stale behavior
- last-good preservation
- trust metadata emission
- instrumentation

### Bulk-First Over Per-Symbol Spray
For reference data, bulk-first is the default rule.

Do:
- fetch the tracked set in bulk when possible
- perform a narrow missing-subset rescue only when justified

Do not:
- default to one request per symbol
- fan out aggressively for live-everything behavior

### Tracked-Set Ingestion Over Whole-Universe Pulls
PocketPilot should ingest the assets it actively needs, not the whole market universe.

Current doctrine:
- Tier 0 intentional anchors
- Tier 1 active assets
- Tier 2 broad catalog or background-style expansion as future-phase only

### Asset Registry Over Hard-Coded Asset Logic
Asset identity and provider mapping should live in a registry seam rather than scattered symbol-specific conditionals.

Hard-coded asset logic is acceptable only for intentional anchors.

## Failure Policy
The following runtime failure policy is mandatory.

### Stale-While-Revalidate
Where appropriate for the data class, use still-acceptable cached data while refreshing in the foreground request path.

### Stale-If-Error
If refresh fails, return last-good data when policy allows instead of forcing avoidable hard failure into the product surface.

### Cooldown-Active = Do Not Call
If a provider is cooling down or breaker-open, do not call it.

### Last-Good Preservation
Last-good preservation is required where it protects product trust without violating semantics.

### No Semantic Substitution Across Roles
Failure handling may degrade freshness, not meaning.

Explicit rule:
fallback is not permission to change the meaning of the data.

PocketPilot may return stale execution truth.
It must not silently return reference truth and pretend the problem is solved.

## Freshness And Certainty Governance
User-facing freshness or certainty labeling is required where trust materially affects interpretation.

Examples include:
- `estimated: true`
- stale or aged data indication
- source provenance where relevant

Last-good and stale labeling are product trust features, not internal trivia.

## Foreground-Only Current-Phase Posture
PX-API1 preserves the current foreground-only phase rules.

That means:
- no background monitoring
- no background polling
- no push-trigger behavior
- no hidden automation
- no wording that implies a background datastore/runtime job already exists

The app may consume prepared service-owned state seams in the foreground.
That is not the same as declaring an always-on runtime.

## Observability Expectations
Runtime observability must exist at the Provider Router and QuoteBroker seams.

At minimum, future implementation should track:
- counters
- provider health
- request/source logging at the appropriate seam

Observability belongs where routing and failure policy decisions happen, not inside `app/` presentation code.

## Current Doctrine Vs Future Direction
### Must Be True Now
- all external calls go through `providers/`
- no direct `app/` -> provider calls
- no direct `core/` -> provider calls
- Provider Router and QuoteBroker remain chokepoints
- role separation is mandatory
- execution account feed explicitness is mandatory
- tracked-set ingestion beats whole-universe pulling
- bulk-first beats per-symbol spray
- foreground-only posture remains in force

### Future-Phase Direction Only
Future docs may define:
- datastore-backed prepared runtime state
- async enrichment
- background catalog maintenance
- more advanced provider health scoring

Those directions are future-phase only.
They are not implemented, implied, or authorized by PX-API1.

## Open Questions For Future Phases
These are intentionally not settled by PX-API1:
- whether future datastore-backed prepared state lives in-device, server-side, or both
- how provider health scoring matures beyond counters, cooldowns, and breaker state
- which catalog or metadata maintenance work merits async handling later
- whether enrichment ever earns a separate async preparation seam

Future docs may answer those questions.
Current implementation must not pretend those answers already exist.

## What This Phase Deliberately Does Not Do
- no broker API integration
- no order submission
- no new live API wiring
- no background jobs
- no push notification machinery
- no datastore or backend runtime

## Implementation Reference
Future runtime work should consume:
- `docs/architecture/PROVIDER_ROUTER_MODEL.md`
- `docs/architecture/QUOTE_BROKER.md`
- this governance document

Those docs are intended to constrain implementation, not merely describe preferences.
