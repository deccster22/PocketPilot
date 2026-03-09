# PocketPilot — AGENTS.md
This file is the authoritative operating manual for AI coding agents (Codex) and human contributors.
PocketPilot is a deterministic, strategy-first mobile app. The product must never pressure users into action.
We optimize for correctness, determinism, clarity, and long-term maintainability over speed.

---

## 0) Golden Rules (Non-Negotiable)
1) **Deterministic core**
   - `core/` logic must be pure + deterministic.
   - No ambient time (`Date.now()`), randomness, network, device APIs, storage, or global mutable state in `core/`.
   - If time is needed, accept `nowMs` as an argument (explicit dependency injection).

2) **Architecture boundaries**
   - `core/` MUST NOT import from `app/`, `providers/`, or `services/`.
   - `services/` may import from `core/` and orchestrate workflows.
   - `providers/` are adapters to device/network and may import from `core/` for pure helpers only.
   - `app/` is UI only and calls `services/` to obtain view models / outputs.

3) **Read-only MVP behavior**
   - Until explicitly unlocked in a later phase, **PocketPilot does not execute trades**.
   - All outputs are informational: signals, status, explanations, history snapshots.

4) **Estimated vs confirmed**
   - Any market/quote value that is not guaranteed must be explicitly labeled with `estimated: true`.
   - UI must never present estimated data as confirmed.

5) **No secrets in repo**
   - Never commit API keys, tokens, secrets, `.env` with real values.
   - Use `.env.example` and documented setup.

6) **Small, reviewable increments**
   - Prefer multiple small PRs over one big PR.
   - Every PR must pass `npm run verify`.

---

## 1) Repo Layout
- `core/`  
  Deterministic domain logic: strategies, types, math helpers, pure transforms.

- `services/`  
  Orchestration layer. Calls providers, runs scans, selects execution account, runs strategy pipelines, produces outputs for UI.

- `providers/`  
  Adapters for device/network behavior (haptics, quote fetching). Must be mockable in tests.

- `app/`  
  React Native UI. No business logic beyond wiring + display. Uses `services/` for data.

- `docs/`  
  Phase contracts, governance rules, security policy, onboarding docs for contributors/agents.

---

## 2) Command Contract (What must work)
Run these from repo root:

- Install:
  - `npm install`

- Quality gate (must pass before merge):
  - `npm run verify`

- Optional local dev:
  - `npm run start`

If `verify` fails, fix it. Do not bypass quality gates in normal workflow.

---

## 3) Testing Standards
- Unit tests live next to code under `__tests__/`.
- Add tests for:
  - deterministic behavior (explicit time inputs)
  - tie-break rules (stable outcomes)
  - architecture boundary enforcement
  - budget/throttle caps
  - estimated labeling behavior

Prefer Jest unit tests over UI/E2E at early phases.

---

## 4) Determinism Patterns (Copy these)
✅ Good:
- `function computeX(input, nowMs) { ... }`
- pass `nowProvider` into a service constructor
- pure functions in `core/` returning plain objects

❌ Bad:
- `Date.now()` in `core/`
- network calls in `core/`
- reading environment variables in `core/`
- `Math.random()` in `core/`
- importing `expo-*` modules anywhere except adapters/providers/app

---

## 5) Strategy Engine Guardrails
- Strategies should be:
  - side-effect free
  - input-driven (quotes/deltas/metadata passed in)
  - explicit about confidence/estimated data
- Avoid hidden state in strategies. If state is needed, design it as:
  - explicit `StrategyState` input/output object (pure transform)

---

## 6) Provider + Router Expectations
Providers must:
- expose a small interface (e.g., `getQuotes(accountId, symbols, nowMs)`).
- return normalized `Quote` objects with `source`, `timestampMs`, `estimated`.
- be mockable in tests (inject fetchers/adapters).

Router/broker must:
- be deterministic
- enforce budgets (e.g., 5-minute window caps)
- provide instrumentation counters
- degrade gracefully (return empty/estimated where appropriate)

---

## 7) Security & Secrets Policy (Phase 2+)
- Add `.env.example` with placeholder keys only.
- Add `core/config/Config.ts` to read env ONLY in non-core layers (`services/`, `providers/`, `app/`).
- Add redaction utilities for logs (strip secrets).
- If adding a secret scan script:
  - it must ignore `node_modules/`
  - it must be documented in `docs/security/`

No credential or real API key should ever appear in:
- commits
- PR descriptions
- logs copied into issues
- screenshots

---

## 8) Git + PR Workflow (Local-first, PR required)
PocketPilot uses **PR-based merges**. Do not push directly to `main`.

Human workflow:
1) `git checkout -b <branch>`
2) apply patch / implement changes
3) `npm run verify`
4) commit
5) push branch
6) open PR into `main`
7) wait for Actions “verify” to pass
8) merge PR

If branch protection blocks you, do not bypass unless you explicitly choose to temporarily relax rules.

---

## 9) Patch Delivery Expectations (for Codex)
When generating a patch:
- Include **every file added/changed** (no “workspace-only” output).
- Keep diffs minimal and scoped to the phase contract.
- Update docs if behavior changes.
- Ensure tests cover new behavior.

Agent completion report MUST include:
- what changed (file list)
- tests run + results
- any new scripts/commands added
- any risks or follow-ups

---

## 10) “Do Not Do” List (Common Drift)
- Do NOT introduce backend services unless a phase explicitly calls for it.
- Do NOT add trading execution logic.
- Do NOT add analytics/telemetry without a privacy policy phase.
- Do NOT add complex UI navigation frameworks prematurely.
- Do NOT refactor architecture unless required to satisfy a phase contract.
- Do NOT remove safeguards (estimated labeling, budgets, throttles).

---

## 11) Phase Discipline
PocketPilot phases are contract-driven. For any change:
- identify the phase (e.g., P2C-1)
- implement only what the phase requires
- add tests
- update `docs/phases/<phase>.md` if it exists

If something feels like “nice to have”, put it in:
- `docs/backlog.md` (or leave a TODO note + rationale)

---

## 12) Helpful Context (Product Intent)
- Beginner: companion, orientation, clarity, minimal overload.
- Middle: broaden strategies + learning through signals and outcomes.
- Advanced: empower via data access + configurability, no patronizing tone.

Always preserve:
- calm, non-hype language
- opt-in coaching (where relevant)
- clear explainers via knowledge links (later phases)

---

## 13) If something is unclear
Default behavior:
- choose the most deterministic option
- preserve existing architecture
- add tests that lock behavior
- document assumptions in the phase doc / PR summary
