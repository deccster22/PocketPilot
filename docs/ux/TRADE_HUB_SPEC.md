# Trade Hub Spec (P5-5)

## Purpose
Trade Hub is the action surface for PocketPilot's read-only framing layer.

In P5-5 it presents:
- one primary framed action when available
- a small set of alternative framed actions
- one confirmation-safe preview for a selected plan
- one capability-aware confirmation shell for a selected plan
- one deterministic confirmation flow for a selected plan
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

Trade Hub confirmation consumers also consume a prepared `TradePlanConfirmationShell` from `services/trade/`.

The confirmation shell contract shape is:

```ts
{
  planId: string,
  headline: {
    intentType: 'ACCUMULATE' | 'REDUCE' | 'HOLD' | 'WAIT',
    symbol: string | null,
    actionState: 'READY' | 'CAUTION' | 'WAIT'
  },
  readiness: {
    alignment: 'ALIGNED' | 'NEUTRAL' | 'MISALIGNED',
    certainty: 'HIGH' | 'MEDIUM' | 'LOW'
  },
  confirmation: {
    requiresConfirmation: true,
    pathType: 'BRACKET' | 'OCO' | 'GUIDED_SEQUENCE' | 'UNAVAILABLE',
    stepsLabel: string,
    executionAvailable: boolean
  },
  constraints: {
    cooldownActive?: boolean,
    maxPositionSize?: number
  },
  placeholders: {
    orderPayloadAvailable: boolean,
    executionPreviewAvailable: boolean
  }
}
```

The confirmation shell is a prepared UI contract that combines a selected `TradePlanPreview`-adjacent plan shape with deterministic account capability context. It describes what confirmation would require on the current platform path without creating a real order ticket, routing logic, or live payload.

Trade Hub confirmation-flow consumers also consume a prepared `ConfirmationFlow` from `services/trade/`.

The confirmation-flow contract shape is:

```ts
{
  planId: string,
  steps: [
    {
      stepId: string,
      type: 'REVIEW' | 'CONSTRAINT_CHECK' | 'CONFIRM_INTENT' | 'UNAVAILABLE',
      label: string,
      completed: boolean,
      required: boolean
    }
  ],
  currentStepId: string,
  canProceed: boolean,
  blockedReason?: string
}
```

The confirmation flow is a deterministic, linear progression model derived from the confirmation shell. It scaffolds how a user would move through confirmation safely without adding execution behavior, persistence, or hidden automation.

## Presentation Rules
- Trade Hub shows one primary plan and limited alternatives.
- Alternatives are capped by profile to reduce overload.
- `actionState` stays explicit:
  - `READY`
  - `CAUTION`
  - `WAIT`
- `requiresConfirmation` remains `true` in this phase.
- `pathType` remains explicit and deterministic:
  - `BRACKET`
  - `OCO`
  - `GUIDED_SEQUENCE`
  - `UNAVAILABLE`

The screen may format labels for readability, but it must not reprioritise plans or derive new action logic.
The screen may format preview labels for readability, but it must not construct rationale, readiness, or constraints on its own.
The screen may format confirmation shell labels for readability, but it must not derive capability paths or execution availability on its own.
The screen may format confirmation flow labels for readability, but it must not infer steps, blocked states, or progression rules on its own.

## Safety Posture
Trade Hub is support, not enforcement.

In P5-5:
- no trade execution exists
- no one-tap action exists
- no hidden automation exists
- confirmation flow remains user-driven and in-memory only
- no execution guarantee is implied by a capability-aware path
- order and execution preview fields remain explicit placeholders only

The confirmation shell remains intentionally presentation-safe rather than execution-safe. The confirmation flow is derived from that shell so later phases can add adapter seams without moving decision logic into `app/`.

## Intentional Exclusions
P5-5 does not add:
- exchange connectivity
- order entry
- live order payload construction
- order submission
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
- `TradePlanConfirmationShell` combines a selected `ProtectionPlan` with deterministic account capability context so the app can show a confirmation-safe path without containing capability logic.
- `ConfirmationFlow` turns the selected `TradePlanConfirmationShell` into a step-based, user-driven confirmation contract.

The boundary remains:

`MarketEvent -> OrientationContext -> ProtectionPlan -> TradeHubSurfaceModel / TradePlanPreview / TradePlanConfirmationShell -> ConfirmationFlow -> app`
