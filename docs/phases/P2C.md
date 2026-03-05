# P2C — Governance Contract + Secrets & Config Foundation

## Purpose
P2C establishes the phase contract and minimal safeguards needed before provider/API expansion work. It creates one typed configuration module, secret redaction helpers, and a lightweight CI secret tripwire.

## Scope
- Define P2C Definition of Done (DoD) and sub-phases (P2C-0..P2C-4).
- Introduce a single typed config module for runtime environment access.
- Add redaction helper for logs and debug surfaces.
- Harden local/git hygiene for env and secret files.
- Add CI secret scanning step for pull requests.

## Non-Goals
- No real provider integrations.
- No backend services.
- No privileged keys stored in the mobile app.
- No strategy, scan, or business behavior changes.

## Definition of Done
- `npm run verify` passes.
- App runs in development on simulator/device (`npm start` / Expo start).
- No secrets in the repository, validated via secret scan.
- A single config module exists and is the only allowed source for env reads.
- P2C-0 through P2C-4 are documented.

## Sub-Phases
- **P2C-0**: Governance contract + branch/PR discipline baseline.
- **P2C-1**: Typed config foundation + redact helper + git hygiene.
- **P2C-2**: Provider router wiring (no privileged secrets in app).
- **P2C-3**: Mock/live provider interface hardening and telemetry-safe logging.
- **P2C-4**: Release-readiness checks and docs consolidation.

## PR Plan (recommended)
1. **PR 1 (P2C-0/P2C-1)**: phase contract doc, config module, redaction helper, `.env.example`, `.gitignore` hardening, secret scan tripwire.
2. **PR 2 (P2C-2)**: provider router abstraction + demo/mock/live switching paths.
3. **PR 3 (P2C-3)**: provider interface hardening and safe observability integration.
4. **PR 4 (P2C-4)**: final verification pass, docs cleanup, and release checklist.

## Merge Discipline
- Keep `main` protected.
- Pull request review required before merge.
- Prefer squash merge to keep history compact.
- TODO: Confirm required review count and status check set in repository settings.

## Key Risks & Mitigations
- **Risk:** Secret leakage in commits or CI logs.  
  **Mitigation:** Ignore env files, add secret tripwire, redact matched output.
- **Risk:** Config drift across modules.  
  **Mitigation:** Single typed config module + automated env access boundary test.
- **Risk:** Accidental behavior changes while laying config groundwork.  
  **Mitigation:** Demo-safe defaults and no strategy/provider logic changes in this phase.
