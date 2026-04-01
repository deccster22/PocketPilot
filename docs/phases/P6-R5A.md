# P6-R5A - Retire Legacy Reorientation App Presentation Path

## Purpose
P6-R5A removes the obsolete reorientation-only presentation helpers from `app/` so Snapshot keeps one canonical briefing rendering path only:

- `app/screens/SnapshotScreen.tsx`
- `app/screens/snapshotScreenView.ts`
- `app/components/SnapshotBriefingCard.tsx`

This phase is cleanup and hardening only.
It does not change briefing behavior, service-owned precedence, dismissal rules, or Snapshot's prepared VM path.

## What Changed
- removed the legacy app-only reorientation summary view helper
- removed the legacy app-only reorientation summary card
- removed tests that existed only for that retired app path
- strengthened Snapshot app tests so they fail if the retired path is referenced again

## What Did Not Change
- `services/` still owns briefing truth, visibility, and precedence
- visible reorientation still wins the Snapshot briefing zone
- dismissed reorientation still does not fall through to Since Last Checked
- Since Last Checked still appears only when reorientation is unavailable
- Snapshot still renders one subordinate briefing zone only
- dismissal persistence and foreground refresh behavior remain unchanged

## Outcome
After P6-R5A, Snapshot briefing has one canonical app presentation surface.
`app/` renders the prepared `surface.briefing` contract only and does not keep a second reorientation-only card path available for future drift.
