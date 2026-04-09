---
title: "NOTIFICATION_ROUTER_MODEL"
status: "draft"
owner: "founder"
doc_class: "architecture"
purpose: "Canonical PocketPilot documentation artifact"
depends_on: []
related_docs: []
canonical_path: "/docs/architecture/NOTIFICATION_ROUTER_MODEL.md"
---

# NOTIFICATION_ROUTER_MODEL.md

## Purpose
Defines the routing architecture that maps interpreted events to passive indicators, haptics, notices, and later push without violating trust or phase rules.

## 1. System role
The router decides which eligible events reach which channel.

## 2. Core rule
Canonical interpreted event -> eligibility check -> suppression / cooldown -> channel routing -> phrasing model

## 3. Suggested pipeline
`MarketEvent` / `StrategyEvent`
-> `NotificationEligibility`
-> `NotificationSuppressionEngine`
-> `ChannelRouter`
-> `NotificationModel`

## 4. Inputs
- canonical event type
- strategy relevance
- account scope
- profile
- app foreground / background state
- cooldown history
- phase policy flags

## 5. Output shape
`NotificationModel`
- `channel`
- `eventFamily`
- `priority`
- `phrasingKey`
- `passiveIndicatorState`
- `expiresAt` / clear rules

## 6. Hard constraints
- no raw-indicator events enter the router
- no background push when phase policy blocks it
- no direct UI-triggered notification creation
- no bypass around suppression / cooldown logic

## 7. System subcomponents
### Eligibility layer
Checks meaning, relevance, profile, and phase legality.

### Suppression layer
Collapses duplicates and stale repeats.

### Routing layer
Chooses the least invasive viable channel.

### Copy layer
Maps event meaning to calm, canonical phrasing keys.

## 8. Testing expectations
- event eligibility tests
- cooldown tests
- duplicate suppression tests
- foreground-only policy tests
- channel escalation tests

## 9. Relationship to other docs
Sits beside:
- `MESSAGE_POLICY_MODEL.md`
- `NOTIFICATION_EVENT_MATRIX.md`
- `NOTIFICATION_SYSTEM.md`
- `NOTIFICATION_PHILOSOPHY.md`
- `CONFIDENCE_LANGUAGE.md`
