# PX-MA4 - Account-Context Surface Consistency Cleanup

## Why This Phase Happened Now

PX-MA1 made selected-account truth explicit.
PX-MA2 made switching and primary fallback intentional.
PX-MA3 made aggregate holdings explicitly separate from selected-account strategy truth.

That left one small but important cleanup gap: several surface services still rebuilt the same selected-account shape locally even though the repo already had enough service-owned truth to normalize that context once.

PX-MA4 happens now because the product is already stable enough to keep the selected-account lane honest across Snapshot, Dashboard, Trade Hub, and related support seams, but it is still too early for any broader account-feature expansion.

## What PX-MA4 Added

- one canonical surface-account normalization helper in `services/accounts/createSurfaceAccountContext.ts`
- one normalized selected-account threading path for Snapshot, Dashboard, Trade Hub, and related support consumers
- one small cleanup pass that removes repeated local selected-account branching in touched service seams

The new path is:

```text
SelectedAccountAvailability
-> createSurfaceAccountContext
-> Snapshot / Dashboard / Trade Hub / selected-account support consumers
```

## What Was Normalized

PX-MA4 keeps the selected-account seam explicit and service-owned, but it makes the prepared surface shape easier to reuse.

Normalized fields include:

- the selected account itself when available
- the selected account id
- the selected account base currency
- the selected account portfolio value when the surface already knows it
- the trade-risk context used by the prepared Trade Hub and confirmation-support lanes

This keeps the account-context shape consistent without inventing a second resolver or moving fallback logic into `app/`.

## What PX-MA4 Deliberately Did Not Add

PX-MA4 does not add:

- account-management UI
- new account switching behavior
- new aggregate strategy truth
- new portfolio analytics
- new execution behavior
- background polling
- push notifications
- any CANON change

## What Future Work Can Build On

Later work can safely build on PX-MA4 by:

- reusing the same surface-account helper for future account-scoped service seams
- attaching more explicit prepared account metadata only when a surface genuinely needs it
- keeping Dashboard, Snapshot, Trade Hub, and related support lanes on one normalized selected-account truth path

Future account work should expand the seam only when the product case is clear. It should not split selected-account truth back into per-surface ad hoc fallback logic.

## Recommendation Review

### Adopt Now

- canonical surface-account normalization: it removes repeated local branching and keeps the same selected-account truth threaded through the touched service seams.
- Trade Hub and support-lane reuse: it keeps risk and confirmation support aligned with the same prepared selected-account truth.

### Add To Backlog

- richer account metadata on the same seam: useful later, but only if a future surface truly needs it.
- additional account-scoped consumers outside the touched surfaces: safe to add later through the same helper.

### Decline For Now

- any new account-management experience
- aggregate strategy truth
- app-owned selected-account fallback logic
- broader multi-account product expansion
