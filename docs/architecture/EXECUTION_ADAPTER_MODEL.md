# Execution Adapter Model (P5-11)

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

This keeps submission intent as the sacred pre-execution boundary and prevents the adapter seam from peeking backward into confirmation session, confirmation flow, execution preview, or readiness internals.

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
      outcome: 'ACCEPTED' | 'REJECTED';
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

## Future Direction

This boundary is intentionally small so later phases can introduce real adapter implementations behind the same seam.

Capability-unification across adapters remains a later concern. P5-11 does not introduce a plugin framework, command bus, or broker integration layer.
