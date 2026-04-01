# Reorientation Model (P6-R5)

## Purpose
Reorientation is PocketPilot's calm "welcome back" briefing for users returning after a meaningful inactivity gap.

It exists to restore bearings without guilt, urgency, or pressure.
It is:
- auto-prepared
- opt-in visible
- calm in tone
- profile-sensitive
- foreground-only

This phase does not create a notification framework, inbox, journal, or push system.

## Canonical Placement
P6-R2 gives reorientation one foreground home only: Snapshot.

The briefing appears through Snapshot's one subordinate inline briefing zone.
It is not duplicated across Dashboard, Trade Hub, tabs, feeds, badges, or modals in this phase.

Snapshot remains primary.
The reorientation card is a quiet supporting note, not the center of gravity.

## Product Posture
Reorientation is a briefing card, not a retention widget.

It should feel like PocketPilot quietly preparing context in case the user wants it.
It should never:
- shame inactivity
- imply the user missed something they "should" have caught
- pressure immediate action
- present raw signals as product copy

`Welcome back` is acceptable.
Command language, countdowns, dopamine mechanics, badges, and urgency phrasing are not.

## Eligibility By Profile
PocketPilot uses the canonical profile IDs `BEGINNER`, `MIDDLE`, and `ADVANCED`.
For product wording, `MIDDLE` maps to the intermediate profile.

Default thresholds:
- Beginner: available after 30 inactive days
- Intermediate (`MIDDLE`): available after 45 inactive days
- Advanced: disabled by default unless explicitly enabled

An explicit threshold override may be passed through service inputs when needed.
That override changes timing only.
It does not change the underlying truth of the summary.

## Meaningful Change Filter
Reorientation is only available when both of these are true:
- the inactivity threshold has been met
- there is meaningful interpreted change since the user's last active session

"Meaningful" is intentionally stricter than "anything changed."
If no meaningful interpreted change exists, services return `NOT_NEEDED` with `NO_MEANINGFUL_CHANGE`.

## Summary Content Rules
The prepared summary is capped at 3 items.

Summary items must remain calm, explicit, and non-punitive.
They may cover interpreted themes such as:
- price context
- strategy context
- volatility context
- market event context
- account context

Summary items must not leak raw signal codes, event IDs, strategy implementation details, or unshaped event metadata into app copy.

## Relationship To Existing Seams
Reorientation is built on top of existing interpreted service seams:
- `EventLedgerQueries`
- `Since Last Checked`
- `OrientationContext`
- `SnapshotModel`

P6-R5 keeps one shared Snapshot-facing surface VM above those seams so app code reads one prepared foreground contract instead of deciding placement locally.
P6-R5A removes the older reorientation-only app presentation helper path so Snapshot keeps one canonical app rendering surface for that prepared contract.

The app must render prepared contracts only.
It must not build reorientation copy from raw events or strategy output.

Snapshot now has one canonical subordinate briefing zone:
- if reorientation is available, it owns the zone
- if reorientation is not available, Since Last Checked may use the zone
- if neither is meaningful, the zone stays hidden
- Snapshot never shows reorientation and Since Last Checked as competing adjacent cards in this phase

## Visibility And Dismissal
Visibility remains explicit and lightweight.

The prepared surface contract decides whether Snapshot receives:
- `VISIBLE`
- `HIDDEN` with `NOT_NEEDED`
- `HIDDEN` with `DISMISSED`

Above that seam, the Snapshot briefing contract decides whether Snapshot renders:
- `REORIENTATION`
- `SINCE_LAST_CHECKED`
- `HIDDEN`

Dismissal hides the card for the current prepared surface state without deleting the underlying summary contract.
P6-R3 persists that dismissal across app restarts through a minimal `dismissedAt` state.

The reset rule stays explicit and finite:
- persisted dismissal continues to hide the current prepared reorientation cycle
- current-session dismissal continues to hide only the current prepared reorientation cycle
- once a later eligible summary is generated from a newer `lastActiveAt` boundary, the old dismissal no longer suppresses it

This remains surface behavior only.
It does not introduce an inbox, unread counter, badge system, reminder loop, or notification state machine.

Since Last Checked does not inherit reorientation dismissal in this phase.
It remains non-dismissible unless a later phase explicitly introduces service-owned rules for that.

## Foreground-Only Constraint
P6-R2 keeps reorientation strictly foreground-only.

This phase does not add:
- background polling
- push notifications
- silent scans
- background re-entry processing

Preparation happens only when PocketPilot is already active in the foreground.
P6-R4 keeps that posture and adds one explicit foreground re-check:
- Snapshot reads the same prepared `SnapshotSurfaceVM` on initial mount
- Snapshot reads that same prepared `SnapshotSurfaceVM` again only when app lifecycle returns from `background` or `inactive` to `active`
- navigation focus churn, rerenders, and local state changes do not become alternate refresh triggers
