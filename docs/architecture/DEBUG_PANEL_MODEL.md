# Debug Observatory Panel Model (P2C-3)

## Purpose
The Debug Observatory Panel is a development-only surface that exposes a structured view of the foreground scan pipeline. It helps contributors verify provider routing, quote quality, derived deltas, strategy signals, and final snapshot output without changing user-facing behavior.

## Development-Only Role
- Access is gated in `app` using `__DEV__ && Config.ENABLE_DEBUG_PANEL`.
- The panel is hidden in production behavior.
- It is intended for developer inspection, QA checks, and troubleshooting.

## Data Model
The panel is powered by `services/debug/debugObservatoryService.ts` and returns a single structured payload:

- `timestampMs`
- `symbols`
- `quoteResult`: `quotes` and router metadata
- `deltas`: per-symbol percent changes when available
- `strategySignals`: structured strategy outputs when available
- `snapshot`: final snapshot summary used by UI

Router metadata includes:
- `provider`
- `fallbackUsed`
- `requestedSymbols`
- `returnedSymbols`
- `missingSymbols`
- `timestampMs`
- `providersTried` (if available)
- `sourceBySymbol` (if available)

## Relationship To Provider Router
This panel depends on metadata produced by `services/providers/providerRouter.ts` (P2C-2). The debug payload preserves this metadata so we can inspect whether fallback behavior, missing symbol handling, and source attribution are functioning as expected.

## Relationship To Future Telemetry
The Debug Observatory is an in-app structured debug seam, not a telemetry pipeline. It can inform future event-stream/telemetry design by clarifying which internal fields are most useful, but it does not add background logging, data export, or networked analytics in this phase.

## Non-Goals (P2C-3)
- No strategy behavior changes.
- No new provider logic.
- No user-facing dashboard redesign.
- No background tasks.
- No end-user debug noise in production mode.
