# Alert And Message Policy (P6-A1 + P6-A2 + P6-A3 + P6-A4)

## Why This Exists
PocketPilot already had calm briefing and reorientation groundwork, but `P6` still needed one explicit product spine for messaging.

P6-A1 created that spine.
P6-A2 reused it for narrow Dashboard and Trade Hub rollout.
P6-A3 made alert treatment profile-aware.
P6-A4 now improves the interpreted input quality feeding that same seam.

The point is still not to make PocketPilot louder.
The point is to make message treatment clearer, calmer, and more truthful.

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
- user control over automation theatre
- knowledge that empowers without gatekeeping

That means P6-A1 through P6-A4 still reject:
- push mechanics
- unread counters
- badge-count theatre
- manipulative urgency
- guilt framing
- "toast everything" behavior
- background delivery

## Richer Inputs Without Noise Inflation
P6-A4 adds one service-owned prepared alert-input helper.
It is explicit, bounded, and not user-editable in this phase.

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

## Current Consumer Surfaces
Snapshot remains the main consumer for tuned alert behavior.

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
- stay inline
- avoid popup, badge, or inbox mechanics
- avoid urgency theatre

## Threshold Posture
P6-A4 keeps alerting narrower than "anything changed."

Current tuning principles:
- confirmed interpreted change is still required for alert treatment
- subject clarity matters; single-symbol scope is calmer and easier to trust
- stronger interpreted continuity can support an alert for borderline change
- multi-symbol or broader-scope change should stay more conservative
- middling or thin context should suppress to no message
- stronger stop and routing families stay semantically separate

This gives PocketPilot fewer, better-shaped messages rather than broader message coverage.

## What Future P6 Work Can Build On
Later `P6` phases can build on this foundation by adding:
- other high-trust interpreted inputs on the same seam
- more explicit surface eligibility where a natural inline home exists
- deeper calm copy refinement for existing families

Those future phases should extend the same message-policy seam rather than inventing a separate notification stack.
