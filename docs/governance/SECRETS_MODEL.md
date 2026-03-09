Title: Secrets Management Model
Version: Unknown
Source: docs/incoming/SECRETS_MODEL.pdf
Last Updated: 2026-03-09

# Secrets Management Model

File: `SECRETS_MODEL.md`

PocketPilot will operate under three secret classes.

## Class A - Public endpoints

### Example

- Swyftx public market endpoints

No secret required.

## Class B - User keys

### Examples

- exchange API keys (future)

### Storage

`expo-secure-store`

### Rules

- stored encrypted
- never logged
- never transmitted except to provider

## Class C - Platform secrets

### Examples

- Sentry DSN
- backend service tokens

### Stored in

- `.env`
- CI secrets

Never in repo.
