Title: Verification Model (Beyond npm verify)
Version:
Source: docs/incoming/VERIFICATION_MODEL.pdf
Last Updated: 2026-03-09

# Verification Model (Beyond npm verify)

**File:** `VERIFICATION_MODEL.md`

Right now `verify` includes:

- lint
- tests

Later phases add:

## Layer 1

- unit tests

## Layer 2

- integration tests

> Example:
> `scan -> quoteBroker -> strategy output`

## Layer 3

- scenario simulation
- Replay market data.
