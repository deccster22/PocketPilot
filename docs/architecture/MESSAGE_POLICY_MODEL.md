# Message Policy Model (P6-A1)

## Purpose
P6-A1 adds PocketPilot's first canonical alert and message policy foundation.

This is a policy seam, not a notification platform.

The goal is to:
- keep product messaging service-owned
- classify a small set of message families explicitly
- preserve the line between briefing, alerting, reorientation, referral, and guarded-stop messaging
- keep Snapshot calm while broader `P6` work remains out of scope

P6-A1 does not add push, inbox, unread state, badges, modals, background jobs, or urgency escalation.

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

type MessageSurfaceEligibility = 'SNAPSHOT' | 'DASHBOARD' | 'TRADE_HUB' | 'NONE'

type PreparedMessage = {
  kind: MessagePolicyKind
  title: string
  summary: string
  priority: MessagePriority
  surface: MessageSurfaceEligibility
  dismissible: boolean
}

type MessagePolicyAvailability =
  | {
      status: 'UNAVAILABLE'
      reason:
        | 'NO_MESSAGE'
        | 'NOT_ENABLED_FOR_SURFACE'
        | 'INSUFFICIENT_INTERPRETED_CONTEXT'
    }
  | {
      status: 'AVAILABLE'
      messages: readonly PreparedMessage[]
    }
```

Rules:
- `kind` is explicit and never inferred by `app/`
- `surface` is explicit and service-owned
- `summary` is calm product copy, not raw event metadata
- no push-delivery metadata exists here
- no unread, badge, inbox, engagement, or reminder fields exist here
- no raw IDs, provider diagnostics, or strategy implementation details leak here

## Data Flow
P6-A1 sits above the existing interpreted Snapshot and reorientation seams:

```text
EventLedger
-> EventLedgerQueries
-> Since Last Checked
-> OrientationContext
-> SnapshotModel
-> ReorientationSurfaceState
-> SnapshotBriefingState
-> createMessagePolicyVM
-> MessagePolicyAvailability
-> Snapshot message zone
```

The canonical fetch path is:

```text
fetchSnapshotSurfaceVM
-> fetchMessagePolicyVM
-> app/screens/snapshotScreenView.ts
-> SnapshotScreen
```

`app/` renders the prepared contract only.
It does not decide whether something is a briefing, alert, reorientation prompt, referral, or guarded stop.

## Classification Rules
P6-A1 keeps the rules intentionally narrow.

### Reorientation
- Snapshot-visible reorientation becomes a `REORIENTATION` message
- existing dismissal behavior stays intact
- dismissed reorientation does not fall through to a noisier replacement message

### Briefing
- `SINCE_LAST_CHECKED` stays a `BRIEFING`
- it remains quieter than alerting
- it is still derived from interpreted history, not raw event arrays

### Alert
- only confirmed, interpreted meaningful-change events are eligible
- P6-A1 keeps alerting stricter than "anything changed"
- beginner profile does not get the thin first alert path in this phase
- alerting stays inline and foreground-only

### Referral
- referral remains a separate family for out-of-scope or better-handled-elsewhere guidance
- referral is not a guarded stop and not a missing-data error

### Guarded Stop
- guarded stop remains the strongest stop-style family
- it expresses that PocketPilot should not continue a path with the current context
- it is not framed as punishment, urgency, or system failure theatre

## Surface Discipline
P6-A1 adds only one consumer path: Snapshot.

That means:
- Snapshot may show `REORIENTATION`, `BRIEFING`, or a thin `ALERT`
- referral and guarded-stop families are modeled explicitly but not broadly rolled out yet
- Dashboard and Trade Hub do not gain message-center behavior in this phase

Availability rules stay explicit:
- `AVAILABLE` when a prepared message is eligible for the requested surface
- `NOT_ENABLED_FOR_SURFACE` when a prepared message exists but belongs elsewhere
- `NO_MESSAGE` when context exists but does not justify messaging
- `INSUFFICIENT_INTERPRETED_CONTEXT` when service-owned context is too thin

## Non-Goals Preserved
P6-A1 does not add:
- push notifications
- notification-center plumbing
- inbox or unread state
- background scanning
- badge counts
- urgency ladders
- per-surface message rollouts
- AI-generated messaging
- app-owned copy assembly
