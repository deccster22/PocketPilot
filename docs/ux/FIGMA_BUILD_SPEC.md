# PocketPilot Figma Build Spec

## Purpose

This document translates PocketPilot's product doctrine and current surface contracts into a Figma-ready mobile system brief.
It is intended to guide the creation of:

- `Foundations`
- `Components`
- `Snapshot`
- `Dashboard`
- `Trade Hub`
- `Playground / Explorations`

PocketPilot is a calm, strategy-first decision-support cockpit.
It is not an exchange UI, an indicator wall, or a hype-driven crypto surface.

## Product Rules To Preserve

- Interpretation before raw data
- Calm over urgency
- Strategy-first framing
- The user remains the pilot
- Profiles change density, not identity
- Snapshot remains sacred and zero-scroll
- Dashboard stays structured, not widget-chaotic
- Trade Hub stays confirmation-safe and non-promotional
- The UI renders prepared truth from `services/`; it does not invent interpretation in `app/`

## Source Alignment

This build spec aligns to:

- [POCKETPILOT_DOCTRINE.md](/D:/PocketPilot_Code/PocketPilot/docs/founder/POCKETPILOT_DOCTRINE.md)
- [PRODUCT_COMPASS.md](/D:/PocketPilot_Code/PocketPilot/docs/founder/PRODUCT_COMPASS.md)
- [SNAPSHOT_SPEC.md](/D:/PocketPilot_Code/PocketPilot/docs/ux/SNAPSHOT_SPEC.md)
- [DASHBOARD_SPEC.md](/D:/PocketPilot_Code/PocketPilot/docs/ux/DASHBOARD_SPEC.md)
- [TRADE_HUB_SPEC.md](/D:/PocketPilot_Code/PocketPilot/docs/ux/TRADE_HUB_SPEC.md)
- [TRADE_HUB_GUARDRAILS.md](/D:/PocketPilot_Code/PocketPilot/docs/ux/TRADE_HUB_GUARDRAILS.md)
- [STRATEGY_STATUS_RULES.md](/D:/PocketPilot_Code/PocketPilot/docs/ux/STRATEGY_STATUS_RULES.md)
- [snapshotScreenView.ts](/D:/PocketPilot_Code/PocketPilot/app/screens/snapshotScreenView.ts)
- [dashboardScreenView.ts](/D:/PocketPilot_Code/PocketPilot/app/screens/dashboardScreenView.ts)
- [tradeHubScreenView.ts](/D:/PocketPilot_Code/PocketPilot/app/screens/tradeHubScreenView.ts)

## Page Structure

Create these pages in this order:

1. `Foundations`
2. `Components`
3. `Snapshot`
4. `Dashboard`
5. `Trade Hub`
6. `Playground / Explorations`

Within `Foundations`, create sections for:

- Color tokens
- Typography styles
- Spacing scale
- Radius and border rules
- Icon and vector language
- Motion notes

Within `Components`, create sections for:

- Status chips
- Trend vectors
- MarketEvent rows
- Prime cards
- Context chips
- Trade plan cards
- Confirmation step rows
- Segmented controls
- Button system
- Tab bar
- Top app bar
- Inline metadata rows

## Foundations

### Color Tokens

PocketPilot should be dark-first with restrained instrument-panel contrast.

Core tokens:

- `bg/base = #0E131A`
- `bg/elevated-1 = #141B24`
- `bg/elevated-2 = #1A2330`
- `border/subtle = #253140`
- `text/primary = #E8EEF5`
- `text/secondary = #A7B3C2`
- `text/tertiary = #738194`
- `info/base = #5F87B8`
- `info/soft = #22364D`
- `amber/base = #C8943F`
- `amber/soft = #3B2D18`
- `danger/base = #A86464`
- `danger/soft = #382122`

Optional supporting tokens:

- `surface/active = #203042`
- `surface/muted = #111821`
- `border/strong = #314155`
- `text/inverse = #0E131A`

Semantic rules:

- Grey handles neutral structure
- Blue handles informational context
- Amber handles watchfulness, change, and forming conditions
- Red is reserved for safety-only or truly exceptional states
- Green should not be used as the default language for completion
- Weakening should not default to red unless it is safety-critical
- Avoid bright green / bright red emotional framing
- Avoid neon accents and celebratory gain color logic

### Typography

Use a restrained sans-serif such as Inter.
Financial values should use tabular numerals.

Create styles:

- `Display / Snapshot Current State`
- `H1 / Section Focus`
- `H2 / Prime Card Title`
- `Body / Interpretation`
- `Body Small / Support Copy`
- `Meta / Timestamp and Scope`
- `Numeric Large / Key Value`
- `Numeric Small / Supporting Value`

Typography rules:

- Stabilize number width
- Keep labels legible under stress
- Avoid decorative finance typography
- Use weight and spacing, not color drama, for hierarchy

### Spacing

Use one consistent scale:

- `4`
- `8`
- `12`
- `16`
- `24`
- `32`

Spacing posture:

