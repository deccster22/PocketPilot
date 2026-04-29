---
Title: PocketPilot - CANON
Version: 0.6
Source: project-source CANON v0.6 source refresh + docs/phases/PHASE_MAP.md
Last Updated: 2026-04-29
---

# PocketPilot - CANON v0.6

Product philosophy, locked architecture decisions, canonical object definitions, and phased delivery rules.

This revision preserves the North Star, Anti-Vision, major section structure, and core architecture principles from CANON v0.5 while refreshing authority-layer status language against current repo reality.

It does not rewrite PocketPilot's doctrine. It updates the parts of CANON that had fallen behind the build: prepared service-owned seams, selected-account integrity, Strategy Preview / Navigator maturity, Knowledge Library maturity, reflection-family foundations, and the current phase ledger relationship.

## v0.6 Status Refresh Scope

This source refresh exists because the repo has moved beyond the older v0.5 phase-status snapshot.

The refresh:

- preserves the existing North Star, Anti-Vision, and core architecture posture
- updates development workstream language so `P6`, `P7`, `P8`, and `P9` are no longer described through stale early checkpoints
- recognizes `docs/phases/PHASE_MAP.md` as the canonical audited phase taxonomy and implementation-status ledger
- recognizes prepared service-owned contracts and VMs as the preferred surface pattern
- recognizes selected-account truth as an explicit service-owned seam
- recognizes the current Strategy Preview / Navigator, Knowledge Library, Since Last Checked, Insights, and Trade Hub risk-support foundations without claiming those broader families are complete

CANON remains the doctrine and architecture source of truth. `PHASE_MAP.md` remains the detailed build ledger.

## North Star

PocketPilot provides clarity in a volatile market.

It is:
- Strategy-first
- Execution-aware
- Calm in tone
- Non-gamified
- User-directed

It reduces chaos without manufacturing urgency.

## Anti-Vision (Non-Negotiables)

PocketPilot does not:
- Inject urgent language
- Gamify trading outcomes
- Auto-switch strategies
- Override user decisions
- Shame inactivity
- Flash red warnings or dramatise volatility
- Present global strategy signals that do not match the execution venue
- Turn raw signal output into the visible product surface
- Allow explanation, reflection, or guardrails to become patronising
- Hide meaningful complexity behind fake certainty

## Data Integrity and Budget Discipline

- Quote Broker abstraction required
- All network calls are routed through the provider layer
- Hard caps enforced per interval
- No background scanning in Phase 1
- Haptic throttle per symbol
- Estimated state can never present as confirmed certainty
- The core layer must remain deterministic and side-effect free
- Execution truth beats synthetic purity

Strategy alignment, meaningful events, and action-support logic must be derived from the selected execution account's feed, not an averaged or global proxy.

## Core Architecture Principles

### 1. Strategy Is Account-Scoped

- Strategy alignment is calculated using the price feed of the selected execution account
- There is no canonical global strategy feed that diverges from execution price
- Signals must match where trades will occur
- Trust is more important than aggregation purity

### 2. Market Regime Is Contextual, Not Controlling

- Regime classification exists as an independent descriptive layer
- Regime influences strategy only through strategy logic
- No regime-level global overrides
- Beginner exposure should be lighter than advanced exposure

### 3. Strategy Fit Indicator

- Fit is descriptive, not directive
- Fit can express favourable, mixed, or unfavourable conditions for the selected strategy
- Fit must not function as a switch recommendation engine
- Fit should be secondary to core alignment state
- Fit may support a broader descriptive context lane, but it must not become a recommendation or urgency system

### 4. Snapshot Is Sacred

- Snapshot remains a zero-scroll, calm briefing surface
- Current State, Last 24h Change, and Strategy Status are its core elements
- It should update quietly rather than theatrically
- It must support quick open-close behaviour
- Snapshot should behave like a financial Primary Flight Display: trend + state + change, not raw data overload
- Permitted secondary indicators include strategy fit, volatility context, meaningful-change briefing, and signals contributing to alignment, but they must remain visually subordinate to the core triad
- Since Last Checked may appear as a compact, account-scoped briefing below Strategy Status, but it must remain non-inbox-like and clear-after-view
- Snapshot answers "What's going on for my strategy?" in under three seconds

### 5. 30,000 ft View

