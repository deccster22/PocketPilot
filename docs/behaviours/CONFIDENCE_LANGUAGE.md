# CONFIDENCE_LANGUAGE.md

## Purpose
Defines how PocketPilot expresses uncertainty, confidence, confirmation, ambiguity, and mixed conditions in user-facing language. This doc protects the product from sounding more certain than its own evidence.

## 1. Role of confidence language
PocketPilot is an interpretation product, not a certainty machine. Confidence language exists to make state legible without inflating it.

A useful rule:
**The product may be clear without pretending to be sure.**

## 2. Non-negotiable rules
PocketPilot confidence language must:
- preserve estimated vs confirmed boundaries
- stay calm, non-hyped, and non-directive
- avoid hidden advice
- avoid urgency and countdown energy
- avoid turning probability into destiny

It must never:
- upgrade weak evidence into strong certainty
- imply prediction as fact
- use hype phrases like “guaranteed,” “can’t miss,” or “obvious winner”
- suggest action is required just because confidence improved

## 3. Confidence is downstream, not self-invented
Confidence wording must come from canonical system truth:
- MarketEvents
- Strategy Status
- fit / regime context
- account-scoped state
- confidence / certainty metadata

Language is downstream of evidence. It must not outrank it.

## 4. Confidence states PocketPilot should handle well
PocketPilot should express:
- early / forming signal state
- strengthening support
- mixed or contradictory conditions
- clearer confirmation
- fading or weakening support
- unresolved ambiguity

The language should help the user understand whether the picture is:
- emerging
- holding
- mixed
- strengthening
- weakening
- resolved

## 5. Language ladder
A useful confidence ladder:

### 5.1 Weak / early
Examples:
- “early signs are appearing”
- “conditions are beginning to line up”
- “this is forming, not confirmed”

### 5.2 Mixed / ambiguous
Examples:
- “signals are mixed”
- “some elements are supportive, others are not”
- “the setup is not fully aligned”

### 5.3 Strengthening
Examples:
- “alignment is strengthening”
- “conditions are becoming more supportive”
- “the picture is getting clearer”

### 5.4 Confirmed / established
Examples:
- “the move is confirmed”
- “the pattern has resolved”
- “structure is now established”

Confirmed language should only be allowed when the canonical system truth truly supports it.

### 5.5 Weakening / fading
Examples:
- “momentum is fading”
- “follow-through is weakening”
- “support is becoming less reliable”

## 6. What confidence language is not allowed to do
Confidence language must not:
- become recommendation language
- become moral language
- become adrenaline language
- overstate weak evidence
- flatten mixed conditions into false simplicity

Bad:
- “This looks like a sure thing.”
- “You should be watching this closely.”
- “Critical setup.”
- “Winner incoming.”

Better:
- “Conditions are becoming more supportive.”
- “The picture is strengthening, but not fully resolved.”
- “This remains mixed.”

## 7. Relationship to profiles
Same truth, different density.

### Beginner
- fuller explanation
- plain language first
- observational, not directive

### Intermediate
- contextual explanation
- balanced density
- strategy-aware phrasing

### Advanced
- compressed phrasing
- low narrative padding
- same certainty boundaries

Profiles change exposure and phrasing, not the truth standard.

## 8. Relationship to surfaces
### Snapshot
Use compact confidence language only.

### Dashboard
Allows richer explanation of mixed vs strengthening vs weakening conditions.

### Trade Hub
Confidence wording must stay bounded and must never become execution-pushy.

### Insights
Can support richer retrospective explanation of why confidence changed over time.

## 9. Anti-patterns to block
- certainty inflation
- urgency leakage
- probability cosplay
- recommendation drift
- beginner oversimplification
- advanced cryptic compression

## 10. Practical decision test
Before approving any confidence phrasing, ask:
1. Does this wording exactly match the underlying evidence?
2. Would a skeptical user find this honest?
3. Does it preserve estimated vs confirmed boundaries?
4. Does it remain calm and non-directive?
5. Would the sentence still be acceptable if read out loud during a choppy market?

## 11. Relationship to other docs
Sits beside:
- PROFILE_EXPLANATION_MODEL.md
- AI_EXPLANATION_LAYER.md
- NOTIFICATION_PHILOSOPHY.md
- RELEVANCE_PRINCIPLE.md
- CANON / Guardrails

## 12. Open questions
- whether confidence tags become user-visible in more places
- how much confidence vocabulary should be standardized across all surfaces
- whether advanced users ever get source-of-confidence drill-down
