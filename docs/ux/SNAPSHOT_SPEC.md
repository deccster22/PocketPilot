# Snapshot Spec

## Purpose

Snapshot is PocketPilot's calm, zero-scroll orientation surface. It consumes a prepared `SnapshotModel` from `services/snapshot` and does not interpret raw strategy output in `app/`.

P6-R5 unifies Snapshot's subordinate orientation layer into one canonical briefing zone.
It remains optional, quiet, and secondary to the Snapshot core.
P6-A7 adds one separate calm Since Last Checked section under Strategy Status.
It remains optional, quiet, and secondary to the Snapshot core.
P6-A8 refines that separate section so it clears after view while staying account-scoped, calm, and non-inbox-like.
PX-C1 adds one separate calm 30,000 ft affordance on the same prepared Snapshot path.
It remains opt-in, descriptive, and subordinate.
PX-C2 deepens that same lane with richer service-owned volatility and structural inputs without changing Snapshot's subordinate posture.

## Canonical Consumption Path

- `services/snapshot/snapshotService.ts` produces orchestration output and a prepared `model`.
- `services/snapshot/createSnapshotModel.ts` builds the canonical Snapshot model from deterministic scan output.
- `services/snapshot/createProfileAwareSnapshotModel.ts` applies profile-aware shaping at the service seam.
- `services/snapshot/fetchSnapshotSurfaceVM.ts` shapes one prepared Snapshot surface VM, including the canonical briefing state.
- `services/messages/fetchMessagePolicyVM.ts` returns one grouped Snapshot message-policy lane for one requested surface.
- `services/messages/createPreparedMessageRationale.ts` shapes one optional calm rationale for the surfaced Snapshot message.
- `services/orientation/createSinceLastCheckedVM.ts` shapes one canonical calm Since Last Checked VM for Snapshot.
- `services/orientation/fetchSinceLastCheckedVM.ts` fetches or reuses that same prepared VM through the service seam.
- `services/context/fetchThirtyThousandFootVM.ts` builds one canonical broader-context VM for Snapshot's opt-in 30,000 ft lane.
- `services/messages/applyMessageProfileTuning.ts` keeps alert threshold and profile sensitivity inside that same message-policy seam.
- `app/` reads the prepared Snapshot surface VM, grouped message-policy lane, and prepared Since Last Checked view data through the screen-facing helper in `app/screens/snapshotScreenView.ts`.
- `app/components/SinceLastCheckedCard.tsx` renders the calm prepared Since Last Checked section under Strategy Status.
- `app/screens/ThirtyThousandFootScreen.tsx` renders the prepared broader-context VM when the user opens the affordance intentionally.
- P6-R3 keeps dismissal persistence behind that same prepared service path rather than moving visibility rules into `app/`.
- P6-R4 re-reads that same prepared service path on app foreground return rather than adding a second Snapshot fetch route.
- P6-R5 keeps reorientation and Since Last Checked on that same briefing-zone path and lets `services/` decide precedence once.
- P6-R5A removes the retired reorientation-only app presentation helper path so `SnapshotBriefingCard` remains the only active briefing-zone surface in `app/`, while `SinceLastCheckedCard` serves the separate Strategy Status section.

## Core vs Secondary Discipline

- Core fields are always present:
  - current state
  - last 24h change
  - strategy status
- Secondary fields are optional and subordinate:
  - bundle name
  - portfolio value
  - history cue
  - optional Snapshot briefing zone
  - optional Since Last Checked section
  - optional 30,000 ft affordance
- Secondary fields must never replace or visually outweigh the core orientation blocks.

## Briefing Zone Rules

- Snapshot has one canonical subordinate briefing zone only.
- The zone is inline and subordinate.
- `services/orientation/createSnapshotBriefingState.ts` decides whether Snapshot receives:
  - `REORIENTATION`
  - `SINCE_LAST_CHECKED`
  - `HIDDEN`
- `services/messages/createMessagePolicyVM.ts` then classifies that prepared result into a Snapshot-facing `REORIENTATION` or `BRIEFING` message, or stays quiet when no message is justified.
- when a Snapshot message is surfaced, the same service-owned seam may also attach one optional compact rationale explaining why that posture appeared
- Reorientation owns the zone whenever it is available.
- The briefing-zone fallback may use Since Last Checked only when reorientation is not available.
- The separate Since Last Checked section under Strategy Status is prepared independently and does not change the briefing-zone precedence.
- Existing reorientation dismissal behavior remains unchanged.
- Since Last Checked remains non-dismissible in this phase.
- A thin Snapshot `ALERT` may appear only when no briefing already owns the zone and interpreted context is strong enough after service-owned threshold tuning.
- Beginner may keep strong interpreted change as a calm `BRIEFING` instead of `ALERT`.
- Advanced may receive a tighter `ALERT`, but middling change still suppresses to no message.
- If rationale is available, Snapshot may render one small inline "why this is here" treatment inside the same briefing card.
- Snapshot rationale must remain explanatory, compact, and non-debuggy.
- App foreground return re-checks the same prepared Snapshot VM and stays quiet while the app remains active.
- Snapshot does not become an inbox, alert center, feed, or notification system.

## Since Last Checked Section Rules

- Since Last Checked has one separate calm section under Strategy Status.
- `services/orientation/createSinceLastCheckedVM.ts` shapes the prepared section from the existing account-scoped event/history/last-viewed seams.
- `services/orientation/fetchSinceLastCheckedVM.ts` provides one canonical service-owned fetch path for that section.
- `services/orientation/createSinceLastCheckedDisplayState.ts` refines the same seam into one service-owned display state that can clear after view without adding inbox or badge semantics.
- `app/` renders the prepared section only and does not rank, filter, or expand events locally.
- The section remains compact, meaningful-change-only, and auto-collapses when unavailable.
- The section clears after view through service-owned viewed-state handling, but it remains non-dismissible in this phase.
- The section does not become an inbox, feed, notification center, badge system, or history browser.

## 30,000 ft Affordance Rules

- Snapshot may render one calm 30,000 ft affordance only when `services/context/` says broader context is `AVAILABLE`.
- The affordance is not the briefing zone and does not compete with it for message ownership.
- The affordance must remain visually subordinate to Snapshot's core triad.
- Opening the affordance is intentional and opt-in.
- Snapshot must not derive fit, volatility posture, structural posture, or broader context locally.
- If the prepared VM is unavailable, Snapshot renders nothing for this lane.
- Snapshot does not turn this lane into a warning card, macro dashboard, or recommendation surface.

## Profile-Aware Shaping Rules

- Beginner:
  - canonical core stays fully visible
  - no secondary fields
  - no history cue exposure
- Middle:
  - canonical core stays fully visible
  - may expose compact secondary context already present in the model
  - currently limited to `portfolioValue`
- Advanced:
  - canonical core stays fully visible
  - may expose compact secondary context and a small history cue
  - currently limited to `bundleName`, `portfolioValue`, and optional history
  - still no dense supporting detail, raw indicators, or raw signal lists

## Intentional Exclusions

- raw strategy signal lists
- raw indicators
- charts
- macro dashboard sprawl
- notification delivery
- notification-center behavior
- urgency styling
- dashboard shaping
- prose generation beyond fixed UI labels
- top movers and top dips as primary Snapshot content

## Transitional Legacy Handling

`SnapshotVM` still carries legacy top-level bridge fields (`bundleName`, `portfolioValue`, `change24h`, `strategyAlignment`) for temporary compatibility and debug payload support. Snapshot consumers should prefer `snapshot.model`; bridge fields remain aligned until retirement is safe.
