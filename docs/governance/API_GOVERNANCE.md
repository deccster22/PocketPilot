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

PX-API2 through PX-API5 harden this into code contracts:
- quote-like requests carry an explicit role-tagged runtime context
- quote-like results carry explicit trust metadata
- failure policy state is surfaced in result metadata instead of being hidden behavior
- in-flight coalescing is contract-aware and confined to the provider/service layer
- `services/debug/` shapes those explicit runtime facts into one prepared diagnostics VM instead of letting `app/` reverse-engineer them

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

PX-API2 / PX-API3 / PX-API4 code-level trust metadata now includes:
- `role`
- `providerId`
- `freshness`
- `certainty`
- `lastUpdatedAt`
- `lastGoodAt`
- `usedLastGood`
- `coalescedRequest`
- per-symbol policy state
- provider health summary with recent window/state/score
- cooldown-skipped providers

Those fields are now part of the runtime contract, not just doctrine.

PX-API5 adds a prepared runtime diagnostics seam on top of those fields:
- one canonical service-owned diagnostics VM in `services/debug/`
- provider health, quote policy, and per-symbol degradation facts shaped for inspection and tests
- no app-side runtime inference
- no fake expansion into a telemetry platform

Current honest limitation:
- `staleWhileRevalidate` is surfaced as an explicit contract field
- current implementation remains foreground-only and reports that the behavior is not yet implemented as a hidden runtime system

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

At minimum, runtime implementation should track:
- counters
- provider health
- request/source logging at the appropriate seam

Current PX-API3 / PX-API4 implementation now exposes a thin, explicit subset of that at the quote seam:
- cumulative broker counters
- cooldown-skipped providers
- coalesced-request signaling
- per-symbol runtime policy state
- bounded recent provider-health windows
- explicit `UNKNOWN` / `HEALTHY` / `DEGRADED` / `COOLDOWN_ACTIVE` provider-health states
- a simple recent-attempt success-rate score when there is enough recent data

Current PX-API5 implementation adds one prepared service seam over that explicit metadata:
- `RuntimeDiagnosticsVM` in `services/debug/`
- provider health entries prepared from explicit health summaries
- quote policy summary prepared from explicit freshness/certainty/last-good/coalescing/cooldown metadata
- per-symbol degradation entries prepared from explicit symbol policy state plus current quote source/timestamp data when available
- sparse factual notes for current foreground-only limitations

Current PX-API4 provider-health doctrine:
- health windows are bounded recent summaries, not permanent provider reputation
- the window is count-based and foreground-only
- cooldown skips affect recent health state but are not labeled as request failures
- health state may inform routing/policy visibility only within the current role-safe doctrine
- health state does not authorize semantic substitution across roles

Observability belongs where routing and failure policy decisions happen, not inside `app/` presentation code.
If `app/` renders diagnostics on a debug path, it must render the prepared diagnostics VM from `services/debug/`.

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
- execution requests cannot silently degrade into reference truth because the router contract is role-safe by code, not only by convention

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
- how provider health scoring matures beyond simple recent windows, cooldown visibility, and current attempt success rate
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
- `docs/architecture/RUNTIME_DIAGNOSTICS_MODEL.md`
- this governance document
- `docs/phases/PX-API2.md`
- `docs/phases/PX-API3.md`
- `docs/phases/PX-API4.md`
- `docs/phases/PX-API5.md`

Those docs are intended to constrain implementation, not merely describe preferences.
