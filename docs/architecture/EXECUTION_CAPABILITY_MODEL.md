# Execution Capability Model (P5-X)

## Purpose

P5-13 introduces one canonical execution-capability seam in `services/trade/`.

Its job is narrow:

- resolve execution-path truth once from deterministic account capability input
- carry that truth forward into confirmation shell, execution preview, readiness, and submission intent
- remove local path re-derivation that could drift before future adapter work begins

It does not dispatch orders, call brokers, persist state, or move capability logic into `app/`.

## Canonical Contract

`ExecutionCapabilityResolution` is:

```ts
type ExecutionCapabilityResolution = {
  accountId: string;
  path: 'BRACKET' | 'OCO' | 'SEPARATE_ORDERS' | 'UNAVAILABLE';
  confirmationPath: 'BRACKET' | 'OCO' | 'GUIDED_SEQUENCE' | 'UNAVAILABLE';
  supported: boolean;
  unavailableReason: string | null;
};
```

Internal execution truth lives in `path`.

Confirmation-facing wording lives in `confirmationPath`.

That means:

- `BRACKET` stays `BRACKET`
- `OCO` stays `OCO`
- `SEPARATE_ORDERS` maps to confirmation-facing `GUIDED_SEQUENCE`
- `UNAVAILABLE` remains explicit and unsupported

## Ownership

`resolveExecutionCapability(...)` owns only capability resolution.

It does:

- consume deterministic platform/account capability flags
- choose one canonical execution path
- mark support explicitly
- return an unavailable reason when unsupported

It does not:

- own readiness
- own confirmation narration
- shape submission intent
- simulate adapter responses
- dispatch anything

## Downstream Consumption Rules

After P5-X:

- confirmation shell consumes canonical capability and derives presentation labels from it
- execution preview consumes canonical capability and shapes adapter scaffold plus payload preview from it
- readiness consumes canonical capability for supported versus unavailable path truth
- submission intent consumes upstream canonical capability truth instead of inferring adapter type from payload shape
- future execution adapters must consume downstream contracts built from canonical capability truth, not re-derive capability locally
- cross-seam invariant tests must fail if any adjacent seam disagrees with canonical capability truth

## Relationship To Neighboring Seams

Capability resolution, readiness, submission intent, and adapter response are different seams:

- capability resolution answers "what path is canonically supported?"
- readiness answers "is this selected session eligible to cross the submission boundary?"
- submission intent answers "what explicit blocked-or-ready pre-adapter contract exists right now?"
- execution adapter response answers "what deterministic simulated adapter result follows from ready submission intent?"

## Non-Dispatch Guarantee

P5-X keeps PocketPilot fully non-dispatching.

- `dispatchEnabled` remains `false`
- previews remain placeholders only
- submission intent remains placeholder-only
- no broker calls or persistence are introduced

## Boundary Hardening

P5-X adds an explicit contract matrix for the non-dispatching execution boundary.

That matrix proves:

- unavailable capability cannot become ready downstream
- blocked readiness cannot become simulated adapter output
- ready submission intent can only become a simulated adapter response
- `SEPARATE_ORDERS` may render as confirmation-facing `GUIDED_SEQUENCE`, but downstream internal path truth must stay canonical
- payload shape does not outrank canonical capability truth

See [EXECUTION_BOUNDARY_INVARIANTS.md](/D:/PocketPilot_Code/PocketPilot/docs/architecture/EXECUTION_BOUNDARY_INVARIANTS.md) for the full invariant list.
