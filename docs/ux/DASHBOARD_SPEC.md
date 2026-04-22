# Dashboard Spec (P4-5 + PX-E2 + PX-MA1 + PX-MA2 + PX-MA3 + P7-K8 + P7-K9 + P7-K10)

## Purpose
Dashboard is PocketPilot's structured cross-asset Focus surface for answering: "What matters most right now?" It is prepared in `services/dashboard` and rendered in `app/` without UI-owned ranking, filtering, bucket selection, or data assembly.

PX-E2 keeps Dashboard as the only explanation surface and deepens the existing PX-E1 why seam slightly. The goal is better meaning, not more surface area.

## Surface Contract

```ts
{
  primeZone: {
    items: DashboardItem[]
  }
  secondaryZone: {
    items: DashboardItem[]
  }
  deepZone: {
    items: DashboardItem[]
  }
  meta: {
    profile: UserProfile,
    hasPrimeItems: boolean,
    hasSecondaryItems: boolean,
    hasDeepItems: boolean
  }
}
```

`DashboardItem` remains display-safe and intentionally excludes raw signal payloads, scoring internals, metadata blobs, and execution details.

Dashboard also has a surface VM with one optional explanation seam and one optional contextual-knowledge lane:

```ts
{
  accountContext: SelectedAccountAvailability,
  aggregatePortfolioContext: AggregatePortfolioAvailability,
  contextualKnowledgeLane: ContextualKnowledgeLane,
  model: DashboardSurfaceModel,
  scan: ForegroundScanResult,
  explanation: ExplanationAvailability
}
```

P6-A2 adds one additional prepared input on the same screen helper path:
- one optional `MessagePolicyLane` result from `services/messages/fetchMessagePolicyVM`
- it is still rendered inline and only through prepared service output
- it does not change the Dashboard surface model contract itself
P6-A5 adds one optional prepared rationale on that same message-policy result:
- it stays subordinate to the referral note
- it remains compact and inline
- it does not turn Dashboard into a troubleshooting or notification surface
P6-A6 keeps that same output grouped as one lane so the screen helper reads one service-owned policy-and-rationale contract instead of separate ad hoc seams.

## Service Path
Dashboard continues to use its own upstream preparation seam:
- `services/upstream/fetchSurfaceContext.ts` assembles shared deterministic truth, including selected-account context.
- `services/dashboard/dashboardDataService.ts` prepares Dashboard-owned upstream inputs from that shared truth, including one optional aggregate holdings / exposure lane.
- `services/dashboard/dashboardSurfaceService.ts` shapes the stable app-facing `DashboardSurfaceModel` and Dashboard explanation VM.
- `services/dashboard/fetchDashboardExplanationVM.ts` selects the prime explanation target and calls the canonical explanation builder.
- `services/messages/fetchMessagePolicyVM.ts` consumes the prepared Dashboard surface and decides whether a Dashboard-only `REFERRAL` note is eligible.
- `services/messages/fetchMessagePolicyVM.ts` returns one grouped message-policy lane for the Dashboard surface helper.
- `services/messages/createPreparedMessageRationale.ts` may attach one calm explanation for why that referral posture appeared.

This keeps Dashboard separate from Snapshot service flow while preserving the same app-facing contract.

## Zone Rules
- Prime Zone contains only the highest-priority prepared items.
- Secondary Zone contains supporting items that remain relevant but are not the top immediate focus.
- Deep Zone contains lower-priority details that belong in a quieter, secondary layer.
- The surface must stay structured. Dashboard is not a flattened event feed.

## Dashboard Why Note (PX-E2)
Dashboard remains the only explanation consumer surface.

Rules:
- one surface only in this phase
- attached to the prepared prime item only
- subordinate to the main Dashboard surface
- absent is better than filler when explanation is unavailable
- app renders prepared explanation contracts only

The Dashboard why note shows:
- title
- calm summary
- optional `contextNote` when richer state/context phrasing helps
- confidence note
- up to 3 lineage items
- sparse limitations when relevant

PX-E2 also allows one modest deeper reuse path on Dashboard only:
- the same prepared explanation can render in a compact state
- the same prepared explanation can reveal a slightly deeper context view inside the same card

It does not add:
- a second explanation system
- a new top-level Dashboard surface
- Snapshot explanation
- Trade Hub explanation
- a modal essay panel

The Dashboard why note still does not show:
- raw signal arrays
- event IDs
- strategy IDs
- provider/runtime diagnostics
- modal warning theatre
- urgency language
- predictive wording

