---
title: "Trade Hub Help Integration Plan"
status: "draft"
owner: "founder"
doc_class: "knowledge-meta"
purpose: "Defines the first bounded Trade Hub and Risk Tool term-to-knowledge integration plan for later service-owned wiring"
depends_on:
  - "P5-R15"
  - "P5-R16"
  - "PX-KI4"
  - "PX-KI5"
  - "P7-K8"
  - "P7-K9"
  - "P7-K10"
related_docs:
  - "/docs/knowledge/_meta/GLOSSARY_TERM_MAP.md"
  - "/docs/ux/TRADE_HUB_SPEC.md"
  - "/docs/architecture/KNOWLEDGE_MODEL.md"
  - "/docs/ui-support/tooltips.md"
  - "/docs/ui-support/first_run.md"
  - "/docs/ui-support/edge_states.md"
canonical_path: "/docs/knowledge/_meta/TRADE_HUB_HELP_INTEGRATION_PLAN.md"
---

# Trade Hub Term-to-Knowledge Integration Plan (P7-K11)

## Scope and Guardrails

This plan defines the first bounded term-help integration scope for Trade Hub and Risk Tool.

This phase is planning-only:
- no app/runtime wiring
- no term tap affordance rollout
- no UI-side term matching
- no Trade Hub copy/layout changes
- no risk-math, guardrail, readiness, or submission behavior changes

Ownership remains unchanged:
- `services/knowledge` will own term eligibility, profile/surface treatment, and glossary/topic routing when implemented
- `app/` remains render-only and consumes prepared affordances

## Term Classification Matrix

| UI label | Glossary topic ID/path | Knowledge topic ID/path | Recommended first interaction | Eligible profiles | Eligible surfaces | Priority | Rationale | Over-link/confusion risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Entry price | `glossary-entry-price`<br>`docs/knowledge/glossary/entry-price.md` | `trade-hub-entry-price`<br>`docs/knowledge/trade-hub/entry-price.md` | `none` | beginner, intermediate, advanced | Trade Hub Plan Preview, Risk Tool | later | The label is already broadly understood and appears in dense numeric contexts where extra affordances add little clarity. | High risk of repeated-link clutter in price rows. |
| Stop-loss price | `glossary-stop-loss-price`<br>`docs/knowledge/glossary/stop-loss-price.md` | `trade-hub-stop-loss-price`<br>`docs/knowledge/trade-hub/stop-loss-price.md` | `glossary first, then Knowledge` | beginner, intermediate, advanced | Trade Hub Plan Preview, Risk Tool | high | Common confusion term for beginner/intermediate users and directly tied to risk understanding. | Medium risk if linked at every repeat; control by first-occurrence linking only. |
| Target price | `glossary-target-price`<br>`docs/knowledge/glossary/target-price.md` | `trade-hub-target-price`<br>`docs/knowledge/trade-hub/target-price.md` | `glossary first, then Knowledge` | beginner, intermediate, advanced | Trade Hub Plan Preview, Risk Tool | high | Frequently misunderstood as a prediction promise; lightweight definition plus optional deeper context helps. | Medium risk if overused beside stop/entry in the same sentence. |
| Prepared planning levels | `glossary-prepared-planning-levels`<br>`docs/knowledge/glossary/prepared-planning-levels.md` | `trade-hub-prepared-planning-levels`<br>`docs/knowledge/trade-hub/prepared-planning-levels.md` | `glossary only` | beginner, intermediate | Trade Hub Plan Preview | medium | Useful orientation term for service-prepared context, but usually resolved with a short definition. | Medium risk of visual weight near stop/target rows. |
| Risk amount | `glossary-risk-amount`<br>`docs/knowledge/glossary/risk-amount.md` | `trade-hub-risk-amount`<br>`docs/knowledge/trade-hub/risk-amount.md` | `glossary first, then Knowledge` | beginner, intermediate, advanced | Risk Tool, Trade Hub Plan Preview | high | Key risk-basis term and recurring confusion point when users compare dollar vs percent framing. | High risk inside dense numeric summaries; link only in explanatory copy, not every numeric row. |
| Risk percent | `glossary-risk-percent`<br>`docs/knowledge/glossary/risk-percent.md` | `trade-hub-risk-percent`<br>`docs/knowledge/trade-hub/risk-percent.md` | `glossary first, then Knowledge` | beginner, intermediate, advanced | Risk Tool, Trade Hub Plan Preview | high | Same rationale as Risk amount; pairing both terms keeps basis selection understandable. | High risk if both basis terms are linked at once; only link the active displayed basis term. |
| Position size | `glossary-position-size`<br>`docs/knowledge/glossary/position-size.md` | `trade-hub-position-size`<br>`docs/knowledge/trade-hub/position-size.md` | `glossary only` | beginner, intermediate | Risk Tool, Trade Hub Plan Preview | medium | Helpful for orientation but usually explainable in one compact definition. | Medium risk in formula-heavy summaries. |
| Reward/risk | `glossary-reward-risk`<br>`docs/knowledge/glossary/reward-risk.md` | `trade-hub-reward-risk`<br>`docs/knowledge/trade-hub/reward-risk.md` | `glossary only` | beginner, intermediate, advanced | Risk Tool | later | Useful concept, but first rollout should prioritize stop/target and basis confusion first. | High risk of link noise if attached to every ratio/value rendering. |
| Manual override | `glossary-manual-override`<br>`docs/knowledge/glossary/manual-override.md` | `trade-hub-manual-override`<br>`docs/knowledge/trade-hub/manual-override.md` | `glossary only` | beginner, intermediate | Trade Hub Plan Preview, Risk Tool | later | Secondary behavior term; lightweight definition is enough when introduced. | Medium risk of making authoritative user-input behavior feel optional if over-linked. |
| Guardrails | `glossary-guardrails`<br>`docs/knowledge/glossary/guardrails.md` | `trade-hub-guardrails`<br>`docs/knowledge/trade-hub/guardrails.md` | `glossary first, then Knowledge` | beginner, intermediate, advanced | Guardrail Preferences, Trade Hub Plan Preview | high | Central safety framing term; users benefit from concise definition with optional deeper guardrail context. | Medium risk if every guardrail status label is linked. |
| Risk limit per trade | `glossary-risk-limit-per-trade`<br>`docs/knowledge/glossary/risk-limit-per-trade.md` | `trade-hub-risk-limit-per-trade`<br>`docs/knowledge/trade-hub/risk-limit-per-trade.md` | `glossary only` | beginner, intermediate, advanced | Guardrail Preferences, Trade Hub Plan Preview | medium | Important but narrow guardrail term; short glossary explanation is usually sufficient. | Medium risk in compact guardrail summaries. |
| Daily loss threshold | `glossary-daily-loss-threshold`<br>`docs/knowledge/glossary/daily-loss-threshold.md` | `trade-hub-daily-loss-threshold`<br>`docs/knowledge/trade-hub/daily-loss-threshold.md` | `glossary only` | beginner, intermediate, advanced | Guardrail Preferences | medium | Guardrail-specific term; low-friction definition supports setup comprehension. | Medium risk if repeated in tight settings copy blocks. |
| Cooldown after loss | `glossary-cooldown-after-loss`<br>`docs/knowledge/glossary/cooldown-after-loss.md` | `trade-hub-cooldown-after-loss`<br>`docs/knowledge/trade-hub/cooldown-after-loss.md` | `glossary only` | beginner, intermediate, advanced | Guardrail Preferences | medium | Behavioral guardrail concept that benefits from a short definition but rarely needs deep routing first. | Medium risk if linked repeatedly alongside other guardrail fields. |
| Confirmation shell / non-dispatch boundary | `glossary-confirmation-shell-and-non-dispatch-boundary`<br>`docs/knowledge/glossary/confirmation-shell-and-non-dispatch-boundary.md` | `trade-hub-confirmation-shell-and-non-dispatch-boundary`<br>`docs/knowledge/trade-hub/confirmation-shell-and-non-dispatch-boundary.md` | `none` | beginner, intermediate, advanced | Submission/readiness/handoff area | later | Boundary language must stay immediate and unambiguous; links here can make safety wording feel optional. | High risk of weakening perceived safety boundary if linked inline. |

