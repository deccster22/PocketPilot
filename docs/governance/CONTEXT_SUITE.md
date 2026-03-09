Title: PocketPilot Context Suite v0.2.1
Version: v0.2.1
Source: docs/incoming/CONTEXT_SUITE.pdf
Last Updated: 2026-03-02

# PocketPilot Context Suite v0.2.1

Generated: 2026-03-02

Purpose: a surgical, chat-light context pack you can paste into new build chats so we keep velocity without CCC-style drift, prompt ghosting, or browser-melting threads.

## How to use this pack (the 60-second ritual)

- Keep this current chat as: Governance / Architecture / Canon arbitration only. No feature building here.
- Each build milestone gets its own Dev Build Chat (P0-P11). That chat only implements the next prompt pack and posts a short "Phase Completion Report" back here.
- Before starting any new Dev Build Chat: paste the "Dev Chat Master Context Block" (Section 3) as message #1, then paste the current "Locked Decision Register" (Section 2).
- Anytime a decision changes: update Section 2 (single source of truth). Everything else adapts to it.
- If a chat starts repeating itself or answering ghosts: stop, paste the 3-line "Context Refresh" template (Section 1), continue.

## 1) Champ-to-Champ Explainer (above the primers)

### What PocketPilot is (and is not)

- PocketPilot is a strategy-first market companion: it explains, monitors while open, and alerts. It does not auto-trade.
- It is execution-aware: strategy alignment uses the quote feed for the account/platform you would actually trade on.
- It is calm: no urgency language, no gamified outcomes, no shame, no "you missed it" energy.

### The "clarity stack" we're building

- Snapshot (sacred): Now + 24h change + strategy alignment only. No regime drama, no fit warning, no behavioural commentary.
- Dashboard: strategy signals + optional fit + optional regime (profile-scaled).
- Why panel: explains alignment with metric breakdown, in neutral language.
- History/Insights (later): "Since last checked", then longer-range "Wrapped"-style summaries, fully opt-in.

### What success feels like (3 profiles)

- Beginner: companion vibe, soft language, always-easy access to learning. Comfortable, oriented, fewer big mistakes.
- Middle: strategy breadth + learning from misses. Optional reorientation and context.
- Advanced: instrument panel. Fast, terse, configurable, no handholding by default.

### Context Refresh template (paste when a chat starts wobbling)

CONTEXT REFRESH (paste):
We are executing PocketPilot under CANON v0.2. We are currently at Phase __ / Milestone __.
Non-negotiables: snapshot sacred; strategy account-scoped; core deterministic; quote broker caps; foreground-only; no hype; no background scanning in Phase 1.
Proceed with only the next step in the runbook, no refactors, no new features.

## 2) Locked Decision Register (authoritative)

### Product philosophy (non-negotiables)

- Clarity-first. Calm tone. Non-gamified. User-directed.
- No urgency language; no profit promises; no "AI trading bot" framing.
- Foreground-only monitoring in v0.x Phase 1.

### Architecture rails (non-negotiables)

- core is deterministic and side-effect free: no network calls, no device APIs, no Date.now() inside core.
- providers wrap all network/device functionality (quotes, haptics, notifications, storage).
- UI calls services; services call providers + core.
- Quote Broker becomes the single entry point for quote fetches once introduced, enforcing budgets.

### Account scoping + multi-account rules

- Strategy alignment is account-scoped and must use the execution account's quote source.
- No aggregated global strategy alignment. Aggregation is allowed for portfolio value/exposure only.
- Primary account default for multi-account; if none chosen, highest portfolio value auto-select.
- Snapshot modes (multi-account): Primary (default), All Accounts compact, Aggregate (positions only). Dashboard remains account-scoped.

### Regime + Fit (where they live)

- Regime is contextual, not controlling. No global overrides. Strategy logic may consider regime internally.
- Regime exposure scales by profile: beginner off by default (simplified if enabled), middle on (simple label + phrase), advanced full stats.
- Fit indicator lives on Dashboard, not Snapshot: subtle Favourable/Mixed/Unfavourable spectrum, no percentages, no red alarms.