## Account Context Cue, Controls, And Aggregate Holdings (PX-MA1 + PX-MA2 + PX-MA3)
Dashboard keeps the same account-context cue, PX-MA2 lets it deepen carefully when the prepared switching seam says switching is honestly available, and PX-MA3 adds one separate subordinate aggregate holdings section when the prepared aggregate seam is honestly available.

Rules:
- render the cue only when the prepared selected-account seam is `AVAILABLE`
- keep the cue calm, subordinate, and compact
- show the current account name plus sparse context such as selection mode, base currency, and strategy id when available
- if the prepared switching seam is `AVAILABLE`, the cue may expand inline to show eligible account options
- switching must always be explicit; no hidden account change
- primary-account updates must stay legible but low-drama
- if switching is unavailable, preserve the passive cue or render nothing
- do not add selector sprawl, warning styling, or settings-panel behaviour
- do not let `app/` derive fallback rules, switching eligibility, or account truth locally

PX-MA2 still does not allow:
- all-accounts strategy state
- aggregate fit state
- cross-surface switcher rollout everywhere
- broad account-management UI

PX-MA3 adds:
- one small subordinate aggregate holdings section
- total value and combined holdings / exposure context only
- service-owned aggregation with app-side rendering only

PX-MA3 rules:
- render the aggregate section only when the prepared aggregate seam is `AVAILABLE`
- keep it compact, calm, and visually subordinate to the Focus zones
- phrase it as portfolio or exposure context only
- do not imply that the Dashboard is now in all-accounts strategy mode
- do not let `app/` derive holdings aggregation, portfolio totals, or aggregate weights locally

PX-MA3 still does not allow:
- all-accounts strategy alignment
- aggregate fit summaries
- aggregate alert or message truth
- aggregate risk or execution truth
- broad portfolio-dashboard sprawl

Why Dashboard first:
- Dashboard is already account-scoped in canon and safer than disturbing Snapshot's sacred compactness
- the cue now makes account context controllable as well as legible
- the new holdings card gives one safe aggregate portfolio proof path without changing strategy truth
- it proves the shared service seam while keeping product posture calm and explicit

## Dashboard Referral Note (P6-A2)
Dashboard now has one optional message-policy note only:
- `REFERRAL`

Rules:
- render it only when the prepared message-policy seam says it is `AVAILABLE`
- keep it visually subordinate to the Focus zones
- do not turn it into an alert wall, popup, badge, or contextual knowledge rail
- use it only as a calm routing or fit note
- keep missing or empty Dashboard context distinct from referral-worthy context
- if rationale is available, render one small inline "why this is here" treatment only
- rationale must not expose raw scoring, raw signals, provider/runtime state, or user advice

The app path remains:
- `services/messages/fetchMessagePolicyVM`
- `app/screens/dashboardScreenView.ts`
- `DashboardScreen`

`app/` does not decide whether Dashboard should show referral copy.

## P7-K4 Contextual Knowledge Follow-Through
Dashboard now has one optional contextual-knowledge lane on the same prepared surface path.

Rules:
- the lane comes from `services/knowledge/createContextualKnowledgeLane`
- it is service-owned, profile-shaped, and relevance-shaped
- beginner users can see a little more of the lane than advanced users
- render it only when the prepared lane is honestly available and non-empty
- keep it compact, calm, and subordinate to the main Focus zones
- do not turn it into a feed, tutorial stack, or gating mechanism
- app code only renders prepared topic links and topic detail routes; it does not choose topics locally

## P7-K5 Contextual Knowledge Density / Placement Refinement
Dashboard now also consumes a prepared contextual-knowledge presentation contract so the same lane can stay calmer or disappear more quietly when relevance is thin.

Rules:
- `services/knowledge/createContextualKnowledgePresentation.ts` owns the prepared density and placement result
- the presentation is explicit: `maxVisibleTopics`, `emphasis`, and `shouldRenderShelf`
- beginner and middle profiles stay a little more open than advanced profiles
- the shelf may stay hidden when the prepared context is too thin for the current profile or surface
- `app/` renders the prepared title, summary, and topic links only
- no local topic selection, recommendation feed behavior, or gating behavior is introduced

## P7-K6 Contextual Knowledge Topic-Linkage Expansion
Dashboard now links live context to better prepared topics before the existing K5 presentation contract decides how much of the lane should appear.

Rules:
- `services/knowledge/selectContextualKnowledgeTopics.ts` owns the topic-linkage ranking seam
- ranking can use strategy, signal, event, and dashboard surface context already prepared by services
- the lane remains optional, calm, and subordinate to the main Focus zones
- `app/` still renders prepared topics only and does not select or rank them locally
- the K5 presentation contract remains intact, so density and placement behavior do not change
- the lane still does not become a feed, gate, or tutorial stack

