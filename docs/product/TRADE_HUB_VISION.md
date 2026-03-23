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

Trade Hub intentionally does not include execution flows, journaling, notifications, AI-generated explanations, or exchange integration in this phase.