### Trade Hub: SL/TP + risk layers

- SL/TP calculator lives inside Trade Hub (slide-up panel). Never auto-applies; always confirm.
- Risk basis toggle: Trade Amount (position risk) vs Portfolio risk. Show max loss in both contexts for clarity.
- ProtectionPlan object captured on calculate: accountId, entry intent, stop, take profit, basis, timestamp, status.
- Execution flow adapts to platform capabilities (bracket/OCO vs sequential orders). Calculator logic remains platform-independent.

### Data integrity: price source rule

- For any execution-bound decision (alignment, risk, SL/TP), use the data from that execution account/platform.
- Any "global" price comparison can exist only as an explicitly labelled secondary view (advanced), never as the basis for prompts that influence execution.

### Logging / Insights

- Event log stores raw events plus strategy marker determined automatically where feasible.
- Reorientation summary is opt-in and never forced; advanced default off (but logs still captured).
- Exports: CSV is supported but gated to higher profiles; no social-media-ready share format.

## 3) Dev Build Chat Primer v2 (paste into new Dev Build thread)

### Dev Chat Master Context Block

Project: PocketPilot (phone-first, strategy-first clarity companion)

Authority: CANON v0.2 + this Locked Decision Register. Runbook phases 0-11 define scope and gates.

Non-negotiables:

- core/ must never import providers/ or app/
- app/ must never import providers/ (use services)
- core must be deterministic: no network, no device APIs, no Date.now()
- QuoteBroker is the only way to fetch quotes once introduced
- Foreground-only monitoring in Phase 1
- Estimated data must never be presented as confirmed certainty
- Strategy alignment is account-scoped; no global aggregated strategy signals

Budgets:

- CALM <= 20 quote-symbol fetches per 5 minutes
- WATCHING_NOW <= 60 quote-symbol fetches per 5 minutes

Operating discipline:

- Implement only the next runbook step.
- No refactors, no redesigns, no "nice-to-haves" unless explicitly scheduled.
- If blocked, stop and paste logs + current phase + expected vs actual.

### What to paste back to Governance chat after each milestone

- Phase Completion Report: phase, commit hash, what changed, what tests passed, any known issues, next phase target.
- Diff summary: added/modified files list (high level).
- Any deviations requested by platform constraints (and how they were mitigated).

## 4) Agent Operating Model (deployment + outputs)

- Agents are used for: compilation of prompt packs, provider semantics validation, copywriting packs, education drafts, accessibility audit, test plan, release hygiene, beta support SOP.
- Agents are not used for: inventing new features, changing architecture, or relaxing honesty rules.
- Every agent output must land as a file in repo (or docs folder) with explicit filename and definition-of-done.

### Top tasks and when to deploy

- A1 Prompt-Pack Compiler: before each milestone pack; outputs PROMPT_PACK_M1..M5 files.
- A2 Provider Semantics Validation (Swyftx): before M1; rerun pre-beta.
- A3 Copywriting Pack: before M2; rerun pre-beta.
- A4 Education Library Drafting: after M2 UI exists.
- A5 Accessibility Audit: after M2, rerun after M3.
- A7 Test Plan + Edge Case Catalog: after M1; rerun before M4.
- A9 Beta Support SOP: before DIAG++ / beta start.

## 5) Tech stack, local setup, and the "gotchas" we already hit

- Stack: Expo + React Native + TypeScript, Jest, ESLint/Prettier.
- Windows PowerShell gotcha: npm.ps1 blocked until ExecutionPolicy set to RemoteSigned (CurrentUser).
- Git gotcha: you must set git user.name and user.email before commits.
- GitHub gotcha: never commit node_modules; ensure .gitignore exists early.
- Jest gotcha: ESM packages like expo-haptics may require mocking in unit tests (we solved this in Phase 0).

## Appendix A: Suggested repo guardrails (CI-lite)

- verify workflow runs: npm ci, npm run verify.
- Branch protection (if used): require verify check to pass; avoid mandatory approvals for solo repo.
- Keep main protected, but don't block yourself from quick fixes during early R&D.