- Snapshot should feel open and calm
- Dashboard can tighten density without becoming busy
- Trade Hub should slow the user down through deliberate spacing

### Radius, Borders, Effects

- Card radius: `12`
- Chip radius: `999`
- Border weight: `1`
- Borders: cool-toned and low-contrast
- Shadows: minimal, soft, rare

Avoid:

- Glassmorphism
- Glossy fintech treatments
- Fake cockpit skeuomorphism

### Icon And Vector Language

- Use thin or medium-weight directional marks
- Prefer geometric, precise vectors over expressive crypto iconography
- Trend arrows should feel measured, not animated
- Dots, chevrons, and arrows should read as instrumentation, not decoration

### Motion Notes

- Motion is functional and brief
- Use transitions to confirm orientation or state change
- Do not use flashing, pulsing, looping, bouncing, or countdown mechanics
- Snapshot transitions should feel quiet and meaningful
- Trade Hub transitions should reinforce confirmation flow, not speed

## Component System

### 1. Status Chip

Variants:

- `neutral`
- `informational`
- `forming`
- `estimated`
- `risk`

Anatomy:

- Small dot or directional icon
- Short label
- Optional vector suffix

Example labels:

- `Forming ↗`
- `Strengthening ↗`
- `Weakening ↘`
- `Mixed ↔`
- `Estimated`

Usage rules:

- Compact
- Secondary to headlines
- Should support Strategy Status and message context without shouting

### 2. Trend Vector

Build a small primitive for:

- `up`
- `down`
- `flat`
- `mixed`

Vector rules:

- Quiet
- Precise
- Small enough to pair with chips and inline metadata

### 3. MarketEvent Row

This is the core interpreted unit for Dashboard.

Shared anatomy:

- Event label
- Symbol or strategy scope
- One interpretation line
- Certainty treatment
- Timestamp
- Optional signal context
- Optional narration

Variants:

- `Profile=Beginner`
- `Profile=Intermediate`
- `Profile=Advanced`

Profile rules:

- Beginner shows more labels and a fuller interpretation line
- Intermediate balances readability and density
- Advanced reduces narration and tightens scan rhythm

### 4. Prime Card

Use in Dashboard Prime Zone.

Anatomy:

- Title
- Why it matters
- Short supporting state or value line
- Optional beginner explanation

Rules:

- Interpreted meaning leads
- Data supports, never dominates
- Above-the-fold importance without becoming a banner

### 5. Context Chip

Subordinate context only.

Examples:

- `Volatility Elevated`
- `Fit Mixed`
- `2 Events Active`
- `Estimated`

Rules:

- Visually softer than status chips
- Used beneath Snapshot triad or inside Dashboard supporting context

### 6. Trade Plan Card

Anatomy:

- Plan title
- Rationale
- Readiness
- Constraints
- Confirmation requirement

Tone:

- Checklist-like
- Deliberate
- Serious
- Never styled like an order ticket

### 7. Confirmation Step Row

States:

- `pending`
- `acknowledged`
- `blocked`
- `unavailable`
- `complete`

Anatomy:

- Step label
- State marker
- Explanation
- Optional acknowledgement affordance

State semantics:

- `pending` stays neutral
- `acknowledged` uses informational blue
- `blocked` should feel calm and procedural, not alarming
- `unavailable` should feel neutral and quiet
- `complete` should read as confirmed and settled, not celebratory

### 8. Buttons

Variants:

- `primary`
- `secondary`
- `tertiary`
- `destructive-guarded`
- `disabled`

Rules:

- Intentional, not promotional
- Moderate height
- Strong distinction between guarded and standard actions
- Guarded actions should lean calm amber or neutral procedural treatment, not loud red unless safety-critical
- No oversized casino CTA energy

### 9. Segmented Control

Use for bounded scope changes only.

Examples:

- Profile density preview
- Trade Hub risk basis
- Compact view switching

### 10. Top App Bar

Include:

- Surface title
- Current account or strategy scope
- Optional quiet action slot

Rules:

- Minimal chrome
- Surface should still feel like the focus, not the app bar

### 11. Tab Bar

Target current shell structure:

- `Dashboard`
- `Preview`
- `Trade Hub`
- `Insights`
- `Knowledge`

Rules:

- Calm cockpit footing
- Active state should feel selected, not promoted
- Use softened active fill and restrained border treatment

### 12. Inline Metadata Row

Used for:

- Timestamps
- Account scope
- Strategy ID
- Certainty notes
- Supporting event counts

Rules:

- Quiet
- Small
- Scannable
- Useful in both cards and row components

## Anchor Surface: Snapshot

### Purpose

Snapshot answers:
`What is going on for my strategy right now?`

### Canonical Core

The sacred triad remains dominant:

- `Current State`
- `Last 24h Change`
- `Strategy Status`

Secondary layers may include:

- One inline briefing zone
- One opt-in 30,000 ft affordance
- Quiet subordinate context

Snapshot must remain zero-scroll on representative mobile devices.
The triad should read like one instrument cluster, not three separate cards.

### Layout Direction

Use one coherent instrument cluster rather than three equally weighted cards.

