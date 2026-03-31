# Execution Boundary Invariants (P5-X)

## Purpose

P5-X hardens the non-dispatching execution boundary so adjacent seams cannot quietly drift apart.

The boundary remains:

`ExecutionCapabilityResolution -> ConfirmationSession / TradePlanConfirmationShell -> ExecutionPreviewVM -> ExecutionReadiness -> SubmissionIntentResult -> ExecutionAdapterAttemptResult`

This phase does not add broker APIs, dispatch, persistence, or hidden automation.

## Required Cross-Seam Invariants

- If canonical capability is `UNAVAILABLE`, readiness must stay `eligible=false`, submission intent must stay `BLOCKED`, and adapter response must never become `SIMULATED`.
- If readiness is blocked, submission intent must stay `BLOCKED` and the adapter seam must pass that blocked result through unchanged.
- If submission intent is `READY`, the adapter seam may only return `SIMULATED`, with `dispatchEnabled=false` and `placeholderOnly=true`.
- Canonical capability truth must stay aligned across shell, preview, readiness, submission intent, and adapter response:
  - `BRACKET` stays `BRACKET`
  - `OCO` stays `OCO`
  - `SEPARATE_ORDERS` may appear as confirmation-facing `GUIDED_SEQUENCE`, but downstream internal path truth must remain `SEPARATE_ORDERS`
- Identical inputs must produce identical outputs across the full chain.
- No seam may infer adapter type from payload shape when canonical capability truth is already available upstream.
- No execution-boundary output may expose raw signal internals or hidden strategy payloads.

## Why These Invariants Exist

- They keep unsupported paths from reading like temporary execution failures.
- They keep blocked states from mutating into fake post-intent outcomes.
- They protect the final pre-execution boundary so future adapter work cannot silently bypass readiness or capability truth.
- They keep PocketPilot calm and explicit: prepared, blocked, simulated, or unavailable are different states and must not blur together.

## Seam Responsibilities

- Capability resolution answers: what path is canonically supported?
- Readiness answers: is the prepared session eligible to cross the submission boundary?
- Submission intent answers: what explicit blocked-or-ready placeholder contract exists right now?
- Simulated adapter response answers: what deterministic simulated post-intent record follows from that contract?

These seams must stay adjacent, explicit, and non-overlapping.
