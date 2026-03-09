---
Title: Observability Model
Version: 0.1
Source: docs/incoming/OBSERVABILITY_MODEL.pdf
Last Updated: 2026-03-09
---

# Observability Model

File: `OBSERVABILITY_MODEL.md`

## Goal

Make debugging possible without invasive telemetry.

## Layer 1 - Diagnostics modal

### Fields

- `last scan timestamp`
- `quoteBroker requests`
- `symbolsFetched`
- `symbolsBlocked`
- `estimated flags`
- `last error`

## Layer 2 - Debug export

### User taps

`Copy debug summary`

### Exports

- `diagnostics snapshot`

## Layer 3 - Crash monitoring

### Recommended tool

Sentry

### Used only for

- crash traces
- performance issues
