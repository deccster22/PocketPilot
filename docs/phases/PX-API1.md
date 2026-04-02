# PX-API1 - Provider Router / QuoteBroker / API Governance Doctrine

## Purpose
PX-API1 locks PocketPilot's runtime data-plane doctrine before live-data and provider complexity grow further.

`PX-*` labels are cross-cutting platform and hardening phases. They may land alongside numbered product families and do not imply completion of `P3` through `P11`. See `PHASE_MAP.md`.

This phase exists so future implementation work has hard architectural rules for:
- Provider Router
- QuoteBroker
- API governance
- foreground-only runtime posture

## Why This Phase Happened Now
PocketPilot already had the constitutional shape for provider routing, execution-aware truth, quote budgets, and provider-layer boundaries.

What was still too loose was the runtime doctrine between those rules and future implementation.

PX-API1 happens now to prevent:
- semantic drift between execution and reference data
- ad-hoc fallback logic spreading across services
- per-symbol spray replacing calm tracked-set behavior
- background-runtime assumptions creeping in before they are actually built

## Docs Added Or Recast In This Phase
- `docs/architecture/PROVIDER_ROUTER_MODEL.md`
- `docs/architecture/QUOTE_BROKER.md`
- `docs/governance/API_GOVERNANCE.md`

Related indexing and docs-map references were also updated so these seams are easy to find.

## What PX-API1 Locks
- source-role separation: execution, reference, macro, enrichment
- Provider Router as the role-aware routing seam
- QuoteBroker as the single choke point for quote retrieval and quote-related runtime policy
- execution truth must not silently degrade into reference truth
- tracked-set ingestion over whole-universe pulling
- asset registry doctrine over scattered hard-coded asset logic
- bulk-first reference data retrieval
- freshness policy by data class
- failure policy: stale-while-revalidate, stale-if-error, cooldown-active, last-good preservation
- current foreground-only posture

## What This Phase Deliberately Did Not Implement
- no broker API integrations
- no order dispatch
- no new live runtime wiring
- no background polling
- no push notifications
- no datastore or backend runtime
- no Snapshot, Dashboard, or Trade Hub redesign

This is a doctrine phase, not a live integration phase.

## What Future Work Should Consume
Any future runtime or provider task touching quote retrieval, freshness, fallback, routing, provider health, or asset identity should treat the new Provider Router, QuoteBroker, and API Governance docs as binding constraints.

Future implementation should extend these seams, not invent parallel ones.
