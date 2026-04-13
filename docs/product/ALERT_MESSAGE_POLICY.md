# Alert And Message Policy (P6-A1 + P6-A2 + P6-A3 + P6-A4 + P6-A5 + P6-A6)

## Why This Exists
PocketPilot already had calm briefing and reorientation groundwork, but `P6` needed one explicit product spine for messaging.

P6-A1 created that spine.
P6-A2 reused it for narrow Dashboard and Trade Hub rollout.
P6-A3 made alert treatment profile-aware.
P6-A4 improved the interpreted input quality feeding the seam.
P6-A5 adds one compact explanation layer so PocketPilot can say why the current message posture surfaced.
P6-A6 consolidates the same final policy and rationale outputs into one grouped prepared lane so the current consumers can keep reading one calm service-owned contract.
P6-A7 adds one separate Snapshot-facing Since Last Checked section under Strategy Status, but it does not change the message families or create a delivery channel.

The goal is still not to make PocketPilot louder.
The goal is to make message treatment clearer, calmer, and easier to trust.

## Message Families
PocketPilot still uses five explicit message families:

- `BRIEFING`: a quiet interpreted note, such as Since Last Checked or a downgraded calm change note
- `ALERT`: a meaningful interpreted change that clears Snapshot's stronger threshold
- `REORIENTATION`: a welcome-back note after a meaningful gap
- `REFERRAL`: a better-handled-elsewhere or better-fit note
- `GUARDED_STOP`: a stronger safe-stop note when PocketPilot should not continue a path

These are not interchangeable.

Important distinctions:
- a briefing is not an alert
- reorientation is not an alert
- referral is not a guarded stop
- guarded stop is not a missing-data message
- absence is better than filler

## Product Posture
PocketPilot messaging must preserve:
- calm over urgency
- interpretation over raw signal leakage
- user trust over delivery-platform theatre
- compact explanation over debug-style disclosure

That means P6-A1 through P6-A5 still reject:
- push mechanics
- unread counters
- badge-count theatre
- inbox or notification-center systems
- generic toast or banner infrastructure
- guilt framing
- user-editable sensitivity settings

## Richer Inputs Without Noise Inflation
P6-A4 added one service-owned prepared alert-input helper.
It remains explicit, bounded, and not user-editable in this phase.

Current prepared inputs include:
- clearer subject scope
- compact event-family grouping
- explicit confirmation support
- one interpreted change-strength scale

Current posture:
- beginner should not be punished with more noise, so strong change can still remain a calm `BRIEFING`
- middle can still receive a narrow `ALERT` for stronger change, but meaningful change remains briefing territory
- advanced can keep a calmer alert for history-backed borderline change when the interpreted subject stays clear
- broader or thinner context should suppress or downgrade rather than inflate alert volume
- if interpreted context is too thin, PocketPilot should say less, not more

Richer inputs tune treatment.
They do not rewrite the meaning of the message families.

## User-Visible Rationale
P6-A5 adds one optional user-visible rationale seam for surfaced messages only.

It is:
- calm
- compact
- explanatory
- inline
- service-owned

It can explain:
- why this note is a briefing, alert, referral, guarded stop, or reorientation message
- why the posture stayed subdued where relevant
- why the note belongs on the current surface

It does not explain:
- raw signals
- score readouts
- provider/runtime diagnostics
- advice about what the user should do

Typical examples:
- "Shown as a briefing because the change is meaningful but not strong enough for an alert."
- "Shown as a referral because Dashboard has useful context, but Snapshot is the steadier first read right now."
- "Shown as a guarded stop because Trade Hub should keep the current boundary visible instead of carrying the path further."

## Current Consumer Surfaces
Snapshot remains the main consumer for tuned alert behavior.
Snapshot also gains one separate Since Last Checked section under Strategy Status, but that section remains outside the message-policy lane and stays service-owned, compact, and non-inbox-like.

Why Snapshot:
- it already has one calm subordinate message zone
- it already had briefing and reorientation groundwork
- it is the natural place to decide whether interpreted change deserves a briefing, a narrow alert, or nothing

Snapshot stays:
- inline
- sparse
- foreground-only
- service-owned

Dashboard and Trade Hub continue their existing P6-A2 rollout only:
- Dashboard may show `REFERRAL`
- Trade Hub may show `GUARDED_STOP`

Those surfaces still:
- consume prepared policy only
- consume prepared rationale only
- stay inline
- avoid popup, badge, or inbox mechanics
- avoid urgency theatre

## Grouped Prepared Lane
P6-A6 keeps the same message families and meanings.
It only groups the final service-owned outputs into one prepared lane:
- `policyAvailability`
- `rationaleAvailability`

That keeps Snapshot, Dashboard, and Trade Hub on one calm contract shape while avoiding separate ad hoc policy and rationale plumbing in `app/`.

## Threshold Posture
P6-A4 and P6-A5 keep alerting narrower than "anything changed."

Current tuning principles:
- confirmed interpreted change is still required for alert treatment
- subject clarity matters; single-symbol scope is calmer and easier to trust
- stronger interpreted continuity can support an alert for borderline change
- multi-symbol or broader-scope change should stay more conservative
- middling or thin context should suppress to no message
- stronger stop and routing families stay semantically separate

This gives PocketPilot fewer, better-shaped messages rather than broader coverage.
Rationale then explains the chosen posture without widening the delivery model.

## What Future P6 Work Can Build On
Later `P6` phases can build on this foundation by adding:
- more explicit rationale on other existing inline message surfaces
- deeper calm copy refinement for current families
- additional surface eligibility only where a natural inline home already exists

Those future phases should extend the same message-policy seam rather than inventing a separate notification stack.

P6-A7 can now extend the same calm Snapshot posture with one separate Since Last Checked section while keeping that section out of the alert-policy lane entirely.