## P7-K7 Topic-Detail Context Framing
Dashboard keeps the same contextual shelf and the same topic-detail navigation path, but a tap from that shelf can now carry one small prepared context frame into the detail view.

Rules:
- `services/knowledge/createKnowledgeTopicContextFraming.ts` owns the prepared topic-detail relevance frame
- `services/knowledge/createKnowledgeTopicDetailVM.ts` threads the frame into the prepared topic detail contract
- `app/` passes prepared origin metadata only and renders the frame only when the service says it is available
- the frame stays optional, calm, and subordinate to the topic detail body
- the shelf still behaves exactly as it did in K4/K5/K6
- no gating, recommendation feed, inbox, or forced-reading behavior is introduced

## P7-K8 Inline Glossary / Keyword Help
Dashboard now supports one narrow inline glossary-help proof path on explanatory copy.

Rules:
- `services/knowledge/createInlineGlossaryHelp.ts` prepares the inline block; `app/` only renders prepared segments
- profile shaping stays service-owned (`BEGINNER` strongest, `MIDDLE` lighter, `ADVANCED` minimal by default)
- seen-term acknowledgement stays service-owned through `services/knowledge/inlineGlossarySeenState.ts`
- term taps route to the existing `KnowledgeTopicScreen` path
- no app-side term matching, ranking, tooltip storms, or whole-surface auto-linking is introduced
- no gating, lockout, notification, or inbox behavior is introduced

## P7-K9 Glossary Alias / Matching Normalization
Dashboard keeps the same K8 inline glossary surface scope, but matching quality is improved in services.

Rules:
- `services/knowledge/createGlossaryTermIndex.ts` owns alias/index normalization for canonical term variants
- `services/knowledge/selectInlineGlossaryTerms.ts` consumes the normalized index and remains deterministic
- app behavior is unchanged: render prepared segments and route taps to existing topic detail
- generic noisy terms stay suppressed; Dashboard does not become underlined-link clutter
- no new Dashboard surfaces, gating behavior, or UI-owned matching logic are introduced

## P7-K10 Inline Glossary Exposure Signals / Tuning Hooks
Dashboard keeps the same K8/K9 inline glossary presentation while services collect compact internal aggregate signals for future tuning.

Rules:
- surfaced/acknowledged signal recording stays in `services/knowledge`
- no Dashboard analytics panel, debug widget, or user-facing signal summary is added
- no network telemetry/export behavior is introduced in this phase
- no Dashboard action, explanation, or relevance gating is introduced

## PX-E2 Lineage And Phrasing Rules
PX-E2 deepens quality rather than breadth.

Lineage rules:
- prefer the strongest interpreted event, state, and context combination
- avoid repetitive lineage items that say the same thing twice
- use one calm recent-history item when history is repetitive or thin
- cap lineage at 3 items

Phrasing rules:
- summary should read like a briefing note
- confidence remains evidence support only
- limitations remain factual and sparse
- richer context phrasing should help the user understand the current interpreted picture without becoming verbose

## Profile Shaping
- Beginner receives the sparsest surface with fewer prime items and little to no secondary or deep density.
- Middle receives a balanced prime and secondary view with a compact deep layer.
- Advanced receives the fullest structured surface, but still through the same explicit zones.

Profile shaping changes density only. It does not change the deterministic ranking rules or expose extra raw data.

## Relationship To DashboardModel
- `DashboardModel` is the internal prioritised bucket model: `prime`, `secondary`, `background`.
- `DashboardSurfaceModel` is the presentation-facing contract: `primeZone`, `secondaryZone`, `deepZone`, plus `meta`.
- The mapping from `background` to `deepZone` happens in `services/dashboard/createDashboardSurfaceModel.ts`.
- `app/screens/dashboardScreenView.ts` may format prepared items and aggregate holdings display text, but it does not reprioritise, re-bucket, or aggregate them.
- `app/components/ExplanationCard.tsx` renders prepared explanation data only; it does not build lineage or confidence wording locally.

## Snapshot Separation
- Snapshot remains the Scan surface and owns Snapshot-specific shaping.
- Dashboard remains the Focus surface and owns Dashboard-specific shaping.
- Shared upstream truth is allowed.
- Snapshot service outputs are not the Dashboard upstream seam.
- PX-E2 explanation does not add a competing Snapshot explanation path.

## Intentional Exclusions
This phase does not add:
- charts
- raw signal lists
- analytics scoring
- journaling or exports
- notification delivery
- Snapshot redesign
- Trade Hub logic
- AI explanations
- persistence changes
- multiple explanation surfaces
- a full Insights layer
