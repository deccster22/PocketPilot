# Message Policy Model (P6-A1 + P6-A2 + P6-A3)

## Purpose
P6-A1 added PocketPilot's first canonical message-policy seam.
P6-A2 reused that same seam for Dashboard `REFERRAL` and Trade Hub `GUARDED_STOP`.
P6-A3 keeps the same seam and adds explicit threshold and profile-sensitivity tuning so Snapshot can stay calmer and more consistent about when interpreted change should become:
- a quiet `BRIEFING`
- a narrower `ALERT`
- a `REORIENTATION`
- a `REFERRAL`
- a `GUARDED_STOP`

This remains a policy seam, not a notification platform.

The goal is to:
- keep product messaging service-owned
- keep semantic message families explicit
- tune alert intensity without collapsing meaning into one generic severity scale
- preserve calm posture and foreground-only behavior
- keep `app/` on prepared contracts only

P6-A1 through P6-A3 do not add push, inbox, unread state, badges, background jobs, popup choreography, or urgency ladders.

## Canonical Contract
The canonical message-policy contract lives in `services/messages/types.ts`.

```ts
type MessagePolicyKind =
  | 'BRIEFING'
  | 'ALERT'
  | 'REORIENTATION'
  | 'REFERRAL'
  | 'GUARDED_STOP'

type MessagePriority = 'LOW' | 'MEDIUM' | 'HIGH'

type MessageSensitivityProfile = 'GUIDED' | 'BALANCED' | 'DIRECT'

type AlertThresholdDecision =
  | 'KEEP_AS_ALERT'
  | 'DOWNGRADE_TO_BRIEFING'
  | 'SUPPRESS'

type PreparedMessage = {
  kind: MessagePolicyKind
  title: string
  summary: string
  priority: MessagePriority
  surface: MessageSurfaceEligibility
  dismissible: boolean
}
```

Rules:
- `kind` is explicit and never inferred by `app/`
- `surface` is explicit and service-owned
- `summary` is calm product copy, not raw event metadata
- `MessageSensitivityProfile` is a service-owned tuning profile, not a user-facing setting
- `AlertThresholdDecision` is narrow and explicit: keep, downgrade, or suppress
- no push-delivery metadata exists here
- no unread, badge, inbox, engagement, or reminder fields exist here
- no raw IDs, provider diagnostics, or strategy implementation details leak here

## Data Flow
The message-policy seam still sits above interpreted service-owned inputs rather than app-owned heuristics.

Snapshot uses the existing orientation and briefing spine, then applies profile tuning only inside `services/messages`:

```text
EventLedger
-> EventLedgerQueries
-> Since Last Checked
-> OrientationContext
-> SnapshotModel
-> ReorientationSurfaceState
-> SnapshotBriefingState
-> createMessagePolicyVM
-> applyMessageProfileTuning
-> MessagePolicyAvailability
-> Snapshot message zone
```

The canonical fetch path still has three narrow consumer routes:

```text
fetchSnapshotSurfaceVM
-> fetchMessagePolicyVM(surface: 'SNAPSHOT')
-> app/screens/snapshotScreenView.ts
-> SnapshotScreen

fetchDashboardSurfaceVM
-> fetchMessagePolicyVM(surface: 'DASHBOARD')
-> app/screens/dashboardScreenView.ts
-> DashboardScreen

fetchConfirmationSessionVM
-> fetchMessagePolicyVM(surface: 'TRADE_HUB')
-> app/screens/tradeHubScreenView.ts
-> TradeHubScreen
```

`app/` renders the prepared contract only.
It does not decide whether something is a briefing, alert, reorientation prompt, referral, or guarded stop.
It also does not apply threshold tuning locally.

## Threshold And Sensitivity Rules
P6-A3 adds one explicit helper: `services/messages/applyMessageProfileTuning.ts`.

It tunes only prepared alert candidates and does not rewrite the broader family model.

