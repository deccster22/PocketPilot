\# PocketPilot (Phase 0 Foundation Lock)
.


PocketPilot is scaffolded as an Expo + TypeScript React Native app with architecture guardrails for deterministic core logic.



\## Tech Stack



\- Expo (React Native)

\- TypeScript

\- ESLint + Prettier

\- Jest (ts-jest)



\## Project Structure



\- `core/` — deterministic, pure domain logic only

\- `providers/` — network/device adapters (QuoteBroker + haptics provider)

\- `app/` — UI and orchestration glue

&nbsp; - `app/screens/`

&nbsp; - `app/components/`

&nbsp; - `app/state/`

&nbsp; - `app/styles/`



\## Setup



```bash

npm install

