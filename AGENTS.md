# PocketPilot — Codex Agent Instructions (AGENTS.md)

## Canon & Authority
- The PocketPilot product is governed by: PP_CANON v0.2.
- If a request conflicts with Canon, do not implement it. Propose a Canon-compliant alternative.
- Do not introduce new features outside the active milestone scope.

## Non-Negotiables (Anti-Vision)
Do NOT:
- add urgency language, gamification, rewards, leaderboards, performance ranking
- auto-switch strategies or recommend strategy changes
- implement global strategy signals that are not execution-venue accurate
- implement background monitoring in Phase 1
- create “always watching” claims

## Architecture Rules (Hard)
- /core MUST be deterministic and pure:
  - no network, no storage, no device APIs, no Date.now(), no random
  - no imports from /providers or any device/network code
- /providers contains network and device abstractions only
- /app contains UI + orchestration glue
- All price/quote access MUST go through QuoteBroker
- All haptics MUST go through HapticThrottle
- “Estimated” data MUST never be presented as confirmed certainty

## Multi-Account & Data Integrity
- Strategy alignment is ACCOUNT-SCOPED.
- Execution-bound calculations MUST use execution account price feed.
- Aggregation is allowed for positions/value only. No aggregated strategy alignment.

## Milestone Scope
### Phase 0 (Foundation Lock)
Implement:
- repo scaffolding, TypeScript, linting
- layer boundaries + import restrictions
- QuoteBroker skeleton + budgets
- HapticThrottle utility
- basic test harness enforcing core purity

### Phase 1 (M1 First Win MVP)
Implement:
- account-scoped strategy engine + schema
- Snapshot (sacred fields only)
- Mini Dashboard + Why panel
- foreground-only scan simulation using QuoteBroker
- strict caps, estimated labeling, haptic throttling

## Style & Quality
- Prefer small commits / PR-sized changes.
- Add tests for every critical rule (core purity, quote caps, throttle).
- Write clear README setup steps.
- Keep copy neutral, calm, non-advisory.

## Output Expectations
- Always provide: what changed, why, how to run tests, how to verify manually.
- Do not leave TODOs for core logic without stubs/tests.