Sensitivity mapping stays explicit:
- `BEGINNER` -> `GUIDED`
- `MIDDLE` -> `BALANCED`
- `ADVANCED` -> `DIRECT`

Alert threshold decisions stay explicit:
- `KEEP_AS_ALERT`: the interpreted change is strong enough for Snapshot's narrow alert posture
- `DOWNGRADE_TO_BRIEFING`: the change is meaningful enough for a calm inline note, but not for alert treatment on that profile
- `SUPPRESS`: interpreted context is too thin or too middling to justify a message

Current tuning posture:
- Beginner keeps strong event-only change as a calm `BRIEFING` rather than a louder `ALERT`
- Middle may keep strong change as `ALERT`, but middling change de-escalates to `BRIEFING`
- Advanced keeps compact, less explanatory `ALERT` copy only when stronger interpreted thresholds are met
- Advanced does not bypass thresholds; middling change still suppresses to no message
- Thin interpreted alert context stays `UNAVAILABLE` honestly through suppression rather than filler copy

The helper uses interpreted event fields already available at the message seam, including:
- event type
- certainty
- confidence score
- percentage change
- presence of a clear subject symbol

It does not consume raw signal arrays, provider diagnostics, or app-owned heuristics.

## Classification Rules
P6-A1 through P6-A3 keep the semantic families primary.

### Reorientation
- Snapshot-visible reorientation becomes a `REORIENTATION` message
- existing dismissal behavior stays intact
- dismissed reorientation does not fall through to a noisier replacement message
- profile tuning does not rewrite reorientation into another family

### Briefing
- `SINCE_LAST_CHECKED` stays a `BRIEFING`
- P6-A3 also allows downgraded alert-worthy change to remain a calm `BRIEFING` when that better fits the profile threshold
- briefing remains quieter than alerting
- briefing is still derived from interpreted history or interpreted change, not raw event arrays

### Alert
- only confirmed, interpreted meaningful-change events are eligible
- alerting stays stricter than "anything changed"
- P6-A3 adds explicit confidence and magnitude thresholds on top of the existing event-type filter
- alerting stays inline and foreground-only
- current Snapshot alerts use `MEDIUM` priority to stay calm and surface-specific

### Referral
- referral remains a separate family for better-handled-elsewhere guidance
- referral is not a guarded stop and not a missing-data error
- Dashboard referral still appears only when Dashboard has supporting interpreted context but no prime focus item
- P6-A3 does not let profile tuning blur referral into alerting or stop language

### Guarded Stop
- guarded stop remains the strongest stop-style family
- it expresses that PocketPilot should not continue a path with the current context
- it is not framed as punishment, urgency, or outage theatre
- Trade Hub guarded stop still appears only when the selected confirmation session has no protected execution path
- P6-A3 does not let profile tuning weaken or rename this boundary

## Surface Discipline
P6-A3 keeps rollout deliberately narrow.

That means:
- Snapshot may show `REORIENTATION`, `BRIEFING`, or a tuned inline `ALERT`
- Dashboard may show a quiet `REFERRAL` note only
- Trade Hub may show a calm `GUARDED_STOP` note only
- no other surfaces gain message-center behavior in this phase

Availability rules stay explicit:
- `AVAILABLE` when a prepared message is eligible for the requested surface
- `NOT_ENABLED_FOR_SURFACE` when a prepared message exists but belongs elsewhere
- `NO_MESSAGE` when context exists but does not justify messaging after tuning
- `INSUFFICIENT_INTERPRETED_CONTEXT` when service-owned context is too thin to classify

## Non-Goals Preserved
P6-A1 through P6-A3 do not add:
- push notifications
- notification-center plumbing
- inbox or unread state
- background scanning
- badge counts
- urgency ladders
- user-editable threshold settings
- broad per-surface message rollouts
- AI-generated messaging
- app-owned copy assembly
