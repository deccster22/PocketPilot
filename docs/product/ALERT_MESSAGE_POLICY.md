# Alert And Message Policy (P6-A1 + P6-A2)

## Why This Exists
PocketPilot already had calm briefing and reorientation groundwork, but `P6` was still underrepresented compared with the product roadmap.

P6-A1 happens first to give the product one explicit policy spine for messaging before any broader alert family work is attempted.
P6-A2 then uses that same spine for two narrow inline rollouts instead of building a second message system.

The point is not to make PocketPilot louder.
The point is to make its message types clearer and safer.

## Message Families
P6-A1 makes five message families explicit:

- `BRIEFING`: a quiet interpreted note, such as Since Last Checked
- `ALERT`: a meaningful interpreted change that is stronger than a briefing but still calm
- `REORIENTATION`: a welcome-back note after a meaningful gap
- `REFERRAL`: a better-handled-elsewhere or out-of-scope note
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

That means P6-A1 and P6-A2 still reject:
- push mechanics
- unread counters
- badge count theatre
- manipulative urgency
- guilt framing
- "toast everything" behavior

## Current Consumer Surfaces
Snapshot remains the first thin consumer path.

Why Snapshot:
- it already has one calm subordinate message zone
- it already had briefing and reorientation groundwork
- it lets the repo prove the policy seam without pretending the whole alert family is finished

In P6-A1, Snapshot stays:
- inline
- sparse
- foreground-only
- service-owned

P6-A2 adds only two more explicit inline homes:
- Dashboard may show `REFERRAL` when the Focus surface has supporting context but no prime top-focus item
- Trade Hub may show `GUARDED_STOP` when a selected plan has no protected execution path

Those rollouts stay:
- inline
- surface-owned
- calm and factual
- separate from push, inbox, badge, and popup mechanics

Important rollout distinctions:
- Dashboard referral is a routing or fit note, not a hard-failure banner
- Trade Hub guarded stop is a product-boundary note, not a readiness warning or outage message
- Snapshot behavior from P6-A1 remains unchanged

## What Future P6 Work Can Build On
Later P6 phases can build on this foundation by adding:
- stronger per-surface eligibility rules
- broader surface rollout when a natural inline home exists
- broader message family expansion if product doctrine still supports it

Those future phases should extend the same message-policy seam rather than inventing a separate notification stack.
