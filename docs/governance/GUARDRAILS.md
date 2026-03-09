Title: Guardrail Checklist Document
Version: Unknown
Source: docs/incoming/GUARDRAILS.pdf
Last Updated: 2026-03-09

# Guardrail Checklist Document

## Required commands

- `npm run lint` must pass
- `npm run test` must pass
- `npm run verify` must run lint + test

## Architectural enforcement

### A. Import boundaries

- `core/` contains no imports from `providers/` or `app/`
- `app/` contains no direct imports from `providers/` (only via `services/`)
- ESLint restricted paths configured and active
- Boundary test exists and fails on violations

### B. Determinism

- No `Date.now()` inside `core/`
- No `Math.random()` inside `core/`
- No network or file IO inside `core/`
- Any "now" is passed as an explicit argument into core functions

### C. QuoteBroker budgets

- QuoteBroker is the single entry point for quote fetching
- Budgets enforced per 5-minute window:
  - CALM <= 20 symbols
  - WATCHING_NOW <= 60 symbols
- Instrumentation counters recorded:
  - requests
  - symbolsRequested
  - symbolsFetched
  - symbolsBlocked
- Tests cover cap behavior and window reset

### D. Certainty/estimated labeling

- Quote type includes `estimated: boolean`
- UI never renders "confirmed" wording when `estimated=true`
- Tests cover certainty text selection

### E. Foreground-only constraint (Phase 1)

- No background tasks/schedulers enabled
- No push notification triggers based on background market polling
- Any scanning occurs only while app is open (foreground)

### F. Git hygiene

- `.gitignore` includes `node_modules/`, `.expo/`, `coverage/`
- `node_modules` not tracked by git
- Git identity configured for commits
- GitHub Action Verify runs on PR + push to main

## "Stop the line" triggers (must not proceed)

- Any boundary violation
- Any change that makes verify red
- Any new feature added without being scheduled in runbook phase
