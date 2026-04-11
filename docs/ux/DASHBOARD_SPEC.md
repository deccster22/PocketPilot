# Dashboard Spec (P4-5 + PX-E2)

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

Dashboard also has a surface VM with one optional explanation seam:

```ts
{
  model: DashboardSurfaceModel,
  scan: ForegroundScanResult,
  explanation: ExplanationAvailability
}
```

P6-A2 adds one additional prepared input on the same screen helper path:
- one optional `MessagePolicyAvailability` result from `services/messages/fetchMessagePolicyVM`
- it is still rendered inline and only through prepared service output
- it does not change the Dashboard surface model contract itself
P6-A5 adds one optional prepared rationale on that same message-policy result:
- it stays subordinate to the referral note
- it remains compact and inline
- it does not turn Dashboard into a troubleshooting or notification surface

## Service Path
Dashboard continues to use its own upstream preparation seam:
- `services/upstream/fetchSurfaceContext.ts` assembles shared deterministic truth.
- `services/dashboard/dashboardDataService.ts` prepares Dashboard-owned upstream inputs from that shared truth.
- `services/dashboard/dashboardSurfaceService.ts` shapes the stable app-facing `DashboardSurfaceModel` and Dashboard explanation VM.
- `services/dashboard/fetchDashboardExplanationVM.ts` selects the prime explanation target and calls the canonical explanation builder.
- `services/messages/fetchMessagePolicyVM.ts` consumes the prepared Dashboard surface and decides whether a Dashboard-only `REFERRAL` note is eligible.
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
- `app/screens/dashboardScreenView.ts` may format prepared items for display text, but it does not reprioritise or re-bucket them.
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
