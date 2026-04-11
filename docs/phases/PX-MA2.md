# PX-MA2 - Intentional Account Switching / Primary Account UX

## Why This Phase Happened Now

PX-MA1 made selected-account truth explicit and protected account-scoped interpretation across Dashboard, fit, alerts, risk, and execution support.

The next safe step was not broad multi-account rollout. The next safe step was one calm user-controlled way to change that context intentionally and one explicit way to mark a preferred primary fallback.

PX-MA2 happens now because PocketPilot already had:

- one canonical selected-account resolver
- one canonical account-scoped enforcement lane
- one passive Dashboard proof cue

What it still lacked was controlled account context, not more account surface area.

## What PX-MA2 Added

- one canonical switching availability contract in `services/accounts/types.ts`
- one canonical switching-options builder in `services/accounts/createAccountSwitchingAvailability.ts`
- one explicit selected-account switch action in `services/accounts/switchSelectedAccount.ts`
- one explicit primary-account preference action in `services/accounts/setPrimaryAccount.ts`
- one service-owned account preference store seam in `services/accounts/accountPreferenceStore.ts`
- one extended selected-account fetch seam in `services/accounts/fetchSelectedAccountContext.ts`
- one calm inline Dashboard control path through `app/screens/DashboardScreen.tsx` and `app/components/DashboardAccountSwitcher.tsx`

The current service path is:

```text
AccountContextCandidate[]
+ AccountPreferenceStore
-> applyPrimaryAccountPreference
-> resolveSelectedAccountContext
-> createAccountSwitchingAvailability
-> fetchSelectedAccountContext
-> fetchSurfaceContext
-> Dashboard and other account-scoped consumers
```

The current explicit action path is:

```text
Dashboard tap
-> switchSelectedAccount / setPrimaryAccount
-> AccountPreferenceStore
-> next fetchSelectedAccountContext
```

## Integrity Rules Preserved

PX-MA2 keeps these rules explicit:

- selected-account truth remains service-owned
- switching is explicit only; there is no hidden account change
- primary-account updates do not silently override an explicit selected account
- if a stored explicit selection becomes invalid, the resolver may still fall back through the existing PX-MA1 order
- Dashboard, Strategy Fit, 30,000 ft, alerts, risk, and execution support remain selected-account scoped
- no aggregated global strategy alignment is introduced
- no aggregated fit summary is introduced
- `app/` renders prepared switching options only and does not derive eligibility or fallback logic

## Dashboard UX Added

PX-MA2 deepens the existing Dashboard account cue just enough to make context controllable:

- the current-account cue remains compact and calm
- when more than one valid account exists, the cue can expand inline
- the user can explicitly switch to another eligible account
- the user can explicitly mark one account as the primary fallback
- if switching is unavailable, the cue stays passive or absent rather than faking a selector

This remains intentionally small. Dashboard is still not an account-management center.

## What PX-MA2 Deliberately Did Not Add

PX-MA2 does not add:

- full account-management settings
- hidden switching
- cross-surface switching rollout everywhere
- aggregate holdings or exposure views
- aggregate strategy or fit truth
- account comparison analytics
- background syncing
- push notifications
- execution automation
- order dispatch

The current account-preference store in this repo is service-owned and session-scoped. Durable device persistence can attach to the same seam later without moving resolution logic into `app/`.

## What Future Work Can Build On

Later phases can now build on PX-MA2 by:

- attaching durable device persistence to the same account-preference seam
- widening the same explicit switching path to other surfaces only when the product case is clear
- adding account-aware settings without turning Dashboard into a management surface
- adding aggregate holdings or exposure views that remain clearly separate from strategy truth

## Recommendation Review

### Adopt Now

- one canonical switching availability contract and builder in `services/accounts`
- one explicit selected-account switch action plus one explicit primary-account preference action
- one calm inline Dashboard control that builds directly on the PX-MA1 cue

### Add To Backlog

- durable device persistence for the account-preference store
- controlled rollout of the same switching seam to other surfaces where it materially helps
- aggregate holdings or exposure views that stay analytically separate from selected-account strategy truth

### Decline For Now

- hidden switching
- broad account-management UI
- aggregated global strategy alignment
- aggregated fit summaries
- execution automation or order dispatch
