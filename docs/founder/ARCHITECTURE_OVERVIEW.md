# PocketPilot Architecture Overview

- Title: PocketPilot Architecture Overview
- Source file: `docs/source/PocketPilot Architecture Overview.pdf`
- Last updated: 2026-04-09

File: `docs/founder/ARCHITECTURE_OVERVIEW.md`

Purpose: Explains the core system shape in one page.

## Architecture Flow

```text
Market Providers
  v
Provider Router
  v
QuoteBroker
  v
Selected Account Context
  v
Interpreted Event + Strategy Services
  v
Prepared Service Contracts
  v
User Interface (render only)
```

## Market Providers

External market data sources.

Examples:

- exchange feeds
- pricing APIs
- volatility data
- macro indicators

## Provider Router

Ensures resilience and deterministic routing.

Responsibilities:

- source selection
- fallback logic
- feed consistency
- role-aware provider chains only
- no semantic substitution across source roles

Source-role taxonomy is locked in PX-API1:
- execution
- reference
- macro
- enrichment

## QuoteBroker

Single gateway for price retrieval.

Responsibilities:

- quote budgets
- rate control
- feed selection
- stale / last-good quote policy
- foreground-only quote runtime behavior

For implementation-constraining runtime doctrine, read:
- `docs/architecture/PROVIDER_ROUTER_MODEL.md`
- `docs/architecture/QUOTE_BROKER.md`
- `docs/governance/API_GOVERNANCE.md`

## Selected Account Context

Resolves which account's truth downstream services should use.

Responsibilities:

- preserve account-scoped alignment, fit, alerts, risk, and action support
- keep single-account mode implicit and quiet
- prevent global strategy aggregation drift
- provide one selected-account seam for prepared surface consumers

## Interpreted Event + Strategy Services

Transform raw data into meaningful events and account-scoped strategy context.

Examples:

- TrendShift
- VolatilityExpansion
- MomentumAlignment
- StrategySignal

These services own canonical interpreted truth such as:

- `MarketEvent`
- Event Ledger and query seams
- Strategy Status
- orientation / fit / message inputs
- action-support and readiness context

Events are stored in the Event Ledger and shaped in `services/`, not in `app/`.

## Prepared Service Contracts

PocketPilot now relies on service-owned prepared contracts and VMs for the main product surfaces.

Examples:

- Snapshot
- Dashboard
- Trade Hub
- Insights / Since Last Checked
- 30,000 ft View
- Strategy Preview / Navigator
- message-policy and diagnostics seams

The important rule is the seam:

`services/` own truth and assemble prepared contracts.
`app/` renders those prepared contracts.

## User Interface

Adaptive interface shaped by:

- profile
- strategy
- relevance filtering

The UI does not interpret signals directly.
It does not rank raw events, infer notification meaning, or rebuild risk / readiness logic locally.
It presents the output of the prepared service layer.
