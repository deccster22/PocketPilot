# Trade Hub Spec (P5-2)

## Purpose
Trade Hub is the action surface for PocketPilot's read-only framing layer.

In P5-2 it presents:
- one primary framed action when available
- a small set of alternative framed actions
- explicit confirmation-safe posture

The surface helps the user understand what kind of action PocketPilot is framing without executing anything.

## Surface Contract
Trade Hub consumes a prepared `TradeHubSurfaceModel` from `services/trade/`.

The contract shape is:

```ts
{
  primaryPlan: TradeHubPlanCard | null,
  alternativePlans: TradeHubPlanCard[],
  meta: {
    hasPrimaryPlan: boolean,
    profile: UserProfile,
    requiresConfirmation: boolean
  }
}
```

Each `TradeHubPlanCard` contains:
- `planId`
- `intentType`
- `symbol`
- `alignment`
- `certainty`
- `summary`
- `supportingEventCount`
- `actionState`

No raw market events, signal codes, or hidden strategy metadata are exposed to the UI.

## Presentation Rules
- Trade Hub shows one primary plan and limited alternatives.
- Alternatives are capped by profile to reduce overload.
- `actionState` stays explicit:
  - `READY`
  - `CAUTION`
  - `WAIT`
- `requiresConfirmation` remains `true` in this phase.

The screen may format labels for readability, but it must not reprioritise plans or derive new action logic.

## Safety Posture
Trade Hub is support, not enforcement.

In P5-2:
- no trade execution exists
- no one-tap action exists
- no hidden automation exists
- no confirmation flow is implemented yet

The contract is intentionally shaped so later phases can add confirmation and order-preview steps without moving decision logic into `app/`.

## Intentional Exclusions
P5-2 does not add:
- exchange connectivity
- order entry
- notifications
- journaling
- exports
- AI-generated explanations
- charting
- new Snapshot or Dashboard behavior
