# PocketPilot (Phase 0 / Phase 1 Foundation)

PocketPilot is an Expo + TypeScript React Native app with architecture guardrails for deterministic core logic.

## Tech Stack
- Expo (React Native)
- TypeScript
- ESLint + Prettier
- Jest (ts-jest)

## Project Structure
- `core/` — deterministic, pure domain logic only
- `providers/` — network/device adapters (QuoteBroker + haptics provider)
- `services/` — orchestration services used by app screens
- `app/` — UI and view-level state
- `docs/phases/` — phase contracts and delivery plans

## Setup
```bash
npm install
```

## Development Commands
```bash
npm run start
npm run test
npm run lint
npm run verify
npm run secret-scan
```

## Configuration
- Copy `.env.example` to a local env file (for example `.env.local`) and adjust values as needed.
- Runtime env access should go through `core/config/Config.ts` only.

## Phase Docs
- P2C governance + secrets/config contract: `docs/phases/P2C.md`
