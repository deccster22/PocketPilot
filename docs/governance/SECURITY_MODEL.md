---
Title: Security Model
Version: 0.1
Source: docs/incoming/SECURITY_MODEL.pdf
Last Updated: 2026-03-09
---

# Security Model v.01

File  
`SECURITY_MODEL.md`

Defines minimum security posture.

## Network rules

- HTTPS only
- no insecure endpoints
- provider TLS validation required

## Device rules

Secrets stored only in:  
`expo-secure-store`

Never `AsyncStorage`.

## Logging rules

Never log:

- API keys
- account IDs
- portfolio balances