## First-Rollout Candidate Set (For P7-K12)

First rollout must stay intentionally small and beginner/intermediate oriented:

1. `Stop-loss price`
2. `Target price`
3. one active risk-basis term only: `Risk amount` or `Risk percent` (whichever basis label is currently shown)
4. `Guardrails`

Rollout rules:
- do not mark every term as tappable
- do not link every repeated occurrence of a selected term
- keep advanced treatment lighter by default (plain/reference posture unless explicit need)

## Non-Linking / Plain-Text Rules

The following guardrails apply to later wiring:

- Do not link every occurrence of a term; default to one eligible occurrence per prepared block.
- Do not link terms inside dense numeric summaries when it reduces scanability.
- Do not link submission/readiness boundary copy (including explicit non-dispatch lines) inside handoff-critical text.
- Do not link multiple terms in the same short sentence unless explicitly approved.
- Do not turn Trade Hub into a wiki surface; links stay optional, subordinate, and quick to ignore.
- Preserve plain-text rendering for advanced users when adding a link would not materially reduce confusion.

## Planned Interaction Pattern (For P7-K12)

- `services/knowledge` owns a static term-help map keyed by canonical UI term and surface/profile eligibility.
- Service-owned matching resolves eligible terms to one of:
  - glossary-only destination
  - glossary-first with deeper Knowledge follow-through
  - direct Knowledge topic destination
  - no link (`none`)
- `app/` receives prepared affordance metadata only and does not match, rank, or route terms locally.
- Taps on lightweight terms should continue to use existing glossary/help treatment paths from K8/K9.
- Deeper destinations should route to existing Knowledge Topic detail paths.
- No new explanation screen is introduced unless an existing route cannot support required treatment.

## Reconciliation Notes

### `docs/knowledge/_meta/GLOSSARY_TERM_MAP.md`
- Current map already covers all required Trade Hub/Risk Tool terms with one-to-one glossary and trade-hub topic paths.
- No missing topic IDs were found for the required set.

### `docs/knowledge/_meta/CONCEPT_TO_STRATEGY_MAP.md`
- No update required for this phase.
- This map governs strategy/concept relationships and is not the canonical home for Trade Hub term help routing.

### `docs/ui-support/tooltips.md`, `docs/ui-support/first_run.md`, `docs/ui-support/edge_states.md`
- These remain docs-only support drafts and are not wired to runtime in this phase.
- They are now cross-referenced to this plan so later implementation does not treat draft copy files as direct runtime mappings.

## Ambiguities to Resolve During P7-K12

- Risk-basis label ambiguity: `Risk amount` and `Risk percent` share one basis concept; rollout should link only the active displayed basis term.
- Boundary-label drift: user-facing plain-language boundary labels (`Submission readiness`, `Submission check`, `Execution handoff`) do not always literally include `Confirmation shell`; mapping should remain semantic and service-owned.
- Slash variants: `Reward/risk` text may appear with punctuation variants and should stay intentionally non-priority for first rollout to avoid noisy matching.

