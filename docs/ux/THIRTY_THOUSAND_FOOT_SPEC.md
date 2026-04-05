# 30,000 ft View Spec

## Purpose

The 30,000 ft View is a small opt-in Snapshot extension for broader interpreted context.

It should feel:

- calm
- sparse
- descriptive
- emotionally grounding

It should not feel:

- loud
- urgent
- dashboard-heavy
- recommendation-like

## Canonical Consumption Path

- `services/context/createPreparedContextInputs.ts` derives the calm richer-input seam for volatility, structure, fit-support, and light grounding.
- `services/context/fetchThirtyThousandFootVM.ts` owns the prepared broader-context VM.
- `services/snapshot/fetchSnapshotSurfaceVM.ts` threads that VM into the Snapshot surface contract.
- `app/screens/snapshotScreenView.ts` reads the prepared availability only.
- `app/screens/SnapshotScreen.tsx` renders one subordinate affordance only when prepared availability is `AVAILABLE`.
- `app/screens/ThirtyThousandFootScreen.tsx` renders prepared title, summary, fit, and details only.

## Snapshot Affordance Rules

- Render nothing when availability is `UNAVAILABLE`.
- Keep the affordance below Snapshot's core triad.
- Keep styling quiet and subordinate.
- Use neutral invitation copy rather than warning language.
- Do not block or replace the existing Snapshot briefing zone.

## Detail View Rules

- Open only through an intentional user tap.
- Show prepared broader-context title and summary.
- Show the prepared Strategy Fit summary.
- Show a short prepared details list that may include volatility, structure, fit-support, or light grounding context when service truth supports it.
- Keep the layout brief and scroll-light.

## Deliberate Exclusions

- badges
- popups
- modal warnings
- raw event lists
- provider/runtime diagnostics
- local context derivation in `app/`
- charts
- multi-surface rollout