- Provides macro context during elevated volatility or major structural shifts
- Remains an opt-in descriptive lane
- Should stabilise the user emotionally without changing the product tone
- Must not recommend action
- Must not escalate urgency
- Extreme volatility should surface as a calm context affordance, not a siren
- Useful payload may include volatility percentile, volatility expansion, macro comparison, trend structure, and historical grounding context

### 6. SL/TP Calculator

- Calculator logic is support, not enforcement
- It should calculate suggested stop, take profit, position size, max loss, and risk/reward, not auto-execute by default
- Placement belongs inside the Trade Hub

### 7. Risk Basis Toggle

- Risk basis should remain explicit and legible
- Any user-selected risk basis must flow into `ProtectionPlan` and related summaries

### 8. ProtectionPlan Object

When the user calculates SL/TP, the system creates a `ProtectionPlan` object.

Fields include:
- `accountId`
- `entryIntent`
- `stopLevel`
- `takeProfitLevel`
- `riskBasis`
- `timestamp`
- `status`
- `executionCapability`

Expanded canonical sketch:

```ts
type ProtectionPlan = {
  accountId: string;
  entryIntent: string;
  stopLevel: number;
  takeProfitLevel: number;
  riskBasis: string;
  timestamp: number;
  status: string;
  executionCapability: string;
};
```

- Calculator logic is platform-independent
- Execution layer adapts per platform capability
- Bracket/OCO supported -> single API flow
- Separate orders required -> post-trade guided sequence
- Current repo posture remains support-first and non-dispatching; prepared planning, readiness, confirmation, and submission-intent seams do not authorize live order dispatch

## Multi-Account Architecture

### 9. Accounts Are First-Class Objects

- Each account contains platform capability matrix, portfolio value, base currency, risk settings, and strategy assignment
- Single-account mode hides unnecessary account selection UI
- Multi-account mode supports a nominated primary account or highest-value fallback
- Current repo reality includes a selected-account resolver and prepared account-context seam that downstream surfaces consume rather than reconstructing account truth locally

### 10. Single vs Multi-Account UX

- Single account: no account selector shown; all data implicitly scoped to that account
- Multi-account: user can nominate primary account; strategy is assignable per account; switching accounts switches strategy context
- Account switching must remain intentional and service-owned
- Account cues should stay calm and subordinate; they must not become a full account-management cockpit by accident

### 11. Aggregation Rules

- Allowed: portfolio value aggregation, exposure aggregation, asset-level position aggregation
- Not allowed: aggregated global strategy alignment, aggregated fit signals, aggregated alert truth, aggregated risk truth, or aggregate action-support truth
- Signals are account-bound
- Aggregate holdings or exposure views may appear as context only; they must remain visually and semantically secondary to selected-account strategy truth

### 12. Snapshot Modes (Multi-Account)

- Primary Account (default)
- All Accounts (compact stacked view)
- Aggregate (positions only)
- Dashboard remains account-scoped

## Canonical Contracts

### 13. MarketEvent Is Canonical

`MarketEvent` is the canonical unit of meaningful interpreted change inside PocketPilot.

```ts
type MarketEvent = {
  eventType: string;
  timestamp: number;
  accountId: string;
  symbol?: string;
  strategyId?: string;
  alignmentState: string;
  signalsTriggered: string[];
  confidenceScore?: number;
  price?: number;
  pctChange?: number;
  metadata?: Record<string, unknown>;
  strategyImpact?: string;
  profileNarration?: string;
};
```

- Strategy alignment change, volatility spike, candle pattern formation, regime shift, and price threshold all resolve to `MarketEvent` instances
- `MarketEvent` is the backbone for alerts, Snapshot updates, Since Last Checked, Event Ledger, reflection, journaling, and exports
- Do not proliferate ad-hoc event formats
- In visual design, `MarketEvent` is also the preferred atomic interpreted UI unit; naked indicator tiles are not PocketPilot's core product language

### 14. EventLedger and UserActionEvent

The Event Ledger records market events and user action events in one coherent memory layer.

```ts
type EventLedgerEntry = {
  eventId: string;
  eventClass: 'market' | 'user_action';
  accountId: string;
  symbol?: string;
  strategyId?: string;
  timestamp: number;
  alignmentState?: string;
  signalContext: string[];
  payload: Record<string, unknown>;
};
```

- User actions should record strategy active at the time, alignment state, signal context, price, and action metadata
- The ledger exists to contextualise, not moralise
- Reflection summaries may compare aligned vs outside-strategy actions without shaming language
- Current Insights foundations may summarize, archive, compare, journal, and export ledger-backed context, but those surfaces remain descriptive and non-moralizing

