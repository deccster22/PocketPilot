# Trade Hub Spec (P5-X + P5-R13 + P5-R14 + P5-R15 + P5-R16 + P7-K8 + P7-K9 + P7-K10)

## Purpose

Trade Hub is the action surface for PocketPilot's read-only framing layer.

In P5-11 it presents:

- one primary framed action when available
- a small set of alternative framed actions
- one confirmation-safe preview for a selected plan
- one support-only risk-tool summary for a selected plan plus explicit user inputs
- one capability-aware confirmation shell for a selected plan
- one deterministic confirmation flow for a selected plan
- one non-persistent confirmation session seam for one selected plan at a time
- one execution adapter scaffold and non-executing payload preview for the selected plan
- one execution readiness gate that evaluates submission eligibility without dispatch
- one submission-intent seam that returns an explicit blocked-or-ready non-dispatch result
- one execution-adapter seam that returns an explicit blocked-or-simulated response without dispatch
- explicit confirmation-safe posture

The surface helps the user understand what kind of action PocketPilot is framing without executing anything.

P6-A2 adds one optional message-policy note above the same prepared surface:
- one inline `MessagePolicyLane` result from `services/messages/fetchMessagePolicyVM`
- it remains separate from the `TradeHubSurfaceModel` contract and from confirmation/readiness/execution seams
- it does not add notification mechanics or order behavior
P6-A5 adds one optional prepared rationale on that same message-policy result:
- it stays inside the existing inline note posture
- it explains the boundary calmly without becoming a debug panel
- it does not add settings or delivery mechanics
P6-A6 keeps the same note grouped as one lane so the screen helper reads one service-owned policy-and-rationale contract instead of threading separate ad hoc message fields.
P5-R9 adds one optional risk-input guidance note inside the selected-plan preview:
- it explains thin or unsupported sizing context calmly and explicitly
- it stays service-owned and non-enforcing
- it does not add troubleshooting flows or validation walls

## P7-K4 Contextual Knowledge Follow-Through
Trade Hub now has one optional contextual-knowledge lane on the same prepared service path.

Rules:
- the lane comes from `services/knowledge/createContextualKnowledgeLane`
- it is service-owned, profile-shaped, and relevance-shaped
- beginner users can see a little more of the lane than advanced users
- render it only when the prepared lane is honestly available and non-empty
- keep it compact, calm, and subordinate to the action-support contract
- do not turn it into a feed, tutorial stack, or gating mechanism
- app code only renders prepared topic links and topic detail routes; it does not choose topics locally
- the lane never locks execution, disables plans, or changes read-only behavior

## P7-K5 Contextual Knowledge Density / Placement Refinement
Trade Hub now also consumes the same contextual lane through one explicit prepared presentation contract so the shelf can stay smaller and quieter on the action surface.

Rules:
- `services/knowledge/createContextualKnowledgePresentation.ts` owns the prepared density and placement result
- the presentation is explicit: `maxVisibleTopics`, `emphasis`, and `shouldRenderShelf`
- Trade Hub stays more bounded than Dashboard even when the lane is available
- the shelf may stay hidden when the prepared context is too thin for the current profile or surface
- `app/` renders the prepared title, summary, and topic links only
- no local topic selection, recommendation feed behavior, gating behavior, or execution-lock behavior is introduced

## P7-K6 Contextual Knowledge Topic-Linkage Expansion
Trade Hub now links live context to better prepared topics before the existing K5 presentation contract decides how much of the lane should appear.

Rules:
- `services/knowledge/selectContextualKnowledgeTopics.ts` owns the topic-linkage ranking seam
- ranking can use strategy, signal, event, and Trade Hub surface context already prepared by services
- the lane remains optional, calm, and subordinate to the action-support contract
- `app/` still renders prepared topics only and does not select or rank them locally
- the K5 presentation contract remains intact, so density and placement behavior do not change
- the lane still never locks execution, disables plans, or changes read-only behavior

## P7-K7 Topic-Detail Context Framing
Trade Hub keeps the same contextual shelf and the same topic-detail navigation path, but a tap from that shelf can now carry one small prepared context frame into the detail view.

Rules:
- `services/knowledge/createKnowledgeTopicContextFraming.ts` owns the prepared topic-detail relevance frame
- `services/knowledge/createKnowledgeTopicDetailVM.ts` threads the frame into the prepared topic detail contract
- `app/` passes prepared origin metadata only and renders the frame only when the service says it is available
- the frame stays optional, calm, and subordinate to the topic detail body
- the shelf still behaves exactly as it did in K4/K5/K6
- no gating, recommendation feed, inbox, or execution-lock behavior is introduced

