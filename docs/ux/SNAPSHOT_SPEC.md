# Snapshot Spec

## Purpose

Snapshot is PocketPilot's calm, zero-scroll orientation surface. It consumes a prepared `SnapshotModel` from `services/snapshot` and does not interpret raw strategy output in `app/`.

P6-R5 unifies Snapshot's subordinate orientation layer into one canonical briefing zone.
It remains optional, quiet, and secondary to the Snapshot core.
PX-C1 adds one separate calm 30,000 ft affordance on the same prepared Snapshot path.
It remains opt-in, descriptive, and subordinate.
PX-C2 deepens that same lane with richer service-owned volatility and structural inputs without changing Snapshot's subordinate posture.

## Canonical Consumption Path

- `services/snapshot/snapshotService.ts` produces orchestration output and a prepared `model`.
- `services/snapshot/createSnapshotModel.ts` builds the canonical Snapshot model from deterministic scan output.
- `services/snapshot/createProfileAwareSnapshotModel.ts` applies profile-aware shaping at the service seam.
- `services/snapshot/fetchSnapshotSurfaceVM.ts` shapes one prepared Snapshot surface VM, including the canonical briefing state.
- `services/messages/fetchMessagePolicyVM.ts` classifies prepared Snapshot message output for one requested surface.
- `services/context/fetchThirtyThousandFootVM.ts` builds one canonical broader-context VM for Snapshot's opt-in 30,000 ft lane.
- `services/messages/applyMessageProfileTuning.ts` keeps alert threshold and profile sensitivity inside that same message-policy seam.
- `app/` reads the prepared Snapshot surface VM and prepared message-policy VM through the screen-facing helper in `app/screens/snapshotScreenView.ts`.
- `app/screens/ThirtyThousandFootScreen.tsx` renders the prepared broader-context VM when the user opens the affordance intentionally.
- P6-R3 keeps dismissal persistence behind that same prepared service path rather than moving visibility rules into `app/`.
- P6-R4 re-reads that same prepared service path on app foreground return rather than adding a second Snapshot fetch route.
- P6-R5 keeps reorientation and Since Last Checked on that same path and lets `services/` decide precedence once.
- P6-R5A removes the retired reorientation-only app presentation helper path so `SnapshotBriefingCard` remains the only active briefing surface in `app/`.

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
- Reorientation owns the zone whenever it is available.
- Since Last Checked may use the zone only when reorientation is not available.
- A dismissed reorientation cycle does not fall through to a separate Since Last Checked card.
- Existing reorientation dismissal behavior remains unchanged.
- Since Last Checked remains non-dismissible in this phase.
- A thin Snapshot `ALERT` may appear only when no briefing already owns the zone and interpreted context is strong enough after service-owned threshold tuning.
- Beginner may keep strong interpreted change as a calm `BRIEFING` instead of `ALERT`.
- Advanced may receive a tighter `ALERT`, but middling change still suppresses to no message.
- App foreground return re-checks the same prepared Snapshot VM and stays quiet while the app remains active.
- Snapshot does not become an inbox, alert center, feed, or notification system.

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
