# Alert And Message Policy (P6-A1 + P6-A2 + P6-A3)

## Why This Exists
PocketPilot already had calm briefing and reorientation groundwork, but `P6` still needed one explicit product spine for messaging.

P6-A1 created that spine.
P6-A2 reused it for narrow Dashboard and Trade Hub rollout.
P6-A3 keeps the same spine and makes it smarter about when interpreted change should stay quiet, become a narrower alert, or disappear entirely.

The point is not to make PocketPilot louder.
The point is to make message treatment clearer, calmer, and more consistent across profiles.

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

That means P6-A1 through P6-A3 still reject:
- push mechanics
- unread counters
- badge-count theatre
- manipulative urgency
- guilt framing
- "toast everything" behavior
- background delivery

## Profile Sensitivity Without Noise Inflation
P6-A3 adds one service-owned tuning layer.
It is explicit, bounded, and not user-editable in this phase.

Current posture:
- Beginner should not be punished with more noise, so strong event-only change can remain a calm `BRIEFING`
- Middle can receive a narrow `ALERT` when interpreted change is strong enough, but middling change still prefers `BRIEFING`
- Advanced can receive tighter, more compact alert copy, but not a flood of alerts
- If interpreted context is too thin, PocketPilot should say less, not more

Profile sensitivity tunes treatment.
It does not rewrite the meaning of the message families.

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
P6-A3 keeps alerting narrower than "anything changed."

Current tuning principles:
- confirmed interpreted change is required
- stronger confidence and change magnitude are required for `ALERT`
- calmer thresholds may allow `BRIEFING`
- middling or thin context should suppress to no message
- stronger stop and routing families stay semantically separate

This gives PocketPilot fewer, better-shaped messages rather than broader message coverage.

## What Future P6 Work Can Build On
Later `P6` phases can build on this foundation by adding:
- richer interpreted inputs for threshold tuning
- more explicit surface eligibility where a natural inline home exists
- deeper calm copy refinement for existing families

Those future phases should extend the same message-policy seam rather than inventing a separate notification stack.
