# PX-MA3 - Aggregate Holdings / Exposure Views

## Why This Phase Happened Now

PX-MA1 made selected-account truth explicit and protected the account-scoped interpretation lane.

PX-MA2 made that same selected-account lane intentionally controllable through one explicit switch path and one primary-account preference seam.

PX-MA3 happens now because PocketPilot can safely show a small amount of cross-account portfolio context without pretending that strategy truth is now global. The product already had:

- one canonical selected-account resolver
- one canonical selected-account fetch seam
- one canonical account-scope enforcement lane
- one controlled Dashboard proof path for account context

What it still lacked was one honest aggregate holdings / exposure seam.

## What PX-MA3 Added

- one canonical aggregate holdings / exposure contract in `services/accounts/types.ts`
- one canonical aggregate portfolio builder in `services/accounts/createAggregatePortfolioContext.ts`
- one canonical aggregate fetch seam in `services/accounts/fetchAggregatePortfolioContext.ts`
- one shared upstream field in `services/upstream/fetchSurfaceContext.ts` so surfaces can receive aggregate portfolio context without owning aggregation rules
- one Dashboard-only subordinate proof path through `services/dashboard/*`, `app/screens/dashboardScreenView.ts`, `app/components/DashboardAggregatePortfolioCard.tsx`, and `app/screens/DashboardScreen.tsx`

The new service path is:

```text
AccountContextCandidate[]
-> createAggregatePortfolioContext
-> fetchAggregatePortfolioContext
-> fetchSurfaceContext
-> Dashboard aggregate holdings proof path
```

The selected-account truth path remains separate:

```text
AccountContextCandidate[]
+ AccountPreferenceStore
-> applyPrimaryAccountPreference
-> resolveSelectedAccountContext
-> fetchSelectedAccountContext
-> fetchSurfaceContext
-> Dashboard / Snapshot / Strategy Fit / 30,000 ft / message policy / trade-support consumers
```

## Integrity Rules Preserved

PX-MA3 keeps these rules explicit:

- aggregate portfolio context is portfolio-only, not strategy truth
- selected-account alignment remains selected-account scoped
- selected-account fit remains selected-account scoped
- selected-account alerts, messages, risk, and execution support remain selected-account scoped
- `services/` owns holdings aggregation; `app/` renders prepared contracts only
- Dashboard remains selected-account first, with aggregate holdings context rendered as a small subordinate section only when honestly available
- unavailable aggregate data stays explicit through `UNAVAILABLE` instead of inventing all-account truth

## What PX-MA3 Deliberately Did Not Add

PX-MA3 does not add:

- aggregate strategy alignment
- aggregate fit summaries
- aggregate alert or message truth
- aggregate risk truth
- aggregate execution readiness
- aggregate `MarketEvent` interpretation
- broad account-management UI
- background syncing
- push notifications
- execution automation
- order dispatch

## What Future Work Can Build On

Later phases can now build on PX-MA3 by:

- widening the same aggregate portfolio seam to other surfaces only when the product case is clear
- adding richer portfolio coverage context above the same aggregate contract
- adding deeper portfolio analytics only if they stay separate from strategy truth
- attaching provider-backed portfolio snapshots to the same seam without moving aggregation into `app/`

## Recommendation Review

### Adopt Now

- one canonical aggregate holdings / exposure contract
- one canonical aggregate portfolio builder and fetch seam in `services/accounts`
- one small Dashboard aggregate holdings proof path that stays subordinate to selected-account strategy truth

### Add To Backlog

- broader surface rollout of the same aggregate seam when the product case is clear
- richer coverage metadata if users need to distinguish partial versus complete aggregate portfolio views
- deeper aggregate portfolio analytics that still remain separate from strategy truth

### Decline For Now

- aggregate alignment, fit, alert, risk, or execution truth
- broad account-management rollout
- comparison dashboards and export suites
- execution automation or order dispatch
