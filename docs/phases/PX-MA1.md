# PX-MA1 - Multi-Account / Account-Scoped Integrity Foundation

## Why This Phase Happened Now

PocketPilot doctrine already treated accounts as first-class and required strategy truth to come from the execution account's feed.

What the repo still lacked was one explicit shared seam that made that truth operational across existing services.

PX-MA1 happens now because PocketPilot already has mature account-bound consumers in Snapshot, Dashboard, Strategy Fit / 30,000 ft, message policy, risk, and trade support, but broad multi-account rollout would be unsafe without:

- one canonical selected-account resolver
- one canonical prepared account-context seam
- one explicit enforcement layer for account-scoped truth

## What PX-MA1 Added

- one canonical account-context contract in `services/accounts/types.ts`
- one canonical deterministic resolver in `services/accounts/resolveSelectedAccountContext.ts`
- one canonical fetch seam in `services/accounts/fetchSelectedAccountContext.ts`
- one explicit enforcement helper in `services/accounts/enforceAccountScopedTruth.ts`
- one shared upstream integration path through `services/upstream/fetchSurfaceContext.ts`
- one passive Dashboard proof path for current account context

The current service path is:

```text
AccountContextCandidate[]
-> resolveSelectedAccountContext
-> fetchSelectedAccountContext
-> fetchSurfaceContext
-> Dashboard / Snapshot / Strategy Fit / 30,000 ft / message policy / trade-support consumers
```

## Integrity Foundation Added

PX-MA1 locks these rules into service-owned seams:

- explicit selected account wins when valid
- otherwise one valid primary account wins
- otherwise highest-value fallback resolves deterministically
- ties stay deterministic by `accountId`
- unavailable account context is returned honestly
- alignment, fit, alerts, risk, and execution support remain selected-account scoped
- no fake aggregated global strategy alignment is introduced
- no fake aggregated fit signal is introduced
- `app/` renders prepared account context only

## Minimal Surface Proof

PX-MA1 adds one small passive current-account treatment on Dashboard.

Why this is enough:

- Dashboard is already account-scoped in canon
- the cue makes active scope legible without selector sprawl
- Snapshot remains protected from unnecessary surface churn in this phase

## What PX-MA1 Deliberately Did Not Add

PX-MA1 does not add:

- full account-management UI
- hidden switching flows
- all-accounts strategy dashboards
- aggregated fit views
- multi-account portfolio analytics
- background syncing or polling
- push notifications
- execution automation
- order dispatch

## What Future Work Can Build On

Later phases can safely build on PX-MA1 by:

- adding explicit account-switching UX only when it is intentionally designed
- widening account-context proof paths to more surfaces through the same prepared seam
- adding aggregate holdings or exposure views without turning them into aggregate strategy truth
- deepening account-aware risk preferences or settings only through service-owned seams

## Recommendation Review

### Adopt Now

- Canonical selected-account resolution in `services/accounts`: it turns doctrine into one deterministic shared seam.
- Shared account-scope enforcement: it prevents accidental cross-account leakage in fit, alerts, risk, and execution-support flows.
- Passive Dashboard account cue: it proves the seam without broad UI rollout.

### Add To Backlog

- explicit account-switching UI once the interaction model is designed carefully
- aggregate holdings or exposure views that remain separate from strategy truth
- account-aware settings or preferences once a canonical settings seam exists

### Decline For Now

- aggregated global strategy alignment
- aggregated fit summaries
- hidden account switching
- multi-surface account-management rollout
- execution automation or order dispatch
