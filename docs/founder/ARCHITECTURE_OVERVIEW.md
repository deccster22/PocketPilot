# PocketPilot Architecture Overview

- Title: PocketPilot Architecture Overview
- Source file: `docs/source/PocketPilot Architecture Overview.pdf`
- Last updated: 2026-04-08

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
Market Event Engine
  v
Strategy Engine
  v
Orientation Layer
  v
User Interface
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

## Market Event Engine

Transforms raw data into meaningful events.

Examples:

- TrendShift
- VolatilityExpansion
- MomentumAlignment
- StrategySignal

Events are stored in the Event Ledger.

## Strategy Engine

Evaluates events against strategy frameworks.

Outputs:

- forming
- developing
- confirming
- resolved

These states drive alerts and dashboard interpretation.

## Orientation Layer

Translates strategy states into human-readable insight.

It now reaches users through prepared service-owned seams and surfaces such as:

- Snapshot
- Dashboard
- Trade Hub
- Insights / Since Last Checked
- 30,000 ft View
- Strategy Preview / Navigator
- message-policy and context seams as prepared intermediates

## User Interface

Adaptive interface shaped by:

- profile
- strategy
- relevance filtering

The UI does not interpret signals directly.
PocketPilot increasingly relies on prepared service-owned contracts and VMs, with `app/` rendering prepared output rather than deriving interpretation locally.
It presents the output of the Orientation Layer.
