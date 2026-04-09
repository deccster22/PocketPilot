# PROFILE_SYSTEM.md

## Purpose
Defines profiles as a product system, not just a wording preference. This doc explains what a profile changes, what it never changes, and where profile selection sits in the PocketPilot model.

## 1. Role of the profile system
Profiles exist to change:
- relationship model
- density
- explanation depth
- feature visibility
- guidance level
- educational scaffolding
- notification exposure

Profiles do not change:
- strategy truth
- event truth
- certainty boundaries
- account truth

## 2. Canonical model
PocketPilot separates:
- Strategy = what matters
- Profile = how the user is supported
- Voice = how it is said

This separation is one of the product’s main clarity protections.

## 3. Profile definitions
### Beginner
- calm, visible support
- plain-language translation
- obvious help paths
- simplified default density

### Intermediate
- balanced guidance
- deeper context when useful
- optional support rather than constant scaffolding

### Advanced
- efficient compressed interface
- lower default scaffolding
- greater tolerance for density, but not clutter

## 4. System effects profiles may control
Profiles may shape:
- explanation style
- Dashboard density
- signal exposure
- knowledge-link visibility
- alert sensitivity
- educational framing
- entry destination after strategy selection

## 5. System effects profiles may not control
Profiles may not change:
- whether something is estimated or confirmed
- strategy logic
- event creation logic
- support-not-enforcement posture
- calm-over-urgency posture

## 6. Persistence and switching
The user should always be able to change profile later.
Switching profile changes product presentation, not historical truth.

## 7. Relationship to strategy selection
Profile and strategy are selected together early because they jointly shape the user’s first usable experience.

## 8. Relationship to knowledge
Profiles strongly affect knowledge surfacing:
- Beginner: obvious and stable
- Intermediate: contextual
- Advanced: accessible but quieter

## 9. Relationship to notifications
Profiles change notification density and explanation depth, not event eligibility truth.

## 10. Relationship to Snapshot / Dashboard / Trade Hub
Profiles shape all three, but Snapshot remains tightly constrained across every profile.

## 11. Anti-patterns to block
- turning profiles into different products
- making Advanced just “more stuff”
- making Beginner just “less truth”
- hard-locking users into their first choice
- using profile as a disguise for advice intensity

## 12. Practical decision test
1. Is this change altering support, not truth?
2. Would a user still recognize the same product across profiles?
3. Does this reduce overload without increasing vagueness?
4. Can the user change it later without system instability?

## 13. Relationship to other docs
Sits beside:
- PROFILE_EXPLANATION_MODEL.md
- SIGNAL_EXPOSURE.md
- KNOWLEDGE_LAYER.md
- SNAPSHOT_VISION.md
- NOTIFICATION_PHILOSOPHY.md
- Product Specification / CANON

## 14. Open questions
- whether profile preview should be shown during onboarding
- how much manual tuning coexists with profile presets
- whether profile-aware exports differ in defaults
