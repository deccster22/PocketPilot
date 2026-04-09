# NOTIFICATION_SYSTEM.md

## Purpose
Translates Notification Philosophy into a product-system behavior model: channels, event classes, throttles, suppression rules, and handoff behavior.

## 1. Role of the notification system
The notification system is the operational layer that decides:
- what event classes may notify
- which channel they may use
- how they are throttled
- how duplicate or stale notifications are suppressed
- how attention hands back into Snapshot / Dashboard

## 2. Non-negotiable rules
The system must obey:
- meaningful change over data twitch
- strategy relevance
- account-scoped truth
- profile-shaped exposure
- calm tone
- no background polling where phase rules forbid it

## 3. Notification classes
### Passive state indicators
- least invasive
- default channel

### In-app haptics
- only while app is open
- subtle awareness aid

### In-app notices
- explicit but bounded
- used when the user is already in session

### Push notifications
- most restricted
- phase-gated
- must not bypass foreground-only policy where that still applies

## 4. Event eligibility
An event may enter the notification system only if:
- it is an interpreted event
- it is strategy-relevant
- it is account-valid
- it is meaningfully new
- it passes relevance checks

## 5. Suppression rules
The system should suppress:
- duplicate events with no new meaning
- stale events
- lower-priority events when a stronger event already explains the state
- contradictory alerts that would confuse users more than help them
- events that belong in passive state rather than interruption

## 6. Throttle rules
The system should include:
- channel-specific throttle windows
- event-family cooldown logic
- haptic throttling
- priority-aware suppression
- foreground/session awareness

## 7. Handoff rules
Healthy notification flow:
- event occurs
- notification surfaces change calmly
- user returns to Snapshot
- deeper context lives in Dashboard / Insights

Notifications do not carry the whole explanation payload themselves.

## 8. Relationship to profiles
Profiles alter:
- which channel is preferred
- how much phrasing is shown
- how dense secondary events may become

Profiles do not alter underlying eligibility truth.

## 9. Relationship to reorientation and summaries
Reorientation and summaries are not notification spam channels.
They are deeper return/context surfaces and should remain opt-in or calmly surfaced.

## 10. Anti-patterns to block
- notification floods
- duplicate event storms
- fear escalation
- push used as retention theatre
- background trust drift

## 11. Practical decision test
1. Does this event deserve interruption?
2. Is the chosen channel the least invasive one that still works?
3. Does the user get handed back into calm orientation?
4. Is duplication/suppression logic strong enough?
5. Would a week of this still feel trustworthy?

## 12. Relationship to other docs
Sits beside:
- NOTIFICATION_PHILOSOPHY.md
- RELEVANCE_PRINCIPLE.md
- SNAPSHOT_VISION.md
- PROFILE_EXPLANATION_MODEL.md
- future haptics taxonomy docs
- CANON / Guardrails

## 13. Open questions
- exact cooldown defaults by event class
- how passive badges decay or clear
- when push becomes phase-legal
- whether users get channel-level controls later