## P7-K8 Inline Glossary / Keyword Help
Trade Hub now supports one narrow inline glossary-help proof path on calm explanatory copy.

Rules:
- `services/knowledge/createInlineGlossaryHelp.ts` prepares the inline block; `app/` only renders prepared segments
- profile shaping stays service-owned (`BEGINNER` strongest, `MIDDLE` lighter, `ADVANCED` minimal by default)
- seen-term acknowledgement stays service-owned through `services/knowledge/inlineGlossarySeenState.ts`
- term taps route to the existing `KnowledgeTopicScreen` path
- no app-side term matching, ranking, broad auto-linking, or modal tooltip swarm is introduced
- no gating, execution lock, push, inbox, or notification behavior is introduced

## P7-K9 Glossary Alias / Matching Normalization
Trade Hub keeps the same K8 inline glossary proof path, but service-owned matching quality improves through alias normalization.

Rules:
- `services/knowledge/createGlossaryTermIndex.ts` owns canonical term + alias normalization for Trade Hub safety copy
- `services/knowledge/selectInlineGlossaryTerms.ts` consumes that normalized index and keeps matching deterministic
- generic noisy terms are intentionally suppressed rather than broadly linked
- `app/` keeps render-only behavior and does not perform local term matching
- no new Trade Hub glossary surfaces, gating behavior, or execution-lock behavior are introduced

## P7-K10 Inline Glossary Exposure Signals / Tuning Hooks
Trade Hub keeps the same K8/K9 inline glossary proof path while services collect compact internal aggregate surfaced/acknowledged signals.

Rules:
- signal recording and summary shaping remain service-owned and invisible to users
- no Trade Hub analytics/debug panel or operator surface is added
- no network telemetry/export path is introduced in this phase
- no execution gating or action-lock behavior is introduced through glossary signals

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
    executionCapability: ExecutionCapabilityResolution | null,
    preparedRiskReferences: {
      entryPrice: number | null,
      stopPrice: number | null,
      targetPrice: number | null
    } | null,
    preparedTradeReferences: {
      status: 'UNAVAILABLE',
      reason: 'NO_STRATEGY_REFERENCE' | 'THIN_CONTEXT' | 'NOT_ENABLED_FOR_SURFACE'
    } | {
      status: 'AVAILABLE',
      references: {
        kind: 'STOP' | 'TARGET',
        label: string,
        value: string,
        sourceLabel: string,
        limitations?: string[]
      }[]
    } | null,
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

The confirmation session is an in-memory service seam, not persistence and not a global store. It owns one selected plan plus its optional prepared risk references, prepared preview, shell, flow, and explicit session actions so `app/` can consume a single prepared contract.

Trade Hub risk-tool consumers also consume a prepared `RiskToolVM` from `services/risk/`.

The risk-tool contract shape is:

```ts
{
  generatedAt: string | null,
  summary: {
    state: 'UNAVAILABLE' | 'INCOMPLETE' | 'READY',
    symbol: string | null,
    entryPrice: number | null,
    stopPrice: number | null,
    targetPrice: number | null,
    entryReference: {
      value: number | null,
      source: 'USER_INPUT' | 'PREPARED_QUOTE' | 'PREPARED_PLAN' | 'UNAVAILABLE'
    },
    stopReference: {
      value: number | null,
      source: 'USER_INPUT' | 'PREPARED_QUOTE' | 'PREPARED_PLAN' | 'UNAVAILABLE'
    },
    targetReference: {
      value: number | null,
      source: 'USER_INPUT' | 'PREPARED_QUOTE' | 'PREPARED_PLAN' | 'UNAVAILABLE'
    },
    stopDistance: number | null,
    riskAmount: number | null,
    riskPercent: number | null,
    positionSize: number | null,
    rewardRiskRatio: number | null,
    notes: string[]
  }
}
```