### 15. StrategyContext Contract

```ts
type StrategyContext = {
  accountId: string;
  strategyId: string;
  profileId: string;
  selectedAssetSet: string[];
  fitState?: string;
  regimeState?: string;
  activeSignals: string[];
  alignmentState: string;
};
```

- `StrategyContext` is the active interpretation frame for the selected account
- Trade Hub, Snapshot, Dashboard, Alerts, Insights, and broader context lanes should all consume consistent service-owned interpretation rather than rebuilding fragments independently
- Prepared surface contracts and VMs belong in `services/`; `app/` renders prepared interpretation rather than composing it locally

### 16. ProfileConfig and ProfileVoicePolicy

Profiles remain separate from strategies and separate from voice tone.

```ts
type ProfileConfig = {
  profileId: string;
  uiDensity: string;
  guidanceLevel: string;
  featureAccess: string[];
  alertSensitivity: string;
  knowledgeExposure: string;
  regimeExposure: string;
};

type ProfileVoicePolicy = {
  voiceStyle: string;
  phraseLength: string;
  certaintyRules: string[];
  suggestionRules: string[];
};
```

- `ProfileConfig` is the canonical user-facing behaviour object
- `ProfileVoicePolicy` is the narration rule layer nested beneath the profile
- Beginner suggestions must remain observational rather than directive
- Profiles change density, scaffolding, explanation depth, signal exposure, and feature access; they do not create three separate visual identities or three separate logic systems

### 17. KnowledgeNode and Knowledge Layer

```ts
type KnowledgeNode = {
  topicId: string;
  title: string;
  content: string;
  mediaType: 'article' | 'diagram' | 'video' | 'interactive' | 'case_study';
  strategyLinks: string[];
  signalLinks: string[];
  difficulty: string;
};
```

- Knowledge now has a landed baseline through library, topic-detail, contextual-eligibility, contextual surface rollout, density shaping, topic-linkage, topic-detail handoff, inline glossary help, alias normalization, exposure/tuning hooks, and Trade Hub term-help planning seams
- The active knowledge corpus now includes the family-based knowledge tree plus imported Trade Hub risk-planning, strategy, and concept learning layers
- Beginner access should be stable and obvious
- Intermediate access should include contextual links during drift or ambiguity
- Advanced access should remain available without constant surfacing
- Knowledge Library should exist as a persistent tab and as a contextual support layer
- Knowledge must remain accessible, optional, and non-intrusive
- Knowledge supports confidence and comprehension, but must never gate use or punish the user for not reading

### 18. Relevance Principle and Message Filtering

PocketPilot avoids signal overproduction by filtering output through Strategy -> Profile -> Relevance.

- Users see signals relevant to their strategy, assets, and account context
- Alert volume must be subordinate to interpreted usefulness
- No raw-indicator-to-push pipeline is allowed
- Contextual knowledge, glossary help, message policy, and Strategy Navigator follow-through must use the same relevance discipline and remain service-owned

### 19. Strategy Preview / Strategy Navigator

PocketPilot now has a prepared foundation for this exploratory feature family through `P9-S1` to `P9-S9`. Current implementation may use `Strategy Preview` as the visible exploratory surface label while `Strategy Navigator` remains the canonical internal family name.

- Shows how interpreted events would appear
- Shows how alerts behave
- Shows how the dashboard shifts
- Reduces beginner commitment anxiety
- Supports preview-to-knowledge follow-through and explanation deepening
- Supports bounded scenario contrast, fit contrast, nearby-alternative context, strategy metadata normalization, and conservative mobile progressive disclosure
- Must remain simulated, descriptive, and non-directive
- Must not become a ranking engine, recommendation surface, predictive simulator, or execution handoff

### 20. Quick Action Panel Rules

Quick actions belong inside Trade Hub and should remain constrained.

- Default audience: advanced profile or explicit unlock path
- Always require confirmation
- Prefer alignment-strength or equivalent discipline gate before surfacing high-velocity actions
- Do not let quick actions collapse PocketPilot into casino behaviour
- Current Trade Hub posture remains deliberate, confirmation-safe, and non-dispatching

### 21. Signal Rules

Signals must express confidence, not certainty.

The system may describe:
- possible
- forming
- strengthening
- weakening

The system must not claim:
- guaranteed
- confirmed outcome
- high probability of profit

Signal exposure must scale by profile and strategy relevance.

