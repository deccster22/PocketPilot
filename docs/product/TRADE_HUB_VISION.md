# Trade Hub Vision

Trade Hub is the future surface for calm, structured action framing.

Its job is not to pressure the user into trading. Its job is to show what PocketPilot believes a sensible next action shape could be, why that framing exists, and what constraints or cautions apply.

-selected plan can expand into a capability-aware confirmation shell
-shell describes what confirmation would require on the current platform path
-path types stay explicit through BRACKET, OCO, GUIDED_SEQUENCE, or UNAVAILABLE
-capability handling stays in services/, not in app/
-no execution guarantee is implied and no live order payload exists yet

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

Trade Hub intentionally does not include execution flows, journaling, notifications, AI-generated explanations, or exchange integration in this phase.