The risk-tool seam is support-only. It consumes prepared confirmation-session context, optional prepared quote context, and explicit user inputs and returns a calm sizing summary without constructing orders, implying execution readiness, or leaking provider/runtime detail.
Prepared plan references may supply entry, stop, or target values when the selected confirmation session honestly carries them.
P5-R4 deepens that support by improving the service-owned producer path upstream of the confirmation session, not by adding app-side interpretation.
P5-R5 keeps that UI contract unchanged and only enriches the upstream producer path when scoped strategy/event context can honestly support a calm prepared stop or target.
P5-R13 adds one explicit prepared stop/target availability contract with source labels and thin-context unavailability so the same service seams can expose richer references without inventing precision.
P5-R14 keeps that same contract and adds one canonical service-owned copy seam so source labels, limitation notes, and unavailable wording stay calm, explicit, and consistent without downstream rewrites.
P5-R15 keeps those same service-owned seams and adds one compact Trade Hub preview render path for prepared stop/target availability:
- available references render as-is from prepared service labels/source/limitations
- one compact limitation note is shown when present
- unavailable copy stays quiet and only appears when the service-owned visibility policy says it is useful
P5-R15 terminology alignment keeps internal service/type naming stable (`*Reference*` contracts) while preferring planning-level wording in user-facing copy:
- `Entry price`, `Stop-loss price`, `Target price`
- `Asset symbol` or `Symbol`
- `Prepared planning levels`
- `Prepared stop-loss level` and `Prepared target level`
- `Optional planning context from the selected plan. Your own values remain authoritative.`
- `Your own values override prepared planning levels`
P5-R16 keeps the same semantics and extends plain-language copy cleanup to Trade Hub section labels and execution-boundary status wording:
- avoid user-facing seam jargon such as `service-owned` and `seam` in section labels
- prefer labels like `Planning view`, `Prepared sizing summary`, `Submission readiness check`, `Submission check`, and `Execution handoff`
- keep one explicit non-dispatch boundary line visible on-screen (for example, `This screen does not place trades.`)
Explicit user values still win, prepared plan references outrank prepared quote help for the same field, and quote help still does not invent exits.

`ExecutionCapabilityResolution` is:

```ts
{
  accountId: string,
  path: 'BRACKET' | 'OCO' | 'SEPARATE_ORDERS' | 'UNAVAILABLE',
  confirmationPath: 'BRACKET' | 'OCO' | 'GUIDED_SEQUENCE' | 'UNAVAILABLE',
  supported: boolean,
  unavailableReason: string | null
}
```

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
  },
  preparedTradeReferences: {
    status: 'UNAVAILABLE',
    reason: 'NO_STRATEGY_REFERENCE' | 'THIN_CONTEXT' | 'NOT_ENABLED_FOR_SURFACE'
  } | {
    status: 'AVAILABLE',
    references: {
      kind: 'STOP' | 'TARGET',
      label: string,
      value: string,
      sourceLabel: string,
      limitations?: string[]
    }[]
  },
  riskInputGuidance: {
    status: 'UNAVAILABLE' | 'AVAILABLE',
    reason?: 'NO_GUIDANCE_NEEDED' | 'NOT_ENABLED_FOR_SURFACE',
    guidance?: {
      title: string,
      summary: string,
      items: string[]
    }
  }
}
```

The preview is for future confirmation UI scaffolding. It expands exactly one selected plan into safe detail without adding execution behavior.
When available, the risk-input guidance note stays subordinate to the main preview and explains what the prepared sizing lane still needs without turning into enforcement or troubleshooting theatre.
Prepared stop/target references stay optional and explicit on the same preview contract, and unavailable states remain quiet when context is thin.
Prepared source labels and limitations are service-owned output and should be rendered as-is by downstream consumers.
Prepared unavailable wording should be consumed from services without app-side phrasing rules, and visibility should stay conservative and non-blocking.

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
  capabilityResolution: {
    accountId: string,
    path: 'BRACKET' | 'OCO' | 'SEPARATE_ORDERS' | 'UNAVAILABLE',
    confirmationPath: 'BRACKET' | 'OCO' | 'GUIDED_SEQUENCE' | 'UNAVAILABLE',
    supported: boolean,
    unavailableReason: string | null
  } | null,
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

The execution preview is a service-owned boundary between confirmation-ready plans and future execution adapters. It remains placeholder-only, explicitly non-executable, and contains no broker call behavior. Canonical capability truth is carried into this seam rather than recomputed from shell display fields. User-facing wording should describe this seam as prepared preview scaffolding, not as live order entry.

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

The readiness gate is a service-owned submission-eligibility seam that consumes the prepared `ConfirmationSession` plus `ExecutionPreviewVM`. It distinguishes blocking conditions from non-blocking warnings, remains deterministic, explicitly does not submit anything, and trusts canonical capability for supported-versus-unavailable path truth.

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

Submission intent is the final service-owned seam before any future execution adapter. It consumes the prepared `ConfirmationSession`, `ExecutionPreviewVM`, and `ExecutionReadiness`, trusts readiness instead of recomputing it, trusts canonical capability instead of inferring adapter type from payload shape, and shapes a placeholder-only contract for later adapter work. It remains explicitly non-dispatching. User-facing wording should describe `READY` here as readiness for simulated handoff, not readiness to place a trade.

Trade Hub execution-adapter consumers also consume a prepared `ExecutionAdapterAttemptResult` from `services/trade/`.

The execution-adapter contract shape is:

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
  status: 'SIMULATED',
  dispatchEnabled: false,
  placeholderOnly: true,
  adapterType: 'BRACKET' | 'OCO' | 'SEPARATE_ORDERS',
  outcome: 'SIMULATED_ACCEPTABLE' | 'SIMULATED_UNAVAILABLE',
  simulatedOrderIds: string[],
  executionSummary: {
    planId: string,
    accountId: string,
    symbol: string | null,
    orderCount: number,
    path: 'BRACKET' | 'OCO' | 'SEPARATE_ORDERS'
  },
  warnings: [
    {
      code: 'LOW_CERTAINTY' | 'CAUTION_STATE' | 'PARTIAL_CAPABILITY',
      message: string
    }
  ]
}
```