- Beginner: only major strategy events
- Intermediate: major plus secondary alignment signals
- Advanced: full strategy signal stream

## Alerts Logic

- Strategy alignment alerts are account-scoped
- Risk alerts are account-scoped
- Message policy is a canonical service-owned seam with explicit families: `BRIEFING`, `ALERT`, `REORIENTATION`, `REFERRAL`, and `GUARDED_STOP`
- Since Last Checked is a calm briefing pattern, not an inbox, feed, badge system, or notification center
- No global signal aggregation
- Foreground-only scanning remains the Phase 1 rule
- Any future push logic must be explicitly phase-gated and cannot rely on background market polling until guardrails are revised
- Messaging tone varies by profile, but event logic stays canonical
- `app/` may render prepared message-policy output only; it must not infer, relabel, or merge message families locally

## Knowledge Layer

Baseline knowledge foundation now exists, but the governing posture does not change:

- Beginner: stable, always-visible strategy knowledge access
- Intermediate: contextual links during drift
- Advanced: documentation accessible but not constantly surfaced
- Knowledge Library must support multiple media types and contextual linking from signals, strategies, events, preview surfaces, and selected planning terms where explicitly wired
- Term help and glossary support must remain sparse, service-owned, non-gating, and non-cluttering
- Broader surface expansion should follow measured relevance, not enthusiasm

## Visual And UX Doctrine

PocketPilot's visual system is governed by the same product laws as its architecture.

- The UI should feel like financial aviation as an information principle, not literal cockpit cosplay
- Snapshot is the scan surface and must preserve triad supremacy
- Dashboard is the focus workspace and must preserve Prime / Secondary / Deep hierarchy
- Trade Hub is deliberate action support and should feel closer to a pre-flight checklist than a trading terminal
- Profiles change density and scaffolding, not visual identity
- Color is semantic: neutral structure, restrained blue for information, amber for meaningful change or watchfulness, and very restrained red for exceptional safety states only
- Motion confirms orientation; it must not manufacture emotion or urgency
- MarketEvent, status chips, trend vectors, prepared context cards, Trade plan cards, and confirmation step rows are the right kind of product primitives
- The design system should reject raw indicator walls, red/green casino semantics, alert theatre, profile-specific skins, and one-tap action energy

Detailed visual token, component, and Figma rules live outside CANON. CANON locks the behavioural boundaries those design artifacts must respect.

## Guardrails Philosophy (Phase 2 and Beyond)

- Optional tools: risk limits, daily loss thresholds, cooldowns, position caps
- All opt-in
- All knowledge-backed
- None default-on
- None auto-blocking unless explicitly enabled
- PocketPilot may alert, suggest, or notify. It must not silently prevent or override by default
- Guardrails should mirror informed structure and self-chosen discipline rather than external control
- Strategy logic, market regime, and risk management intersect but do not collapse into one override layer
- Current guardrail evaluation remains descriptive and non-blocking unless a future explicit opt-in enforcement mode is canonised

## Open Questions (Parked)

- Behavioural reflection after consecutive losses
- Extreme crash communication model
- SL/TP hard enforcement mode
- Background monitoring limits
- Account pinning UX refinement
- How much of the financial-PFD metaphor becomes visible language vs internal design principle
- Exact placement of Year in Review and compare-period tooling within Insights
- Whether quick actions remain advanced-only forever or become capability-gated by explicit consent
- Whether and when broader glossary / contextual knowledge surfaces expand beyond the current service-owned lanes
- Whether future Strategy Navigator depth justifies richer profile-aware disclosure defaults without drifting into recommendation or ranking

## Phase Targets

### Macro Phase 1 - Foundation

- Single-account flawless experience
- Multi-account stable primary switching
- Account-scoped strategy engine
- Trade Hub entry architecture
- Snapshot and dashboard skeleton
- Knowledge baseline
- Foreground-only scanning and alerts
- Stability over feature density

### Macro Phase 2 - Context and Reflection

- Event Ledger
- Since Last Checked
- Portfolio and trade context
- Reflection summaries and export model
- Reorientation flows

### Macro Phase 3 - Intelligence

- Pattern formation detection
- Confluence recognition
- Why panel and signal explanation layer
- Regime engine and richer fit/context model
- Strategy preview simulations

### Macro Phase 4 - Copilot and Hardening

- AI-assisted explanation where it improves clarity
- Strategy simulation
- Behaviour insights
- Diagnostics, logging, Sentry, debug export
- Launch preparation, onboarding polish, compliance review, store copy

