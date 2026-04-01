# Provider Router Model (PX-API1)

## Purpose
Provider Router is the role-aware routing seam inside `services/` that chooses which provider chain is eligible for a given runtime task.

It exists to keep provider choice:
- explicit
- deterministic
- role-safe
- inspectable

Provider Router is allowed to decide which provider chain to try.
Provider Router is not allowed to change what the data means.

## Current-Phase Posture
This doctrine is written for PocketPilot's current runtime posture:
- foreground-only
- no background monitoring
- no hidden automation
- no push-triggered runtime behavior

The router must support foreground requests cleanly today without implying a background runtime already exists.

## Source-Role Taxonomy
Every provider route must belong to one source role.

### Execution
Used for execution-bound truth.

Examples:
- execution-account quotes
- execution venue bid/ask or last-trade reads
- execution capability checks tied to a selected account

Rules:
- bound to the selected execution account or venue
- authoritative for execution-aware product truth
- must never silently degrade into reference truth

### Reference
Used for broad market reference data.

Examples:
- market-wide spot reference quotes
- non-execution portfolio context prices
- broad catalog quote snapshots

Rules:
- useful for context and broad coverage
- may be estimated or delayed
- never a silent substitute for execution truth

### Macro
Used for market context rather than tradeable venue truth.

Examples:
- volatility metrics
- macro comparison series
- regime context inputs

Rules:
- contextual only
- freshness expectations differ from quote reads
- not a fallback source for execution or reference quotes

### Enrichment
Used for optional informational additions.

Examples:
- news or narrative enrichment
- Fear and Greed style indicators
- descriptive metadata that improves explanation

Rules:
- non-blocking
- informational only
- never required to preserve core product truth

## One Ranked Chain Per Task
Provider Router must define one ranked provider chain per task, not one universal fallback parade.

That means:
- execution quote requests use an execution-ranked chain
- reference quote requests use a reference-ranked chain
- macro requests use a macro-ranked chain
- enrichment requests use an enrichment-ranked chain

A chain may degrade freshness, latency, or confidence.
It must not silently change the meaning of the data.

Explicit rule:
fallback is not permission to change the meaning of the data.

A fallback chain may degrade freshness or confidence.
It must not silently change execution truth into reference truth.

## Provider Router Responsibilities
Provider Router must:
- select providers by role and task
- expose explicit ranking order
- respect cooldown or breaker state supplied by runtime health tracking
- allow only role-safe fallback within the same semantic lane
- return structured routing metadata for instrumentation and debugging

Provider Router must not:
- perform semantic substitution across roles
- bypass QuoteBroker for quote reads
- hide execution-source loss by returning reference truth as if it were execution truth
- leak provider-specific decision logic into `app/`
- introduce background polling or autonomous refresh behavior

## Role-Safe Fallback Rules
Fallback is valid only when the fallback result preserves the same semantic contract.

Allowed examples:
- execution quote -> another execution-eligible source for the same account/venue contract
- reference quote -> another reference provider
- macro metric -> another macro provider for the same metric family
- enrichment fetch -> skip enrichment and return nothing

Disallowed examples:
- execution quote -> reference quote presented as equivalent truth
- macro metric -> enrichment proxy presented as macro truth
- enrichment miss -> block Snapshot or Dashboard core state

## Task Examples
### Execution Quote
Task: "Get the selected execution account quote for BTC."

Allowed chain:
`execution provider A -> execution provider B -> cached last-good execution quote`

Not allowed:
`execution provider A -> reference provider -> silent success`

If the router exhausts the execution chain, the miss must remain explicit so QuoteBroker can apply stale labeling or failure policy honestly.

### Reference Quote
Task: "Get calm market reference quotes for the tracked set."

Allowed chain:
`reference bulk provider A -> reference bulk provider B -> cached last-good reference quotes`

### Macro Metric
Task: "Get volatility regime context."

Allowed chain:
`macro provider A -> cached last-good macro metric`

Macro data may become stale.
It does not become quote truth.

### Enrichment Fetch
Task: "Fetch explanatory enrichment for a surfaced asset."

Allowed chain:
`enrichment provider A -> enrichment provider B -> no enrichment`

Enrichment failure must never block core surfaces.

## Interaction With QuoteBroker
QuoteBroker remains the single choke point for quote retrieval and quote-related runtime policy.

Provider Router supplies:
- eligible provider chains
- ranking order
- role/task semantics
- cooldown-aware routing decisions

QuoteBroker owns:
- cache lookup before network
- request coalescing
- stale behavior
- last-good preservation
- budgets
- provider health counters
- quote trust labeling

## Determinism And Boundary Rules
- `core/` must not know provider routing exists.
- `app/` must not choose providers.
- `providers/` expose adapters; they do not self-author global fallback doctrine.
- `services/` owns routing orchestration and must keep it explicit.

## Future-Phase Direction
Future phases may expand router sophistication with:
- richer provider health scoring
- narrower task classes
- account/venue capability matrices
- async-prepared state inputs from a datastore-backed runtime

Those are future-phase possibilities only.
PX-API1 does not declare that background jobs, async enrichment workers, or a datastore runtime already exist.
