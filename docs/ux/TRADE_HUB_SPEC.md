# Trade Hub Spec (P5-10)

## Purpose

Trade Hub is the action surface for PocketPilot's read-only framing layer.

In P5-10 it presents:

- one primary framed action when available
- a small set of alternative framed actions
- one confirmation-safe preview for a selected plan
- one capability-aware confirmation shell for a selected plan
- one deterministic confirmation flow for a selected plan
- one non-persistent confirmation session seam for one selected plan at a time
- one execution adapter scaffold and non-executing payload preview for the selected plan
- one execution readiness gate that evaluates submission eligibility without dispatch
- one submission-intent seam that returns an explicit blocked-or-ready non-dispatch result
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

Trade Hub confirmation-session consumers consume a prepared `ConfirmationSession` VM from `services/trade/`.

The confirmation-session contract shape is:

```ts
{
  session: {
    planId: string | null,
    accountId: string | null,
    preview: TradePlanPreview | null,
    shell: TradePlanConfirmationShell | null,
    flow: ConfirmationFlow | null
  },
  actions: {
    acknowledgeStep(stepId: string): ConfirmationSession,
    unacknowledgeStep(stepId: string): ConfirmationSession,
    resetFlow(): ConfirmationSession,
    selectPlan(planId: string | null): Promise<ConfirmationSession>
  },
  scan: ForegroundScanResult
}
```

The confirmation session is an in-memory service seam, not persistence and not a global store. It owns one selected plan plus its prepared preview, shell, flow, and explicit session actions so `app/` can consume a single prepared contract.