## Development Workstream Phasing

The current repo has moved well beyond the original CANON v0.5 phase-language snapshot.

`docs/phases/PHASE_MAP.md` is the canonical taxonomy and implementation-status reconciliation document for landed subphases, PX sequencing, and docs/admin lanes. PX families remain cross-cutting and do not imply completion of numbered product families. DOC families are docs/admin work and do not imply runtime or product-family completion.

### Historical / Already Landed

- P0: Vision, doctrine, architecture, and repo-discipline foundation
- P1: Strategy engine foundations
- P2: Snapshot / provider / governance / debug observatory foundation
- P3: Event system and orientation spine, including MarketEvent, EventLedger, query seam, Since Last Checked foundation, and OrientationContext
- P4: Snapshot and Dashboard shaping, including SnapshotModel, profile shaping, Dashboard model, Dashboard surface, and upstream seam split
- P5: Trade Hub and `ProtectionPlan`, including confirmation, readiness, submission-intent, execution-boundary hardening, risk support, prepared planning levels, guardrail preference/evaluation support, and plain-language Trade Hub copy through `P5-R16`

### Current Families / Partial Foundations

- P6: Alerts, reorientation, Snapshot briefing, and message policy family; groundwork exists through `P6-R*`, `P6-A1` to `P6-A8`, and related Snapshot/Insights continuity, but the broader family remains incomplete
- P7: Knowledge baseline family; foundation exists through `P7-K1` to `P7-K11`, with the active knowledge corpus also strengthened by `PX-KI1` to `PX-KI5`, but broader knowledge depth, integration, and visual learning layers remain incomplete
- P8: Insights, Event Ledger, Since Last Checked, and reflection family; foundations exist through `P8-I1` to `P8-I12`, including history, archive/detail, compare windows, summaries, Year in Review, exports, journal groundwork, and Since Last Checked archive continuity, but the broader reflection family remains incomplete
- P9: Pattern Navigator / Strategy Navigator / richer explanation family; prepared Strategy Preview / Navigator foundations exist through `P9-S1` to `P9-S9`, including preview, knowledge follow-through, explanation deepening, scenario contrast, fit contrast, nearby alternatives, metadata normalization, and mobile disclosure, but the broader intelligence/explanation family remains incomplete

### Cross-Cutting And Docs/Admin Reality

- `PX-API1` to `PX-API5`: provider, quote, runtime, policy, health-windowing, and diagnostics support lanes
- `PX-C1` to `PX-C2`: Strategy Fit / 30,000 ft context lane foundations
- `PX-MA1` to `PX-MA3`: selected-account integrity, account switching, and aggregate holdings/exposure context while preserving selected-account strategy truth
- `PX-KI1` to `PX-KI5`: knowledge corpus import, taxonomy reconciliation, register/catalog validation, Trade Hub risk-planning knowledge import, and strategy/concept progressive-layer merge
- `DOC-D1` to `DOC-D3`: docs map/index consistency, backlog/state reconciliation, and active-doc narrative cleanup
- `DOC-D4`: this CANON status refresh, limited to authority-layer status language and decision-register alignment

### Later Families

- P10: Beta hardening
- P11: Launch prep

## Decision Register

v0.4 and v0.5 retained decisions remain valid unless explicitly superseded below.

