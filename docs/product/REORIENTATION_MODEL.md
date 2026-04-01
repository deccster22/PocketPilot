# Reorientation Model (P6-R2)

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

The briefing appears as a subordinate inline card inside the Snapshot surface.
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

P6-R2 adds a shared Snapshot-facing surface VM above those seams so app code reads one prepared foreground contract instead of deciding placement locally.

The app must render prepared contracts only.
It must not build reorientation copy from raw events or strategy output.

## Visibility And Dismissal
Visibility remains explicit and lightweight.

The prepared surface contract decides whether Snapshot receives:
- `VISIBLE`
- `HIDDEN` with `NOT_NEEDED`
- `HIDDEN` with `DISMISSED`

Dismissal hides the card for the current prepared surface state without deleting the underlying summary contract.
P6-R2 keeps dismissal input minimal and explicit rather than introducing an inbox, unread counter, badge system, or notification state machine.

## Foreground-Only Constraint
P6-R2 keeps reorientation strictly foreground-only.

This phase does not add:
- background polling
- push notifications
- silent scans
- background re-entry processing

Preparation happens only when PocketPilot is already active in the foreground.