Trade Hub detail consumers read the prepared `TradePlanPreview` from that session.

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
      acknowledged: boolean,
      required: boolean,
      acknowledgementLabel?: string
    }
  ],
  currentStepId: string,
  canProceed: boolean,
  allRequiredAcknowledged: boolean,
  blockedReason?: string
}
```

The confirmation flow is a deterministic, linear progression model derived from the confirmation shell. It scaffolds how a user would move through confirmation safely without adding execution behavior, persistence, or hidden automation.

Trade Hub execution-preview consumers also consume a prepared `ExecutionPreviewVM` from `services/trade/`.

The execution-preview contract shape is:

```ts
{
  planId: string | null,
  adapterCapability: {
    adapterId: string,
    supportsBracket: boolean,
    supportsOCO: boolean,
    supportsMarketBuy: boolean,
    supportsLimitBuy: boolean,
    supportsStopLoss: boolean,
    supportsTakeProfit: boolean
  } | null,
  pathPreview: {
    planId: string | null,
    adapterId: string,
    confirmationPathType: 'BRACKET' | 'OCO' | 'GUIDED_SEQUENCE' | 'UNAVAILABLE',
    payloadType: 'BRACKET' | 'OCO' | 'SEPARATE_ORDERS' | 'UNAVAILABLE',
    label: string,
    supported: boolean,
    executable: false
  } | null,
  payloadPreview: {
    payloadType: 'BRACKET' | 'OCO' | 'SEPARATE_ORDERS' | 'UNAVAILABLE',
    symbol: string | null,
    orderCount: number,
    fieldsPresent: string[],
    executable: false
  } | null
}
```

The execution preview is a service-owned boundary between confirmation-ready plans and future execution adapters. It remains placeholder-only, explicitly non-executable, and contains no broker call behavior.

Trade Hub execution-readiness consumers also consume a prepared `ExecutionReadiness` VM from `services/trade/`.

The execution-readiness contract shape is:

```ts
{
  eligible: boolean,
  blockers: [
    {
      code: 'NOT_ACKNOWLEDGED' | 'UNAVAILABLE_PATH' | 'CAPABILITY_MISSING' | 'NO_PLAN_SELECTED',
      message: string
    }
  ],
  warnings: [
    {
      code: 'LOW_CERTAINTY' | 'CAUTION_STATE' | 'PARTIAL_CAPABILITY',
      message: string
    }
  ],
  summary: {
    requiresAcknowledgement: boolean,
    hasUnavailablePath: boolean,
    hasCapabilityMismatch: boolean
  }
}
```

The readiness gate is a service-owned submission-eligibility seam that consumes the prepared `ConfirmationSession` plus `ExecutionPreviewVM`. It distinguishes blocking conditions from non-blocking warnings, remains deterministic, and explicitly does not submit anything.

Trade Hub submission-intent consumers also consume a prepared `SubmissionIntentResult` from `services/trade/`.

The submission-intent contract shape is:

```ts
{
  status: 'BLOCKED',
  blockers: [
    {
      code: 'NOT_ACKNOWLEDGED' | 'UNAVAILABLE_PATH' | 'CAPABILITY_MISSING' | 'NO_PLAN_SELECTED',
      message: string
    }
  ],
  warnings: [
    {
      code: 'LOW_CERTAINTY' | 'CAUTION_STATE' | 'PARTIAL_CAPABILITY',
      message: string
    }
  ]
} | {
  status: 'READY',
  adapterType: 'BRACKET' | 'OCO' | 'SEPARATE_ORDERS',
  placeholderOnly: true,
  planId: string,
  accountId: string,
  symbol: string | null,
  payloadPreview: OrderPayloadPreview[],
  warnings: [
    {
      code: 'LOW_CERTAINTY' | 'CAUTION_STATE' | 'PARTIAL_CAPABILITY',
      message: string
    }
  ]
}
```

Submission intent is the final service-owned seam before any future execution adapter. It consumes the prepared `ConfirmationSession`, `ExecutionPreviewVM`, and `ExecutionReadiness`, trusts readiness instead of recomputing it, and shapes a placeholder-only contract for later adapter work. It remains explicitly non-dispatching.

P5-7 moves raw flow-state ownership out of `app/` and adds a small service-owned confirmation-session action API:

- `acknowledgeStep(stepId)`
- `unacknowledgeStep(stepId)`
- `resetFlow()`
- `selectPlan(planId | null)`

These actions live in `services/trade/` and deterministically recompute the prepared session after each user-driven change. They do not persist state, auto-advance steps, construct orders, or execute anything.

P5-8 adds:

- `getExecutionAdapterCapability(shell)`
- `createExecutionPayloadPreview({ confirmationSession | confirmationShell })`
- `fetchExecutionPreviewVM({ confirmationSession })`

P5-9 adds:

- `createExecutionReadiness({ confirmationSession, executionPreview })`
- `fetchExecutionReadinessVM({ confirmationSession, executionPreview })`

P5-10 adds:

- `createSubmissionIntent({ confirmationSession, executionPreview, executionReadiness })`
- `fetchSubmissionIntentVM({ confirmationSession })`

These execution-preview seams live in `services/trade/` and shape adapter capability plus payload placeholders only. They do not submit orders, hold secrets, or expose silently executable payloads.
The readiness seams live beside them in `services/trade/` and evaluate eligibility only. They do not recompute confirmation logic, construct real payloads, dispatch to brokers, or imply that execution exists in this phase.
The submission-intent seams live after readiness and shape the final pre-adapter placeholder contract only. They do not dispatch, call brokers, persist intent, or construct live broker payloads.

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
The screen may invoke prepared confirmation-session actions, but it must not own raw confirmation-flow state or recompute preview, shell, or flow locally.
The screen may render prepared execution-preview labels, but it must not construct payload fields, adapter capability, or execution paths on its own.
The screen may render prepared readiness blockers, warnings, and summaries, but it must not derive submission eligibility or validation rules on its own.
The screen may render prepared submission-intent status, blockers, warnings, and placeholder summaries, but it must not construct submission contracts or adapter payloads on its own.

## Safety Posture

Trade Hub is support, not enforcement.

In P5-10:

- no trade execution exists
- no one-tap action exists
- no hidden automation exists
- confirmation session remains user-driven and in-memory only
- acknowledgement remains explicit and reversible
- no execution guarantee is implied by a capability-aware path
- order and execution preview fields remain explicit placeholders only
- payload previews remain explicit placeholders with `executable: false`
- readiness warnings never make a session eligible or ineligible on their own
- readiness blockers are explicit and remain non-dispatching
- submission intent remains explicit, placeholder-only, and non-dispatching even when ready

The confirmation shell remains intentionally presentation-safe rather than execution-safe. The confirmation flow is derived from that shell, the session seam owns the selected-plan composition, the execution preview defines the adapter boundary, the readiness gate evaluates eligibility, and the submission-intent seam shapes the final pre-adapter placeholder contract without introducing real execution.

## Intentional Exclusions

P5-8 does not add:

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
- `ConfirmationFlow` turns the selected `TradePlanConfirmationShell` into a step-based, user-driven confirmation contract with explicit acknowledgement state.
- `ConfirmationSession` owns one selected plan plus its prepared preview, shell, flow, and action closures for the Trade Hub confirmation seam.
- `ExecutionPreviewVM` consumes the selected confirmation session and produces adapter capability plus non-executing payload placeholders for future adapter work.
- `ExecutionReadiness` consumes the selected confirmation session plus prepared execution preview and produces explicit eligibility, blockers, warnings, and summary state without dispatch.
- `SubmissionIntentResult` consumes the selected confirmation session, prepared execution preview, and prepared execution readiness to produce an explicit blocked-or-ready placeholder submission contract without dispatch.

The boundary remains:

`MarketEvent -> OrientationContext -> ProtectionPlan -> TradeHubSurfaceModel -> ConfirmationSession { TradePlanPreview / TradePlanConfirmationShell / ConfirmationFlow } -> ExecutionPreviewVM -> ExecutionReadiness -> SubmissionIntentResult -> app`