- `P1D1`: Strategy Engine skeleton introduced as deterministic contract first
- `P1D2`: Strategy Catalog and Profile Defaults introduced as pure deterministic layer
- `P1D3`: Data Quality / Confidence as first real strategy
- `P1D4`: `BaselineScan` pathway and deterministic quote deltas
- `P1D5`: beginner-safe `dip_buying` strategy using deltas only
- `P1D6`: beginner-safe `momentum_basics` using deltas only
- `P1D7`: `StrategyBundle` as user-facing grouping mechanism
- `P1D8`: proper PR flow with `verify` required before push to `main`
- `P2D1`: freeze first working device build for recovery safety
- `P2D2`: `MarketEvent` becomes the canonical interpreted event contract
- `P2D3`: `EventLedger` must record both market events and user action events
- `P2D4`: `ProfileConfig` becomes the canonical profile object; voice rules remain a nested subsystem
- `P2D5`: `KnowledgeNode` becomes the canonical content-linking object
- `P2D6`: Snapshot keeps a locked three-part core with optional subordinate secondary chips only
- `P2D7`: Strategy Preview / Strategy Navigator is preserved as a future feature family rather than discarded
- `P2D8`: Macro phases are introduced without deleting the detailed workstream phase map
- `P2D9`: `ProfileConfig` is the primary object and `ProfileVoicePolicy` is the nested narration rules subsystem
- `P2D10`: Strategy Preview vs Strategy Navigator are the same feature family, not two separate roadmap items. Canonical internal family name: Strategy Navigator. Onboarding sub-mode: Strategy Preview. Same concept, two labels. The final product-facing name remains open.
- `P2D11`: Canonical system lifecycle: Formation -> Development -> Confirmation / Invalidation -> Resolution. Allowed explanatory copy: "aftermath" as human-facing language.
- `P5D1`: Trade Hub remains a support-first, confirmation-safe, capability-aware, and non-dispatching family. Prepared planning levels, user-entered values, readiness, guardrail preferences, and submission-intent seams support decision quality; they do not authorize hidden execution or action pressure.
- `P6D1`: Message policy is a canonical service-owned seam with distinct message-family meaning. `BRIEFING`, `ALERT`, `REORIENTATION`, `REFERRAL`, and `GUARDED_STOP` must not be collapsed or inferred locally in `app/`.
- `P6D2`: Since Last Checked is a compact, account-scoped, meaningful-change briefing. It may clear from Snapshot after view, but continuity belongs in deeper Insights/history seams. It must not become an inbox, badge system, feed, or notification center.
- `P7D1`: Knowledge is now an active product family with library, topic-detail, contextual, glossary, alias, tuning, and Trade Hub term-help planning seams. It remains optional, accessible, service-owned, sparse on live surfaces, and non-gating.
- `P8D1`: Insights may summarize, archive, compare, export, and support journal notes over ledger-backed context, but reflection remains descriptive, calm, non-moralizing, and free of performance theatre.
- `P9D1`: Strategy Preview / Strategy Navigator now has a prepared first-wave foundation through `P9-S1` to `P9-S5`. Visible labeling may use Strategy Preview, but the family remains simulated, descriptive, non-directive, and non-executional.
- `P9D2`: Strategy Navigator fit contrast, nearby alternatives, metadata normalization, and mobile progressive disclosure may deepen explanation, but must not become ranking, recommendation, prediction, or strategy-switch pressure.
- `PXD1`: Prepared service-owned seams and VMs are the preferred product pattern across Snapshot, Dashboard, Trade Hub, Insights, broader context, message policy, knowledge, and Preview surfaces. `app/` remains a renderer of prepared interpretation, not a local interpretation engine.
- `PXD2`: Strategy Fit and 30,000 ft are one descriptive, opt-in context lane. They remain secondary to alignment and must not drift into recommendation, urgency, or regime-override behavior.
- `PXD3`: Selected-account truth is an explicit service-owned seam. Alignment, fit, alerts, risk, message policy, Trade Hub support, and action-support truth remain selected-account scoped; aggregate holdings and exposure may exist only as subordinate context.
- `UXD1`: PocketPilot's visual language is a calm decision cockpit. Snapshot triad supremacy, Dashboard zone hierarchy, MarketEvent as UI atom, semantic color, stable profile identity, and Trade Hub confirmation-state patterns are doctrine-aligned design constraints, not decorative preferences.
- `DOCD1`: `PHASE_MAP.md` is the detailed phase taxonomy and implementation-status ledger. CANON records doctrine and architecture truth plus high-level status alignment; it should not duplicate the full ledger or backlog.

Historical implementation reporting continues in `docs/phases/PHASE_MAP.md`; CANON remains the doctrine and architecture source of truth.

## Conversion Notes

The following prior headings in `docs/governance/CANON.md` were replaced due to conflicts with the authoritative source PDF:
- Trade Hub - Locked Decisions
- Known Issues Register
- Backlog
- Phase Reports
- Phase 1 Summary
- P2C Outcomes
- Current Foundation State
- Next Focus

v0.6 refresh notes:
- Updated stale phase-status language from early `P5-R*`, `P6-A*`, `P7-K*`, `P8-I*`, and `P9-S*` checkpoints to current repo reality.
- Added high-level authority recognition for selected-account seams, prepared service-owned contracts, visual doctrine, knowledge maturity, Since Last Checked continuity, Insights foundations, and Strategy Navigator maturation.
- Did not rewrite North Star, Anti-Vision, or core product philosophy.
