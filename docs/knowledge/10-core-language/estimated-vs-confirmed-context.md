---
topicId: pp-estimated-vs-confirmed-context
title: "Estimated vs Confirmed Context"
difficulty: Beginner
mediaType: article
reviewStatus: normalized-draft-v1
family: interpretation
priority: Now
surfaceFit:
  - Lib
  - Dash
  - Trade
---
# Estimated vs Confirmed Context

## Quick version
PocketPilot distinguishes between estimated and confirmed context so it can stay honest about how solid a current read is. Estimated does not mean broken. Confirmed does not mean guaranteed.

## Full version
Markets are rarely clean enough for total certainty. PocketPilot is designed to communicate that honestly.

**Estimated** context means the product has a useful read, but it is still provisional, incomplete, or not strong enough to present as settled.

**Confirmed** context means the read looks more established or better supported by the evidence currently available.

The important rule is that the app must never upgrade weak context into stronger-sounding certainty. This is a trust issue as much as a wording issue.

## Why the distinction matters
- it prevents false confidence
- it stops weak reads from sounding like advice
- it helps users judge how firm the current interpretation is

## Common misunderstandings
- estimated does not mean useless
- confirmed does not mean the future is locked

## Key terms
- estimated
- confirmed
- provisional
- confidence must be honest

## Further reading
- What Strategy Status Means
- What a MarketEvent Is
- Why PocketPilot Avoids Urgency Language
