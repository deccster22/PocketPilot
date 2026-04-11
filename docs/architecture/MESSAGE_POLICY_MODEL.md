# Message Policy Model (P6-A1 + P6-A2 + P6-A3 + P6-A4 + P6-A5)

## Purpose
P6-A1 added PocketPilot's canonical message-policy seam.
P6-A2 reused that seam for Dashboard `REFERRAL` and Trade Hub `GUARDED_STOP`.
P6-A3 added explicit profile sensitivity and keep, downgrade, or suppress tuning.
P6-A4 improved the interpreted inputs feeding the same seam.
P6-A5 adds one canonical user-visible rationale seam on top of that same policy path.

The result is still one policy system, not a notification platform.

Goals:
- keep message-family meaning explicit and service-owned
- keep message posture deterministic once inputs are supplied
- explain why the current message posture exists without leaking mechanics
- keep `app/` on prepared contracts only
- keep rollout inline, compact, and calm

P6-A1 through P6-A5 do not add push, inbox, unread state, badges, background jobs, generic toast infrastructure, or user-editable sensitivity settings.

## Canonical Contracts
The canonical contracts live in `services/messages/types.ts`.

```ts
type MessagePolicyKind =
  | 'BRIEFING'
  | 'ALERT'
  | 'REORIENTATION'
  | 'REFERRAL'
  | 'GUARDED_STOP'

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

type MessageRationale = {
  title: string
  summary: string
  items: readonly string[]
}

type MessageRationaleAvailability =
  | {
      status: 'UNAVAILABLE'
      reason: 'NO_RATIONALE_AVAILABLE' | 'NOT_ENABLED_FOR_SURFACE'
    }
  | {
      status: 'AVAILABLE'
      rationale: MessageRationale
    }

type MessagePolicyAvailability =
  | {
      status: 'UNAVAILABLE'
      reason: 'NO_MESSAGE' | 'NOT_ENABLED_FOR_SURFACE' | 'INSUFFICIENT_INTERPRETED_CONTEXT'
      rationale: MessageRationaleAvailability
    }
  | {
      status: 'AVAILABLE'
      messages: readonly PreparedMessage[]
      rationale: MessageRationaleAvailability
    }
```

Rules:
- `kind` remains explicit and must never be inferred by `app/`
- `PreparedMessageInputContext` remains internal service policy input, not a UI contract
- `MessageRationale` is user-facing copy, not an engineering trace
- rationale explains posture, not mechanics
- no raw IDs, provider diagnostics, runtime facts, score readouts, or signal arrays leak into rationale

## Data Flow
The message-policy seam still sits above interpreted service-owned inputs rather than app-owned heuristics.

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
-> createPreparedMessageRationale
-> MessagePolicyAvailability
-> Snapshot message zone
```

The canonical fetch path remains one entry seam:

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

`app/` renders the prepared message plus prepared rationale only.
It does not classify message families, build rationale text, re-derive tuned inputs, or expose raw runtime facts.

## Threshold And Sensitivity Rules
`services/messages/applyMessageProfileTuning.ts` still tunes only prepared alert candidates.

Sensitivity mapping stays explicit:
- `BEGINNER` -> `GUIDED`
- `MIDDLE` -> `BALANCED`
- `ADVANCED` -> `DIRECT`

Alert threshold decisions stay explicit:
- `KEEP_AS_ALERT`
- `DOWNGRADE_TO_BRIEFING`
- `SUPPRESS`

Current posture:
- strong, single-symbol, confirmed change can remain an `ALERT`
- meaningful but not fully strong change can stay a `BRIEFING`
- broader multi-symbol context stays conservative
- thin or estimated context still suppresses to no message
- `REORIENTATION`, `REFERRAL`, and `GUARDED_STOP` keep their separate meanings and precedence

P6-A5 does not change those family rules.
It explains the chosen posture after the same service-owned pass decides it.

## Rationale Shaping Rules
`services/messages/createPreparedMessageRationale.ts` is the one canonical rationale builder.

It should explain:
- why this message family surfaced
- why a change stayed a briefing instead of becoming an alert where relevant
- why the note is compact and inline on the current surface

It should not explain:
- raw event names
- confidence or percent thresholds
- provider or broker facts
- runtime degradation details
- what action the user should take

Copy posture rules:
- calm
- compact
- explanatory
- non-debuggy
- non-moralizing

Good rationale examples:
- "Shown as a briefing because the change is meaningful but not strong enough for an alert."
- "Shown as a referral because Dashboard has useful context, but Snapshot is the steadier first read right now."
- "Shown as a guarded stop because Trade Hub should keep the current boundary visible instead of carrying the path further."

## Family Rules
### Reorientation
- Snapshot-visible reorientation becomes a `REORIENTATION` message
- the rationale explains return-after-gap posture, not hidden event mechanics
- dismissed reorientation does not fall through to a louder replacement message

### Briefing
- `SINCE_LAST_CHECKED` stays a `BRIEFING`
- tuned alert candidates may downgrade to `BRIEFING`
- rationale explains why the posture stayed quieter than alert treatment

### Alert
- alerting stays stricter than "anything changed"
- rationale can explain that the change is focused enough for Snapshot's alert posture
- rationale remains compact and still points back to Snapshot rather than becoming a second detail surface

### Referral
- referral remains a better-fit routing note, not a stop or alert
- rationale explains why Snapshot is the steadier first read

### Guarded Stop
- guarded stop remains the strongest stop-style family in this seam
- rationale explains the visible boundary without framing it as punishment or outage theatre

## Surface Discipline
P6-A5 keeps rollout deliberately narrow.

That means:
- Snapshot may show one message plus one optional inline rationale treatment
- Dashboard may show one `REFERRAL` note plus one optional inline rationale treatment
- Trade Hub may show one `GUARDED_STOP` note plus one optional inline rationale treatment
- if rationale is unavailable, surfaces render nothing extra

No surface gains:
- push delivery
- inbox or unread mechanics
- notification-center behavior
- badge counts
- settings UI
- background work

## Non-Goals Preserved
P6-A1 through P6-A5 do not add:
- push notifications
- notification-center plumbing
- inbox or unread state
- background scanning
- badge counts
- urgency ladders
- user-editable threshold settings
- raw diagnostics disclosure
- app-owned copy assembly
