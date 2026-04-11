---
Title: PocketPilot - CANON
Version: 0.5
Source: docs/source/PocketPilot_CANON.pdf
Last Updated: 2026-04-09
---

# PocketPilot - CANON v0.5

Product philosophy, locked architecture decisions, canonical object definitions, and phased delivery rules.

This revision preserves the major section structure of CANON v0.4, adds missing architectural primitives, coalesces phase models, and records genuine tensions where naming or sequencing diverges across sources.

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
- Permitted secondary indicators include strategy fit, volatility context, and signals contributing to alignment, but they must remain visually subordinate to the core triad
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
- Prepared sizing and max-loss outputs may be derived from that same plan and basis, but they stay informational and non-enforcing

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
- Prepared sizing/max-loss shaping stays in services and does not become a hidden enforcement layer
- Execution layer adapts per platform capability
- Bracket/OCO supported -> single API flow
- Separate orders required -> post-trade guided sequence

## Multi-Account Architecture

### 9. Accounts Are First-Class Objects

- Each account contains platform capability matrix, portfolio value, base currency, risk settings, and strategy assignment
- Single-account mode hides unnecessary account selection UI
- Multi-account mode supports a nominated primary account or highest-value fallback

### 10. Single vs Multi-Account UX

- Single account: no account selector shown; all data implicitly scoped to that account
- Multi-account: user can nominate primary account; strategy is assignable per account; switching accounts switches strategy context

### 11. Aggregation Rules

- Allowed: portfolio value aggregation, exposure aggregation, asset-level position aggregation
- Not allowed: aggregated global strategy alignment, aggregated fit signals
- Signals are account-bound

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

- Knowledge now has a landed baseline through library, topic-detail, and contextual-eligibility seams, but it still supports guardrails and orientation without gating features
- Beginner access should be stable and obvious
- Intermediate access should include contextual links during drift or ambiguity
- Advanced access should remain available without constant surfacing
- Knowledge Library should exist as a persistent tab and as a contextual support layer
- Knowledge must remain accessible, optional, and non-intrusive

### 18. Relevance Principle and Message Filtering

PocketPilot avoids signal overproduction by filtering output through Strategy -> Profile -> Relevance.

- Users see signals relevant to their strategy, assets, and account context
- Alert volume must be subordinate to interpreted usefulness
- No raw-indicator-to-push pipeline is allowed

### 19. Strategy Preview / Strategy Navigator

PocketPilot now has a prepared first-wave foundation for this exploratory feature family through `P9-S1` to `P9-S5`. Current implementation may use `Strategy Preview` as the visible exploratory surface label while `Strategy Navigator` remains the canonical internal family name.

- Shows how interpreted events would appear
- Shows how alerts behave
- Shows how the dashboard shifts
- Reduces beginner commitment anxiety
- Must remain simulated, descriptive, and non-directive

### 20. Quick Action Panel Rules

Quick actions belong inside Trade Hub and should remain constrained.

- Default audience: advanced profile or explicit unlock path
- Always require confirmation
- Prefer alignment-strength or equivalent discipline gate before surfacing high-velocity actions
- Do not let quick actions collapse PocketPilot into casino behaviour

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
- Knowledge Library must also support multiple media types and contextual linking from signals, strategies, and events

## Guardrails Philosophy (Phase 2 and Beyond)

- Optional tools: risk limits, daily loss thresholds, cooldowns, position caps
- All opt-in
- All knowledge-backed
- None default-on
- None auto-blocking unless explicitly enabled
- PocketPilot may alert, suggest, or notify. It must not silently prevent or override by default
- Guardrails should mirror informed structure and self-chosen discipline rather than external control
- Strategy logic, market regime, and risk management intersect but do not collapse into one override layer

## Open Questions (Parked)

- Behavioural reflection after consecutive losses
- Extreme crash communication model
- SL/TP hard enforcement mode
- Background monitoring limits
- Account pinning UX refinement
- How much of the financial-PFD metaphor becomes visible language vs internal design principle
- Exact placement of Year in Review and compare-period tooling within Insights
- Whether quick actions remain advanced-only forever or become capability-gated by explicit consent

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

Since v0.5, several subphases and cross-cutting groundwork families have landed. In particular, `P5-R1` to `P5-R5`, `P6-A1` to `P6-A4`, `PX-C1`, `PX-C2`, and `PX-MA1`, `P7-K1` to `P7-K3`, `P8-I1` to `P8-I4`, `P9-S1` to `P9-S5`, `PX-E1` and `PX-E2`, and `PX-API1` to `PX-API5` are now part of repo reality.

`docs/phases/PHASE_MAP.md` is the canonical taxonomy and implementation-status reconciliation document for landed subphases and PX sequencing. PX families remain cross-cutting and do not imply completion of numbered product families.

### Historical / Already Landed

- P0: Vision, doctrine, architecture and repo discipline foundation
- P1: Strategy engine foundations
- P2: Snapshot / provider / governance / debug observatory foundation
- P3: Event system and orientation layer
- P4: Snapshot + Dashboard UX shaping
- P5: Trade Hub and `ProtectionPlan`

### Current Families / Partial Foundations

- P6: Alerts, reorientation, and message policy family; groundwork now exists through the `P6-R*` and `P6-A*` lanes, but the broader family remains incomplete
- P7: Knowledge baseline family; foundation, topic-detail, and contextual-eligibility seams now exist through `P7-K1` to `P7-K3`
- P8: Insights, Event Ledger, Since Last Checked, and reflection family; early foundations landed through `P8-I1` to `P8-I4`
- P9: Pattern Navigator / Strategy Navigator / richer explanation family; a prepared first wave now exists through `P9-S1` to `P9-S5`, while `PX-E*` remains groundwork rather than proof of full `P9` completion

### Later Families

- P10: Beta hardening
- P11: Launch prep

## Decision Register

v0.4 retained decisions remain valid unless explicitly superseded below.

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
- `P6D1`: Message policy is a canonical service-owned seam with distinct message-family meaning. `BRIEFING`, `ALERT`, `REORIENTATION`, `REFERRAL`, and `GUARDED_STOP` must not be collapsed or inferred locally in `app/`.
- `PXD1`: Prepared service-owned seams and VMs are the preferred product pattern across Snapshot, Dashboard, Trade Hub, Insights, broader context, and Preview surfaces. `app/` remains a renderer of prepared interpretation, not a local interpretation engine.
- `PXD2`: Strategy Fit and 30,000 ft are one descriptive, opt-in context lane. They remain secondary to alignment and must not drift into recommendation, urgency, or regime-override behavior.
- `P9D1`: Strategy Preview / Strategy Navigator now has a prepared first-wave foundation through `P9-S1` to `P9-S5`. Visible labeling may use Strategy Preview, but the family remains simulated, descriptive, non-directive, and non-executional.

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
