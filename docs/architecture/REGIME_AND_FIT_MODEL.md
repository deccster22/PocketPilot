# Regime And Fit Model

## Purpose

PocketPilot does not yet have a standalone regime engine.

The current broader-context lane is:

```text
selected-account scoped Snapshot truth
-> PreparedContextInputs
-> StrategyFitSummary
-> ThirtyThousandFootVM
```

This document exists to keep that lane honest until any future regime work is explicitly scheduled.

## Current Rules

- fit is descriptive, not directive
- fit remains secondary to core alignment
- fit is selected-account scoped
- broader context may stabilise interpretation, but it must not silently override selected-account truth
- `UNKNOWN` or `UNAVAILABLE` is better than invented macro confidence

## PX-MA1 / PX-MA2 Scope Preservation

PX-MA1 and PX-MA2 make one important rule explicit for this lane:

- `PreparedContextInputs` must be built from selected-account scoped events and orientation context only
- explicit account switching may change which selected account is active, but it still must pass through the same service-owned seam before Strategy Fit or 30,000 ft consume it

That means:

- no aggregated global fit
- no cross-account stress leakage into Strategy Fit
- no app-side account derivation for broader-context views

## Not Yet Present

This repo still does not have:

- a full regime classifier
- global cross-account fit summaries
- recommendation logic tied to fit
- override states that supersede core strategy alignment

Any future regime work should build above the selected-account seam, not around it.
