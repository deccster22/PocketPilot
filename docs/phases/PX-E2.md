# PX-E2 - Dashboard Explanation Deepening

## Why This Phase Happened Now
PX-E1 proved that PocketPilot could support one calm, honest explanation seam on Dashboard without leaking raw signals, provider diagnostics, or UI-side interpretation.

PX-E2 happens now because that first seam was useful but still too skeletal in a few predictable places:
- lineage selection was too literal when multiple interpreted candidates existed
- state and context phrasing could feel thin
- Dashboard had only one shallow presentation depth for the same explanation truth

This phase deepens explanation quality without broadening product scope.

## What PX-E2 Added
PX-E2 keeps the same canonical explanation seam and improves it in four ways:

1. smarter interpreted lineage selection that prefers meaningful event, state, and context combinations
2. slightly richer state/context phrasing through an optional `contextNote`
3. tighter confidence and limitation wording while preserving calm, non-predictive framing
4. one Dashboard-only deeper reuse path that reveals more prepared explanation detail inside the same card

The service path remains:

`EventStream -> EventLedger -> EventLedgerQueries -> Since Last Checked -> OrientationContext -> createExplanationSummary -> fetchDashboardExplanationVM -> DashboardScreen`

## What PX-E2 Deliberately Did Not Add
PX-E2 does not add:
- Snapshot explanation
- Trade Hub explanation
- a full Insights product
- journaling, exports, or archives
- push notifications
- background polling
- AI-generated explanations
- provider/runtime diagnostics in product explanation
- raw signal escape hatches
- predictive confidence language
- a second explanation builder in `app/`

## Why Dashboard Remains The Only Explanation Surface
Dashboard is still the right place for the explanation seam because it is the Focus surface.

Keeping explanation on Dashboard only protects three important boundaries:
- Snapshot stays lighter and more sacred
- Trade Hub stays execution-aware without turning into an explanation product
- the explanation seam can deepen quality before it broadens across surfaces

PX-E2 keeps explanation subordinate to the main Dashboard surface rather than turning it into a primary destination.

## What Future Phases Should Build On
Future explanation, history, and insight phases should build on top of this seam rather than creating competing ones.

Useful next steps later:
- broaden explanation to other surfaces only when product scope explicitly calls for it
- connect explanation to richer history navigation once those product families are scheduled
- deepen pattern and strategy storytelling only when the canonical `P9` family is actually underway

PX-E2 is still cross-cutting groundwork.
It should not be read as proof that canonical `P9` is complete or even broadly started.
