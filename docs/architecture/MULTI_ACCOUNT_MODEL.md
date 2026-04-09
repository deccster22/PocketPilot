# Multi-Account Model (PX-MA1)

## Purpose

PX-MA1 adds PocketPilot's first thin multi-account integrity seam.

The goal is not full multi-account product rollout. The goal is to make one selected-account truth explicit, deterministic, and reusable so strategy interpretation stays honest.

PocketPilot rules preserved here:

- selected-account truth is owned by `services/`
- strategy alignment, fit, alerts, risk, and execution support remain account-scoped
- Dashboard remains account-scoped
- no aggregated global strategy alignment
- no aggregated fit signals
- no provider/runtime leakage in user-facing account-context output

## Canonical Contracts

```ts
type AccountSelectionMode =
  | 'EXPLICIT'
  | 'PRIMARY_FALLBACK'
  | 'HIGHEST_VALUE_FALLBACK';

type SelectedAccountContext = {
  accountId: string;
  displayName: string;
  selectionMode: AccountSelectionMode;
  baseCurrency: string | null;
  strategyId: string | null;
};

type SelectedAccountAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_ACCOUNTS_AVAILABLE' | 'NO_VALID_ACCOUNT_CONTEXT';
    }
  | {
      status: 'AVAILABLE';
      account: SelectedAccountContext;
    };
```

Rules:

- keep the contract explicit and sparse
- no broker payload fields
- no execution payload fields
- no holdings dump
- no provider/runtime diagnostics
- no app-owned fallback logic

## Resolution Order

`services/accounts/resolveSelectedAccountContext.ts` is the canonical resolver.

Resolution order:

1. valid explicit selected account
2. one valid nominated primary account
3. deterministic highest-value fallback

Deterministic fallback details:

- invalid ids are discarded
- blank display fields are normalized
- invalid portfolio values normalize to `0`
- highest-value ties are broken by ascending `accountId`
- if no valid account remains, return `UNAVAILABLE` honestly

Multiple primary flags do not create a second resolver path. The system falls back to the same deterministic highest-value rule instead of inventing hidden precedence.

## Canonical Service Path

The current shared path is:

```text
AccountContextCandidate[]
-> resolveSelectedAccountContext
-> fetchSelectedAccountContext
-> fetchSurfaceContext
-> Snapshot / Dashboard / Strategy Fit / 30,000 ft / message policy / trade-support consumers
```

`app/` consumes prepared `SelectedAccountAvailability` only.

## Account-Scoped Enforcement Rules

PX-MA1 makes the scope boundary explicit through `services/accounts/enforceAccountScopedTruth.ts`.

Current enforcement intent:

- strategy alignment must be derived from the selected account's events only
- Strategy Fit and 30,000 ft context must consume pre-scoped events and orientation context only
- Dashboard events and explanation context must stay on the selected account
- alert/message truth must stay on the selected account
- risk and execution-support seams must stay on the selected account

PocketPilot may later add aggregate holdings or exposure views, but that future work must not become aggregate strategy truth.

## First Proof Path

PX-MA1 adds one quiet proof path on Dashboard:

- one passive current-account cue
- visible only when selected-account context is `AVAILABLE`
- informational only, not a management panel

Why Dashboard first:

- Dashboard is already canonically account-scoped
- Snapshot should remain more protected
- one proof path is enough for this phase

## Deliberate Non-Goals

PX-MA1 does not add:

- full account-management UI
- hidden account switching
- all-accounts strategy dashboards
- aggregated fit surfaces
- portfolio analytics rollout
- background syncing or polling
- push notifications
- execution automation or order dispatch
