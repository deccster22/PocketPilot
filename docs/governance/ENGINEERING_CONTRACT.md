---
Title: PocketPilot - P0 Engineering Contract
Version: 0.1
Source: docs/incoming/ENGINEERING_CONTRACT.pdf
Last Updated: 2026-03-02
---

# PocketPilot - P0 Engineering Contract

Version: 0.1  
Generated: 2026-03-02  
Purpose: Define architectural boundaries, guardrails, and enforcement rules locked during Phase 0.

## 1. Architecture Map

- Layer hierarchy: `app/` -> `services/` -> `core/` + `providers/`
- `core/` is deterministic and side-effect free.
- `core/` must not import `providers/` or `app/`.
- `app/` must not import `providers/` directly (use `services/`).
- All network/device/storage interactions live in `providers/`.
- All orchestration logic lives in `services/`.
- All quote fetching must pass through `QuoteBroker`.

## 2. Folder Structure (Phase 0 Baseline)

- `docs/`
  - `README.md`
  - `incoming/`
  - `source/`
  - `governance/`
  - `product/`
  - `architecture/`
  - `phases/`
- `.github/workflows/`
- `package.json`
- `tsconfig.json`
- `jest.config.js`
- `babel.config.js`
- `eslint.config.js`
- `.gitignore`

## 3. Determinism Contract

- No `Date.now()` inside `core/`.
- No `Math.random()` inside `core/`.
- No network calls inside `core/`.
- Time must be injected explicitly as function arguments.
- All pure logic must be testable without mocks.

## 4. QuoteBroker Enforcement Rules

- `QuoteBroker` is the single entry point for quote fetching.
- 5-minute window budgets enforced: `CALM <= 20`, `WATCHING_NOW <= 60`.
- Instrumentation tracks: `requests`, `symbolsRequested`, `symbolsFetched`, `symbolsBlocked`.
- Window resets after 5 minutes.
- Unit tests cover cap behavior and reset logic.

## 5. Certainty & Data Integrity Rules

- Quote type must include: `estimated: boolean`.
- UI must never render confirmed language if `estimated = true`.
- Execution-bound decisions must use execution account quote source.
- No global feed used for execution prompts.

## 6. Foreground-Only Constraint (Phase 1 Lock)

- No background monitoring.
- No push notifications triggered by background polling.
- Scanning occurs only while app is in foreground.

## 7. CI & Git Hygiene

- `npm run lint` must pass.
- `npm run test` must pass.
- `npm run verify` runs lint + test.
- `.gitignore` excludes `node_modules/`, `.expo/`, `coverage/`.
- `node_modules` must never be committed.
- Verify GitHub Action must pass on push to `main`.

## 8. Stop-The-Line Triggers

- Any architectural boundary violation.
- Any failing verify run.
- Any unscheduled feature introduced outside runbook phase.
- Any breach of data integrity rule.
