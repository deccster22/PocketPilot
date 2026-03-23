# Trade Hub Spec (P5-3)

## Purpose
Trade Hub is the action surface for PocketPilot's read-only framing layer.

In P5-3 it presents:
- one primary framed action when available
- a small set of alternative framed actions
- one confirmation-safe preview for a selected plan
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

Trade Hub detail consumers also consume a prepared `TradePlanPreview` from `services/trade/`.

The preview contract shape is:

```ts
{
  planId: string,
  headline: {
    intentType: 'ACCUMULATE' | 'REDUCE' | 'HOLD' | 'WAIT',
    symbol: string | null,
    actionState: 'READY' | 'CAUTION' | 'WAIT'
  },
  rationale: {
    summary: string,
    primaryEventId: string | null,
    supportingEventIds: string[],
    supportingEventCount: number
  },
  constraints: {
    requiresConfirmation: true,
    maxPositionSize?: number,
    cooldownActive?: boolean
  },
  readiness: {
    alignment: 'ALIGNED' | 'NEUTRAL' | 'MISALIGNED',
    certainty: 'HIGH' | 'MEDIUM' | 'LOW'
  },
  placeholders: {
    orderPreviewAvailable: boolean,
    executionPreviewAvailable: boolean
  }
}
```

The preview is for future confirmation UI scaffolding. It expands exactly one selected plan into safe detail without adding execution behavior.

## Presentation Rules
- Trade Hub shows one primary plan and limited alternatives.
- Alternatives are capped by profile to reduce overload.
- `actionState` stays explicit:
  - `READY`
  - `CAUTION`
  - `WAIT`
- `requiresConfirmation` remains `true` in this phase.

The screen may format labels for readability, but it must not reprioritise plans or derive new action logic.
The screen may format preview labels for readability, but it must not construct rationale, readiness, or constraints on its own.

## Safety Posture
Trade Hub is support, not enforcement.

In P5-3:
- no trade execution exists
- no one-tap action exists
- no hidden automation exists
- no confirmation flow is implemented yet
- order and execution preview fields remain explicit placeholders only

The contract is intentionally shaped so later phases can add confirmation and order-preview steps without moving decision logic into `app/`.

## Intentional Exclusions
P5-3 does not add:
- exchange connectivity
- order entry
- notifications
- journaling
- exports
- AI-generated explanations
- charting
- new Snapshot or Dashboard behavior

## Relationship Between Layers
- `ProtectionPlan` remains the canonical action-framing object.
- `TradeHubSurfaceModel` remains the list/card contract for primary and alternative plans.
- `TradePlanPreview` expands one selected `ProtectionPlan` into confirmation-safe detail for the Trade Hub detail layer.

The boundary remains:

`MarketEvent -> OrientationContext -> ProtectionPlan -> TradeHubSurfaceModel / TradePlanPreview -> app`
