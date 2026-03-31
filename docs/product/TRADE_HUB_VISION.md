# Trade Hub Vision

Trade Hub is the future surface for calm, structured action framing.

Its job is not to pressure the user into trading. Its job is to show what PocketPilot believes a sensible next action shape could be, why that framing exists, and what constraints or cautions apply.

For the initial P5 foundation:

- Trade Hub consumes prepared `ProtectionPlan` objects from `services/`
- plans remain informational and read-only
- rationale must stay structured and traceable to interpreted market events
- certainty and alignment must remain explicit
- estimated or low-confidence contexts must never be shown as confirmed action

For P5-2 specifically:

- the surface presents one primary framed plan plus limited alternatives
- action posture is explicit through `READY`, `CAUTION`, and `WAIT` states
- confirmation safety remains visible and always-on
- app consumers render a prepared Trade Hub contract instead of classifying plans locally

For P5-3 specifically:

- a selected plan can expand into a structured preview/detail layer
- the preview remains framed, read-only, and confirmation-safe
- rationale, readiness, and constraints stay explicit for future confirmation UX
- order and execution detail remain placeholder-only until a later phase explicitly unlocks them

For P5-4 specifically:

- a selected plan can also expand into a capability-aware confirmation shell
- the shell describes what confirmation would require on the current platform path
- path types stay explicit through `BRACKET`, `OCO`, `GUIDED_SEQUENCE`, or `UNAVAILABLE`
- capability handling stays in `services/`, not in `app/`
- no execution guarantee is implied and no live order payload exists yet

For P5-5 specifically:

- the confirmation shell can expand into a simple, linear confirmation flow
- flow steps stay explicit through `REVIEW`, `CONSTRAINT_CHECK`, `CONFIRM_INTENT`, and `UNAVAILABLE`
- progression remains user-driven, deterministic, and in-memory only
- app surfaces render prepared flow steps instead of inferring confirmation rules locally
- execution still does not exist, even when all required steps are marked complete

For P5-6 specifically:

- each confirmation step can carry explicit acknowledgement state
- acknowledgements are reversible and remain non-persistent
- service-owned actions recompute the flow after acknowledge, unacknowledge, and reset events
- app surfaces invoke those service actions instead of owning progression logic
- execution still does not exist, even when acknowledgements are complete

For P5-7 specifically:

- one service-owned confirmation session owns one selected plan at a time
- the session carries prepared preview, shell, flow, and explicit session actions together
- raw confirmation-flow state moves out of `app/` and into `services/`
- plan switching remains explicit, local to the screen lifecycle, and non-persistent
- the seam preserves room for a later execution adapter without introducing execution now

For P5-8 specifically:

- a service-owned execution adapter scaffold consumes the confirmation session
- adapter capability stays explicit and deterministic
- payload previews remain obvious placeholders instead of silently executable payloads
- app surfaces render prepared execution-preview contracts only
- no broker calls, order submission, or secret handling move into this phase

For P5-9 specifically:

- a service-owned readiness gate evaluates whether a confirmation session is eligible for submission
- blockers remain explicit, deterministic, and separate from non-blocking warnings
- app surfaces render prepared readiness state instead of validating submission rules locally
- readiness creates a seam before any later execution work without dispatching anything
- broker APIs, payload submission, and one-tap execution still do not exist in this phase

For P5-10 specifically:

- a service-owned submission-intent seam consumes confirmation session, execution preview, and readiness
- the result stays brutally explicit as either `BLOCKED` with reasons or `READY` with a placeholder-only contract
- readiness remains the eligibility gate; submission intent shapes the final pre-adapter contract and does not recompute readiness
- app surfaces render prepared submission-intent state instead of constructing submission details locally
- broker APIs, live payload dispatch, and persistence still do not exist in this phase

For P5-11 specifically:

- a service-owned execution-adapter seam now sits after submission intent
- the seam consumes only submission intent and returns either blocked passthrough or a simulated adapter response
- simulated adapter responses stay explicit with `dispatchEnabled=false` and `placeholderOnly=true`
- app surfaces render prepared adapter-attempt state instead of constructing adapter behavior locally
- real broker dispatch, network calls, and one-click execution still do not exist in this phase

Trade Hub intentionally does not include execution flows, journaling, notifications, AI-generated explanations, or exchange integration in this phase.
