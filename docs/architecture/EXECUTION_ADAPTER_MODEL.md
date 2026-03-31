# Execution Adapter Model (P5-X)

## Purpose

P5-11 adds the first true execution-adapter seam after submission intent.

Its purpose is narrow:

`Plan -> Confirm -> Ready -> Mock adapter response`

It does not dispatch orders, call brokers, persist state, or build live execution payloads.

## Boundary

The execution-adapter seam consumes only `SubmissionIntentResult`.

- `BLOCKED` submission intent returns a `BLOCKED` adapter-attempt result unchanged
- `READY` submission intent is narrowed to `ReadySubmissionIntent`
- only `ReadySubmissionIntent` may enter the simulated adapter builder

This keeps submission intent as the sacred pre-execution boundary and prevents the adapter seam from peeking backward into confirmation session, execution capability resolution, confirmation flow, execution preview, or readiness internals.

## Contracts

`ReadySubmissionIntent` is:

```ts
type ReadySubmissionIntent = Extract<SubmissionIntentResult, { status: 'READY' }>;
```

`ExecutionAdapterAttemptResult` is:

```ts
type ExecutionAdapterAttemptResult =
  | {
      status: 'BLOCKED';
      blockers: ReadonlyArray<ReadinessBlocker>;
      warnings: ReadonlyArray<ReadinessWarning>;
    }
  | {
      status: 'SIMULATED';
      dispatchEnabled: false;
      placeholderOnly: true;
      adapterType: SubmissionIntentAdapterType;
      outcome: 'SIMULATED_ACCEPTABLE' | 'SIMULATED_UNAVAILABLE';
      simulatedOrderIds: ReadonlyArray<string>;
      executionSummary: {
        planId: string;
        accountId: string;
        symbol: string | null;
        orderCount: number;
        path: SubmissionIntentAdapterType;
      };
      warnings: ReadonlyArray<ReadinessWarning>;
    };
```

## Determinism Rules

The seam is deterministic by construction:

- no network access
- no broker SDKs
- no randomness
- no ambient time
- no persistence
- no hidden automation

For identical ready submission-intent input, the adapter response must be identical.

Simulated order identifiers are deterministic and derived from the plan identity:

- `mock-${planId}-1`
- `mock-${planId}-2`
- `mock-${planId}-3`

## Non-Dispatch Guarantee

P5-11 is explicitly simulated only.

- `dispatchEnabled` is always `false`
- `placeholderOnly` is always `true`
- outcome shaping is deterministic and local
- no order submission exists in this phase

The adapter seam is execution-aware structure, not live execution.

## Relationship To Submission Intent

Submission intent and adapter response serve different purposes:

- `SubmissionIntentResult` says whether PocketPilot has reached a safe, explicit pre-adapter state
- `ExecutionAdapterAttemptResult` says what the currently selected simulated adapter path would return without dispatch

The execution-adapter seam trusts submission intent. It does not second-guess it.

After P5-13, that also means the adapter seam does not re-derive capability or path support locally. Canonical capability truth is resolved upstream in `services/trade/resolveExecutionCapability.ts`, then carried into submission intent through prepared downstream contracts.

P5-X hardens that promise with contract tests that require:

- blocked submission intent to pass through unchanged
- ready submission intent to produce simulated output only
- `dispatchEnabled=false` and `placeholderOnly=true` on every simulated response
- adapter type and path summary to stay aligned with upstream canonical capability truth rather than payload-shape guesswork

## Calm State Language

User-facing wording for this seam must stay explicit and non-pushy:

- say "simulated adapter response" instead of live-execution phrasing
- say "blocked" or "unavailable" when prerequisites or path support are missing
- do not present `SIMULATED_ACCEPTABLE` as a live order outcome
- do not imply that dispatch, routing, or broker submission occurred

## Future Direction

This boundary is intentionally small so later phases can introduce real adapter implementations behind the same seam.

P5-13 unifies capability truth before adapters, and P5-X makes regressions across that boundary loud, but neither phase introduces a plugin framework, command bus, broker integration layer, or live dispatch path.
