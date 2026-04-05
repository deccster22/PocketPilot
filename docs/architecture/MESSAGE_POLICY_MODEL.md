# Message Policy Model (P6-A1 + P6-A2 + P6-A3 + P6-A4)

## Purpose
P6-A1 added PocketPilot's canonical message-policy seam.
P6-A2 reused that seam for Dashboard `REFERRAL` and Trade Hub `GUARDED_STOP`.
P6-A3 added explicit profile-sensitivity and keep, downgrade, or suppress tuning.
P6-A4 keeps the same seam and improves the interpreted alert-input quality available to it.

The result is still one policy seam, not a notification platform.

Goals:
- keep product messaging service-owned
- keep semantic message families explicit
- improve alert-versus-briefing truth with richer interpreted context
- preserve calm posture and foreground-only behavior
- keep `app/` on prepared contracts only

P6-A1 through P6-A4 do not add push, inbox, unread state, badges, background jobs, popup choreography, or urgency ladders.

## Canonical Contract
The canonical message-policy contract lives in `services/messages/types.ts`.

```ts
type MessagePolicyKind =
  | 'BRIEFING'
  | 'ALERT'
  | 'REORIENTATION'
  | 'REFERRAL'
  | 'GUARDED_STOP'

type MessageSensitivityProfile = 'GUIDED' | 'BALANCED' | 'DIRECT'

type AlertThresholdDecision =
  | 'KEEP_AS_ALERT'
  | 'DOWNGRADE_TO_BRIEFING'
  | 'SUPPRESS'

type PreparedMessageInputContext = {
  subjectLabel: string | null
  subjectScope: 'SINGLE_SYMBOL' | 'MULTI_SYMBOL' | 'PORTFOLIO'
  isSingleSymbolScope: boolean
  eventFamily: 'PRICE_CHANGE' | 'MOMENTUM' | 'PULLBACK' | 'NON_ALERTABLE'
  confirmationSupport:
    | 'ESTIMATED_OR_THIN'
    | 'CONFIRMED_EVENT'
    | 'CONFIRMED_WITH_HISTORY'
  changeStrength: 'THIN' | 'MODEST' | 'MEANINGFUL' | 'STRONG'
  hasSinceLastCheckedContext: boolean
  hasReorientationContext: boolean
}
```

Rules:
- `kind` remains explicit and never inferred by `app/`
- `surface` remains explicit and service-owned
- `PreparedMessageInputContext` is internal policy input, not a UI contract
- richer inputs stay compact and interpreted rather than becoming a bag of raw event payloads
- no push-delivery metadata exists here
- no unread, badge, inbox, engagement, or reminder fields exist here
- no raw IDs, provider diagnostics, runtime metadata, or signal arrays leak here

## Data Flow
The message-policy seam still sits above interpreted service-owned inputs rather than app-owned heuristics.

Snapshot now uses the existing orientation and briefing spine plus one prepared-input helper:

```text
EventLedger
-> EventLedgerQueries
-> Since Last Checked
-> OrientationContext
-> SnapshotModel
-> ReorientationSurfaceState
-> SnapshotBriefingState
-> createPreparedMessageInputs
-> createMessagePolicyVM
-> applyMessageProfileTuning
-> MessagePolicyAvailability
-> Snapshot message zone
```

The canonical fetch path remains unchanged in shape:

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
It also does not derive richer alert inputs locally.

## Prepared Alert Inputs
P6-A4 adds one explicit helper: `services/messages/createPreparedMessageInputs.ts`.

It derives compact interpreted alert context from existing service-owned seams:
- latest relevant interpreted event
- Since Last Checked summary count
- Snapshot briefing state
- reorientation summary availability

The helper intentionally focuses on a few high-trust inputs:
- `subjectScope`: whether the interpreted change is one symbol, a small symbol cluster, or portfolio-level
- `eventFamily`: compact grouping for price change, momentum, pullback, or non-alertable context
- `confirmationSupport`: whether the change is estimated/thin, confirmed standalone, or confirmed with interpreted continuity support
- `changeStrength`: one interpreted scale from thin to strong

This is meant to clarify meaning, not amplify noise.
It does not create a second interpretation engine and does not turn multiple weak hints into automatic alert escalation.

## Threshold And Sensitivity Rules
`services/messages/applyMessageProfileTuning.ts` still tunes only prepared alert candidates and does not rewrite the broader family model.

Sensitivity mapping stays explicit:
- `BEGINNER` -> `GUIDED`
- `MIDDLE` -> `BALANCED`
- `ADVANCED` -> `DIRECT`

Alert threshold decisions stay explicit:
- `KEEP_AS_ALERT`: the interpreted change is strong enough for Snapshot's narrow alert posture
- `DOWNGRADE_TO_BRIEFING`: the change deserves a calm inline note but not alert treatment
- `SUPPRESS`: interpreted context is too thin, too broad, or too middling to justify a message

P6-A4 tuning posture:
- strong, single-symbol, confirmed change can remain an `ALERT`
- meaningful but not fully strong change needs clearer support before advanced profile keeps it as an alert
- multi-symbol scope stays conservative and does not become a louder alert by default
- beginner still prefers quieter treatment
- thin or estimated context still resolves to no message rather than filler copy

The richer inputs can confirm suppression just as easily as they can preserve an alert.

## Classification Rules
P6-A1 through P6-A4 keep semantic families primary.

### Reorientation
- Snapshot-visible reorientation becomes a `REORIENTATION` message
- existing dismissal behavior stays intact
- dismissed reorientation does not fall through to a noisier replacement message
- richer alert inputs do not rewrite reorientation into another family

### Briefing
- `SINCE_LAST_CHECKED` stays a `BRIEFING`
- downgraded alert-worthy change may remain a calm `BRIEFING` when richer context says alert treatment would be too loud
- briefing remains quieter than alerting
- briefing is still derived from interpreted history or interpreted change, not raw event arrays

### Alert
- alerting stays stricter than "anything changed"
- only interpreted meaningful-change families are eligible
- single-symbol scope remains the preferred subject shape for inline alert treatment
- richer confirmation support can preserve an alert for history-backed borderline change
- broader or thinner context still suppresses or downgrades rather than inflating alert volume

### Referral
- referral remains a separate family for better-handled-elsewhere guidance
- referral is not a guarded stop and not a missing-data error
- richer Snapshot alert inputs do not blur Dashboard referral into alerting

### Guarded Stop
- guarded stop remains the strongest stop-style family
- it still expresses that PocketPilot should not continue a path with the current context
- it is not framed as punishment, urgency, or outage theatre
- richer Snapshot alert inputs do not weaken or rename this boundary

## Surface Discipline
P6-A4 keeps rollout deliberately narrow.

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
P6-A1 through P6-A4 do not add:
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
