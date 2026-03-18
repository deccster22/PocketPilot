# HAPTICS_EVENT_TAXONOMY.md

- Title: PocketPilot - Haptics Event Taxonomy and Rules
- Source file: `docs/source/Haptics Event Taxonomy and Rules.pdf`
- Last updated: 2026-03-19

---

# Haptics Event Taxonomy and Rules

> Absolutely. Here’s a spec-ready definition block you can paste into the next spec drop (and we’ll treat it as canonical going forward).

## Haptics channels

We implement three distinct haptics channels with separate triggers and separate throttles:

1. Gate Flip Haptics
   - Trigger: A strategy evaluation’s `gateState` transitions between `GREEN | AMBER | RED`.
   - Scope: Per-symbol, per-strategy-tile (and optionally top strip summary gate).
   - When enabled: Only in `SessionMode === WATCHING_NOW`.
   - Throttle: Per-symbol throttle (min 3 seconds between gate flip haptics for the same symbol).
   - Intent: Provide immediate tactile feedback when trade conditions meaningfully change.

2. Action/Alert Outcome Haptics
   - Trigger: A user action completes with a clear result.
   - Success: alert scheduled successfully; in-app condition created successfully; condition fired successfully.
   - Warning: permissions denied, scheduling failed, condition creation failed, or alert suppressed due to rate limiting.
   - Scope: Global (not per symbol).
   - When enabled: Always, but governed by the global “Haptics Enabled” toggle.
   - Throttle: Light global throttle (optional), but typically not needed because user actions are discrete.
   - Intent: Confirm the app “heard you” and succeeded/failed.

3. Scan Lifecycle Haptics
   - Trigger: Foreground monitor lifecycle events.
   - Scan Start: when a rotation pass begins (rotation index resets to `0`).
   - Scan Finish: when a full pass completes (all symbols in the current rotation list checked once).
   - Scope: Global, associated with the monitor.
   - When enabled: Only in `SessionMode === WATCHING_NOW` and only if `scanHapticsEnabled === true`.
   - Throttle: Global scan throttle: no more than once every 10 seconds for scan start/finish combined.
   - Finish guardrails: Scan Finish haptic must NOT fire unless all are true:
     - rotation list length ≥ 2
     - ≥ 50% of symbols fetched successfully during the pass
     - no condition fired during that pass (success haptic already used)
   - Intent: Give a subtle “heartbeat” that scanning is running, without becoming noisy.

## Priority and suppression rules

To prevent double-buzzing:

- If a condition fires during a scan pass, fire Action/Alert Success haptic and suppress Scan Finish haptic for that pass.
- If global alert suppression/rate limit activates, fire Action/Alert Warning haptic once per suppression window, not repeatedly.
- Gate flip haptics remain independent but must respect their own per-symbol throttle.

## Settings

- `hapticsEnabled` (global): controls all haptics.
- `scanHapticsEnabled` (optional, default ON): controls scan lifecycle haptics only. If you prefer simpler UX, merge into `hapticsEnabled`.
