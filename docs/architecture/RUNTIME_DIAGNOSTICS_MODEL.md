# Runtime Diagnostics Model (PX-API5)

## Purpose
PX-API5 adds a prepared runtime diagnostics seam in `services/debug/`.

Its job is to make current runtime truth inspectable without creating a fake telemetry platform.

This seam is for:
- developer inspection
- deterministic tests
- future debug-oriented service consumers

This seam is not for:
- end-user system-status theatre
- background monitoring
- runtime automation
- provider reputation storytelling

## Ownership
- `providers/` and QuoteBroker still produce runtime truth
- Provider Router still merges role-safe quote/runtime metadata
- `services/debug/` owns diagnostics shaping
- `app/` may render prepared diagnostics only on an existing debug path

PocketPilot must not move runtime interpretation into `app/`.

## Canonical Contract
`RuntimeDiagnosticsVM` is the canonical prepared diagnostics view model.

It exposes:
- `generatedAt`
- `role`
- `providers`
- `quotePolicy`
- `symbols`
- `notes`

### Provider Entries
Provider diagnostics expose current explicit health facts only:
- provider ID
- role
- health state
- numeric score when available
- recent attempts / successes / failures / cooldown skips when available
- last attempt / success / failure timestamps when available

If the current seam does not truly know a count or timestamp, the field stays `null`.

### Quote Policy Summary
Quote policy diagnostics expose:
- `coalescedRequest`
- `providersTried`
- `cooldownSkippedProviders`
- `usedLastGood`
- `freshness`
- `certainty`

These are read from the explicit quote metadata contract, not inferred from nulls or provider quirks.

### Per-Symbol Entries
Per-symbol diagnostics expose:
- symbol
- current per-symbol provider/source attribution when available
- explicit symbol policy state
- last-updated timestamp when the current quote carries one
- last-good timestamp when the current quote is explicitly last-good

Current seams do not expose a richer dedicated per-symbol provider-health contract.
PX-API5 keeps that limitation explicit instead of inventing one.

## Inputs
The diagnostics builder consumes existing explicit runtime seams:
- QuoteBroker / Provider Router `QuoteResponse['meta']`
- returned quotes when present
- explicit provider-health summaries when a call path has them without a full quote result

PX-API5 does not add new broker runtime machinery.

## Honest Notes
`notes` are intentionally sparse.

They may call out:
- current foreground-only posture
- `staleWhileRevalidate` still being `NOT_IMPLEMENTED_FOREGROUND_ONLY`
- provider health remaining `UNKNOWN` when the recent window is too thin
- missing quote-policy sections for a given call path

They must not:
- claim the system is broadly healthy
- imply background runtime exists
- imply execution truth was safely substituted with reference truth

## Current-Phase Limits
PX-API5 remains intentionally thin:
- foreground-only
- no background polling
- no push notifications
- no runtime datastore/backend
- no raw signal leakage
- no adaptive reranking
- no long-memory provider reputation

## Existing Consumer
The existing development-only Snapshot Debug Observatory may render the prepared runtime diagnostics VM.

That keeps the app thin:
- the debug panel renders the prepared VM
- it does not assemble diagnostics from scattered runtime fields

## Future-Phase Direction
Future phases may reuse `fetchRuntimeDiagnosticsVM` and `RuntimeDiagnosticsVM` for:
- richer debug tooling
- service-owned support seams
- deterministic regression tests

Any future expansion must keep the current rule intact:
diagnostics may summarize runtime truth, but they must not outrun runtime maturity.