The execution-adapter seam sits after submission intent, consumes only submission intent, and returns a deterministic simulated response contract. It does not re-fetch readiness, rebuild submission intent, inspect confirmation internals, or dispatch orders. User-facing wording should describe `SIMULATED` here as a simulated handoff response, not as an accepted or filled live order.

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

P5-11 adds:

- `createExecutionAdapterResponse(submissionIntent)`
- `fetchExecutionAdapterResponseVM({ submissionIntent })`

P5-13 adds:

- `resolveExecutionCapability(capabilities)`
- `ExecutionCapabilityResolution`

These execution-preview seams live in `services/trade/` and shape adapter capability plus payload placeholders only. They do not submit orders, hold secrets, or expose silently executable payloads.
The capability-resolution seam lives upstream in `services/trade/` and resolves execution-path truth once. It does not own readiness, submission intent, adapter response, or UI copy.
The readiness seams live beside them in `services/trade/` and evaluate eligibility only. They do not recompute confirmation logic, re-derive capability truth, construct real payloads, dispatch to brokers, or imply that execution exists in this phase.
The submission-intent seams live after readiness and shape the final pre-adapter placeholder contract only. They do not dispatch, call brokers, persist intent, construct live broker payloads, or re-derive capability locally.
The execution-adapter seams live after submission intent and shape deterministic simulated adapter responses only. They do not call brokers, dispatch orders, recompute earlier seams, or imply that live execution exists.

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
The screen may render a prepared message-policy note, but it must not decide whether a Trade Hub state is a guarded stop on its own.
The screen may format preview labels for readability, but it must not construct rationale, readiness, or constraints on its own.
The screen may collect explicit risk-tool inputs and render prepared risk-tool values plus calm source labels, but it must not calculate stop distance, position size, reward/risk, or local reference precedence on its own.
Prepared risk references should read like optional support context, not as auto-filled execution intent, and explicit user values remain authoritative when entered.
Prepared plan references should become more useful quietly when the selected plan already carries honest producer-owned values; if no honest value exists, the surface should stay quiet.
Prepared strategy-owned stop or target references should keep the same prepared-plan label and should not introduce extra UI drama or technical source detail.
Unavailable references should stay visually quiet; "Not set" is enough when the prepared plan has nothing honest to contribute.
Prepared stop/target availability reasons should remain service-owned and should never be derived in `app/`.
Prepared stop/target rendering should remain compact and subordinate inside the existing Plan Preview support lane, not as a separate planning widget.
Prepared terminology in user-facing copy should favor planning-level terms, while internal service contract names may keep reference-oriented naming for stability.
The screen may format confirmation shell labels for readability, but it must not derive capability paths or execution availability on its own.
The screen may format confirmation flow labels for readability, but it must not infer steps, blocked states, or progression rules on its own.
The screen may invoke prepared confirmation-session actions, but it must not own raw confirmation-flow state or recompute preview, shell, or flow locally.
The screen may render prepared execution-preview labels, but it must not construct payload fields, adapter capability, or execution paths on its own.
The screen may render prepared readiness blockers, warnings, and summaries, but it must not derive submission eligibility or validation rules on its own.
The screen may render prepared submission-intent status, blockers, warnings, and placeholder summaries, but it must not construct submission contracts or adapter payloads on its own.
The screen may render prepared execution-adapter attempt status, summaries, and simulated identifiers, but it must not select adapter paths, shape simulated responses, or dispatch anything on its own.

P5-X also requires the following execution-boundary wording rules:

- use calm, explicit labels such as "Execution path unavailable", "Submission check is blocked", and "Simulated handoff response prepared"
- do not imply urgency, pressure, or one-click action
- do not describe blocked or unavailable states like system failures unless that is actually the seam truth
- do not present simulated states as confirmed execution outcomes
- keep confirmation wording clearly upstream of dispatch
- keep one plain-language no-trade boundary line visible on the surface (for example, "This screen does not place trades.")

## Trade Hub Guarded Stop Note (P6-A2)
Trade Hub now has one optional message-policy note only:
- `GUARDED_STOP`

Rules:
- render it only when the canonical message-policy seam returns an eligible `GUARDED_STOP`
- reserve it for product-boundary conditions, not routine acknowledgement or readiness states
- keep it calm, explicit, and inline
- do not restyle it like a punitive warning, outage banner, or execution CTA
- keep it distinct from confirmation-shell, readiness, submission-intent, and adapter-result wording
- if rationale is available, render one small inline "why this is here" treatment only
- rationale must not expose capability internals beyond the user-facing boundary already chosen by services

The current rollout uses guarded stop only when the selected confirmation session has no protected execution path.
That preserves the line between:
- boundary stop
- readiness blocker
- simulated adapter result

## Safety Posture

Trade Hub is support, not enforcement.

In P5-11:

- no trade execution exists
- no one-tap action exists
- no hidden automation exists
- confirmation session remains user-driven and in-memory only
- risk-tool output remains support-only and does not upgrade a plan into execution readiness
- acknowledgement remains explicit and reversible
- no execution guarantee is implied by a capability-aware path
  In P5-3:
- no trade execution exists
- no one-tap action exists
- no hidden automation exists
- no confirmation flow is implemented yet
- order and execution preview fields remain explicit placeholders only
- payload previews remain explicit placeholders with `executable: false`
- readiness warnings never make a session eligible or ineligible on their own
- readiness blockers are explicit and remain non-dispatching
- submission intent remains explicit, placeholder-only, and non-dispatching even when ready
- execution-adapter responses remain explicit, simulated-only, and non-dispatching even when accepted
- cross-seam invariant tests must keep adjacent seams from disagreeing about availability, readiness, adapter type, or simulation posture

The confirmation shell remains intentionally presentation-safe rather than execution-safe. The confirmation flow is derived from that shell, the session seam owns the selected-plan composition, the execution preview defines the adapter boundary, the readiness gate evaluates eligibility, the submission-intent seam shapes the final pre-adapter placeholder contract, and the execution-adapter seam returns a simulated-only post-intent response without introducing real execution.

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
- `RiskToolVM` expands one selected Trade Hub context plus explicit user inputs and optional prepared references into a calm, non-dispatching sizing summary.
- `ConfirmationSession` owns one selected plan plus optional prepared plan risk references, prepared preview, shell, flow, and action closures for the Trade Hub confirmation seam.
- `TradePlanConfirmationShell` combines a selected `ProtectionPlan` with deterministic account capability context so the app can show a confirmation-safe path without containing capability logic.
- `ExecutionCapabilityResolution` is the canonical capability seam that resolves internal execution path and confirmation-facing path once for downstream consumers.
- `ConfirmationFlow` turns the selected `TradePlanConfirmationShell` into a step-based, user-driven confirmation contract with explicit acknowledgement state.
- `ExecutionPreviewVM` consumes the selected confirmation session plus canonical execution capability and produces adapter capability plus non-executing payload placeholders for future adapter work.
- `ExecutionReadiness` consumes the selected confirmation session plus prepared execution preview and uses canonical capability to produce explicit eligibility, blockers, warnings, and summary state without dispatch.
- `SubmissionIntentResult` consumes the selected confirmation session, prepared execution preview, and prepared execution readiness to produce an explicit blocked-or-ready placeholder submission contract without dispatch or path re-derivation.
- `ExecutionAdapterAttemptResult` consumes the selected submission intent result and produces an explicit blocked-or-simulated adapter response without dispatch.
- P5-X invariant tests make regressions across those seams loud by checking unavailable, blocked, ready, canonical-path, deterministic, and no-signal-leak cases together.

The boundary remains:

`MarketEvent -> OrientationContext -> ProtectionPlan -> TradeHubSurfaceModel -> ConfirmationSession { TradePlanPreview / RiskToolVM / TradePlanConfirmationShell / ConfirmationFlow } -> ExecutionPreviewVM -> ExecutionReadiness -> SubmissionIntentResult -> ExecutionAdapterAttemptResult -> app`
