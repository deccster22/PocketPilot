---
Title: API Governance Specification
Version: 0.1
Source: docs/incoming/API_GOVERNANCE.pdf
Last Updated: 2026-03-09
---

# API Governance Specification

File: `API_GOVERNANCE.md`

## Purpose

Define how PocketPilot interacts with market data providers.

## Provider Classification

### Tier 1 - Execution Sources

Used for execution-bound decisions.

**Examples**

- Swyftx
- Coinbase (future)
- Kraken (future)

**Rules**

- Must represent actual execution venue price.
- Cannot be substituted for trade prompts.

### Tier 2 - Market Context Sources

Used for analytics and reference.

**Examples**

- CoinGecko
- CoinPaprika
- Glassnode (future)

**Rules**

- Never used for execution decisions.
- Must be labeled as reference data.

### Tier 3 - Enrichment Sources

**Examples**

- Fear & Greed index
- News feeds
- Macro indicators

**Rules**

- Informational only.

## Provider Abstraction Rules

All API calls must flow through:

- `providers/`

**Example structure**

- `providers/`
- `providers/quotes/`
- `providers/analytics/`
- `providers/exchange/`

## QuoteBroker Responsibility

QuoteBroker becomes the choke point for:

- Request deduplication
- Rate limiting
- Cache reuse
- Instrumentation

Your budgets already exist:

- `CALM <= 20 symbols / 5 min`
- `WATCHING_NOW <= 60 / 5 min`

## API Fallback Chain

**Example**

- `Execution quote -> Swyftx -> Fallback -> cached -> Reference -> CoinGecko`

Fallbacks must never violate execution integrity rules.