Recommended stack:

1. Top scope line
2. Dominant Current State
3. Supporting dual row for change and strategy status
4. Optional subordinate context chips
5. Optional quiet briefing teaser
6. Optional 30,000 ft affordance below the briefing lane

Keep context chips sparse so they support the triad rather than repeat it.
The briefing teaser should feel tucked into the lane, not like a competing card.

### Required Frames

Create:

- `Snapshot / Default`
- `Snapshot / With Context Chips`
- `Snapshot / With Since Last Checked`
- `Snapshot / Beginner`
- `Snapshot / Intermediate`
- `Snapshot / Advanced`

### Snapshot-Specific Rules

- No charts
- No raw indicator sprawl
- No dramatic banners
- No volatility theatre
- The briefing lane must remain subordinate to the triad
- Strategy Status should include a compact status light or chip treatment

## Anchor Surface: Dashboard

### Purpose

Dashboard answers:
`How does this affect my strategy?`

### Structural Model

Use three zones:

- `Prime Zone`
- `Secondary Zone`
- `Deep Detail`

The repo contract already treats Dashboard as a structured surface, not a flattened event feed.

### Layout Direction

Recommended stack:

1. Stable top app bar with account and strategy scope
2. Prime Zone above the fold
3. Optional explanation note attached to the prepared prime item
4. Optional account context and aggregate holdings cards
5. Secondary Zone
6. Deep Detail collapsed by default

### Required Frames

Create:

- `Dashboard / Default`
- `Dashboard / Beginner`
- `Dashboard / Advanced`

### Dashboard Rules

- Prime Zone must feel immediately above the fold
- One hero interpreted item should clearly lead the Prime Zone
- Interpreted meaning must appear before raw values
- Customization should tune emphasis, not create widget chaos
- Account and aggregate portfolio context remain subordinate to Prime content
- Explanation stays on Dashboard only
- Advanced mode should tighten row rhythm and reduce medium-card repetition

## Anchor Surface: Trade Hub

### Purpose

Trade Hub answers:
`What prepared action path is available, and what would confirmation require?`

### Structural Model

Recommended stack:

1. Context header
2. Primary trade plan
3. Limited alternatives
4. Protection and risk framing section
5. Confirmation flow section
6. Capability or blocked-state note when relevant

### Required Frames

Create:

- `Trade Hub / Primary Plan`
- `Trade Hub / With Alternatives`
- `Trade Hub / Confirmation Flow`
- `Trade Hub / Blocked`

### Trade Hub Rules

- Entry intent and protection planning must be visibly separated
- Primary plan should feel prepared, not promoted
- Alternatives must stay visibly subordinate and lower-emphasis
- Protection framing should remain visible without competing with the primary plan
- Constraints and readiness must be visible
- Confirmation flow should read like pre-flight checks
- No one-tap or exchange-adrenaline tone
- Blocked and unavailable states should read as calm procedural states, not alarms

## Profile Shaping

Profiles adjust density and scaffolding only.

### Beginner

- Labels always visible
- More explanation
- Softer interpretation copy
- Lower signal density

### Intermediate

- Balanced density
- Optional help affordances
- Moderate supporting detail

### Advanced

- Denser rows
- Reduced narration
- Faster scan rhythm
- More compact signal context

Do not change:

- The component family
- The page structure
- The product tone
- The overall visual identity

## Suggested Build Order

1. Foundations tokens and text styles
2. Navigation primitives
3. Status chips and vectors
4. Inline metadata rows and context chips
5. MarketEvent row variants
6. Prime cards
7. Trade plan cards
8. Confirmation step rows
9. Snapshot frames
10. Dashboard frames
11. Trade Hub frames
12. Playground variants and density studies

## Mapping To Current App Contracts

Use these repo seams as the truth source during design:

- Snapshot core and briefing lane: [snapshotScreenView.ts](/D:/PocketPilot_Code/PocketPilot/app/screens/snapshotScreenView.ts)
- Dashboard zones, explanation, account context, aggregate holdings: [dashboardScreenView.ts](/D:/PocketPilot_Code/PocketPilot/app/screens/dashboardScreenView.ts)
- Trade Hub plans, risk framing, and message posture: [tradeHubScreenView.ts](/D:/PocketPilot_Code/PocketPilot/app/screens/tradeHubScreenView.ts)

Design should assume:

- `services/` decides meaning and priority
- `app/` formats prepared outputs for display
- surface-specific copy stays calm and observational

## Anti-Patterns To Reject

- Flashy volatility theatre
- Raw indicator stacks on primary surfaces
- Green/red emotional trading logic
- Hype copy
- Snapshot chart junk
- Freeform dashboard chaos
- Giant promotional CTAs
- One-tap execution energy
- Generic exchange styling
- Visual identity shifts between profile modes
- Emotionally loud green complete / red blocked logic

## Definition Of Success

The resulting Figma work should make the user feel:

- calmer
- smarter
- more oriented
- more in control

If a screen starts to look like a cleaner Binance clone, the build has drifted.
