# Multi-Account Model (PX-MA1 + PX-MA2 + PX-MA3 + PX-MA4)

## Purpose

PX-MA1 adds PocketPilot's first thin multi-account integrity seam.

PX-MA2 builds on that seam with one explicit switching path and one explicit primary-account preference path.

PX-MA3 builds on the same seam with one canonical aggregate holdings / exposure lane that stays explicitly separate from selected-account strategy truth.

PX-MA4 keeps the same selected-account truth path but normalizes how that truth is threaded through prepared surface VMs so Snapshot, Dashboard, Trade Hub, and related support seams all reuse one prepared account-context helper instead of rebuilding local branching.

The goal is still not full multi-account product rollout. The goal is to keep one selected-account truth explicit, deterministic, reusable, intentionally controllable, and now cleanly separable from one small aggregate portfolio context lane without leaking account management into `app/`.

PocketPilot rules preserved here:

- selected-account truth is owned by `services/`
- explicit account switching remains owned by `services/`
- primary-account preference remains owned by `services/`
- aggregate holdings / exposure shaping remains owned by `services/`
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

type SwitchableAccountOption = {
  accountId: string;
  displayName: string;
  strategyId: string | null;
  isPrimary: boolean;
  isSelected: boolean;
};

type AccountSwitchingAvailability =
  | {
      status: 'UNAVAILABLE';
      reason:
        | 'SINGLE_ACCOUNT_ONLY'
        | 'NO_SWITCHABLE_ACCOUNTS'
        | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      selectedAccountId: string;
      options: ReadonlyArray<SwitchableAccountOption>;
    };

type SelectedAccountAvailability =
  | {
      status: 'UNAVAILABLE';
      reason: 'NO_ACCOUNTS_AVAILABLE' | 'NO_VALID_ACCOUNT_CONTEXT';
      switching?: AccountSwitchingAvailability;
    }
  | {
      status: 'AVAILABLE';
      account: SelectedAccountContext;
      switching?: AccountSwitchingAvailability;
    };
```

Rules:

- keep the contract explicit and sparse
- no broker payload fields
- no execution payload fields
- no holdings dump
- no provider/runtime diagnostics
- no app-owned fallback logic

PX-MA2 also adds one service-owned preference seam:

```ts
type AccountPreferenceState = {
  selectedAccountId: string | null;
  primaryAccountId: string | null;
};
```

The current repo implementation keeps that store session-scoped in `services/accounts/accountPreferenceStore.ts`. Later durable device persistence can attach to the same seam without moving resolution or validation rules into `app/`.

PX-MA3 adds one separate aggregate portfolio contract:

```ts
type AggregatePortfolioAsset = {
  symbol: string;
  amount: number | null;
  value: number | null;
  weightPct: number | null;
};

type AggregatePortfolioContext = {
  totalValue: number | null;
  currency: string | null;
  accountCount: number;
  assets: ReadonlyArray<AggregatePortfolioAsset>;
};

type AggregatePortfolioAvailability =
  | {
      status: 'UNAVAILABLE';
      reason:
        | 'NO_ACCOUNTS_AVAILABLE'
        | 'NO_AGGREGATABLE_PORTFOLIO_DATA'
        | 'NOT_ENABLED_FOR_SURFACE';
    }
  | {
      status: 'AVAILABLE';
      portfolio: AggregatePortfolioContext;
    };
```

Rules:

- this seam is portfolio-context only
- no aggregate alignment fields
- no aggregate fit fields
- no aggregate alert, message, risk, or execution fields
- no provider/runtime diagnostics
- no app-owned aggregation

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

## Switching And Primary Preference Rules

PX-MA2 adds these additional rules:

- switching is explicit only and must start from a user action
- if switching is unavailable, surfaces should stay passive rather than inventing hidden controls
- primary-account updates change fallback preference only; they do not silently replace a valid explicit selection
- Dashboard is the only surface with switching enabled in this phase
- non-Dashboard surfaces may still carry the same selected-account truth, but not an interactive switcher

## Canonical Service Path

The current shared path is:

```text
AccountContextCandidate[]
+ AccountPreferenceStore
-> applyPrimaryAccountPreference
-> resolveSelectedAccountContext
-> createAccountSwitchingAvailability
-> fetchSelectedAccountContext
-> fetchSurfaceContext
-> Snapshot / Dashboard / Strategy Fit / 30,000 ft / message policy / trade-support consumers
```

`app/` consumes prepared `SelectedAccountAvailability` only.

PX-MA2's explicit action path is:

```text
Dashboard tap
-> switchSelectedAccount / setPrimaryAccount
-> AccountPreferenceStore
-> next fetchSelectedAccountContext
```

PX-MA3 adds one separate aggregate path:

```text
AccountContextCandidate[]
-> createAggregatePortfolioContext
-> fetchAggregatePortfolioContext
-> fetchSurfaceContext
-> Dashboard aggregate holdings proof path
```

The two lanes stay separate on purpose:

- selected-account truth continues to drive alignment, fit, alerts, risk, and execution support
- aggregate portfolio context may describe total value and combined holdings only

## Surface Account Normalization

PX-MA4 adds one small normalization helper in `services/accounts/createSurfaceAccountContext.ts`.

That helper turns the selected-account availability into one consistent prepared shape for consumers that need the selected account, selected account id, selected account portfolio value, selected account base currency, or prepared trade-risk context together.

This keeps the surface shape explicit and service-owned without moving fallback logic into `app/` or creating a second account-selection brain.

## Account-Scoped Enforcement Rules

PX-MA1 makes the scope boundary explicit through `services/accounts/enforceAccountScopedTruth.ts`.

Current enforcement intent:

- strategy alignment must be derived from the selected account's events only
- Strategy Fit and 30,000 ft context must consume pre-scoped events and orientation context only
- Dashboard events and explanation context must stay on the selected account
- alert/message truth must stay on the selected account
- risk and execution-support seams must stay on the selected account
- aggregate portfolio context must not feed back into selected-account strategy interpretation

PX-MA3 now lands the first aggregate holdings / exposure seam, but that work still must not become aggregate strategy truth.

## Proof Path

PX-MA1 adds one quiet proof path on Dashboard.

PX-MA2 deepens that same proof path carefully:

- one current-account cue
- one inline expand path when switching is honestly available
- one explicit switch action
- one explicit primary-account preference action
- no management-panel sprawl

PX-MA3 adds one more subordinate proof path on the same surface:

- one small aggregate holdings section
- portfolio and exposure context only
- no aggregate strategy status
- no aggregate fit status
- no aggregate warning theatre

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

PX-MA2 still does not add:

- broad account-management settings
- cross-surface switching rollout everywhere
- account comparison analytics
- aggregated strategy or fit truth

PX-MA3 still does not add:

- aggregate strategy dashboards
- aggregate fit surfaces
- aggregate alerts or messages
- aggregate risk or execution truth
- broad account-management rollout
- comparison suites or exports
