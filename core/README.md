# core

Deterministic and pure domain layer.

Rules:
- no network or storage APIs
- no device APIs
- no non-deterministic calls (for example, `Date.now()` or random)
- no imports from `providers`
