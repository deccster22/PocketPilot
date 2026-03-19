# PocketPilot Architecture Overview

- Title: PocketPilot Architecture Overview
- Source file: `docs/source/PocketPilot Architecture Overview.pdf`
- Last updated: 2026-03-20

File: `docs/founder/pocketpilot-architecture-overview.md`

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

## QuoteBroker

Single gateway for price retrieval.

Responsibilities:

- quote budgets
- rate control
- feed selection

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

Primary surfaces:

- Snapshot
- Since Last Checked
- Dashboard
- 30,000 ft View
- Insights

## User Interface

Adaptive interface shaped by:

- profile
- strategy
- relevance filtering

The UI does not interpret signals directly.
It presents the output of the Orientation Layer.
