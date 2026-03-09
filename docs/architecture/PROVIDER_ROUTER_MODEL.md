# Provider Router Model (P2C-2)

## Purpose
Provider Router v1 centralizes quote retrieval orchestration in one service-layer seam. It removes scattered provider selection logic and ensures quote reads return deterministic, structured metadata for downstream strategy and UI flows.

## Why Routing Is Centralized
- `services/` owns orchestration and integration behavior.
- `providers/` remain focused on adapter behavior (network/provider IO).
- A single router path makes fallback, cache usage, and metadata inspection consistent.
- Future provider expansion can be added without touching scan/strategy call sites.

## Output Shape
Router output is a structured object:

```ts
{
  quotes: Record<string, Quote>,
  meta: {
    provider: string,
    fallbackUsed: boolean,
    requestedSymbols: string[],
    returnedSymbols: string[],
    missingSymbols: string[],
    timestampMs: number,
    providersTried: string[],
    sourceBySymbol: Record<string, string | undefined>
  }
}
```

Notes:
- `quotes` preserves per-quote `estimated` values from providers.
- `missingSymbols` is explicit and ordered by request order.
- metadata is strategy-safe and inspectable.

## Future Extension Points
- Add provider priority ordering with deterministic tie-breaking.
- Add provider health scoring and retry policies in the router only.
- Add telemetry aggregation at router boundaries.
- Add cache policy variants while preserving deterministic inputs/outputs.

## Non-Goals For P2C-2
- No trade execution or order routing.
- No strategy redesign.
- No background jobs.
- No UI philosophy changes.
- No provider-specific behavior leakage into `app/`.
