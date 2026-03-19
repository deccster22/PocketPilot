# Snapshot Vision Alignment Note (P4-1)

P4-1 introduces a dedicated `SnapshotModel` so Snapshot can remain a calm, zero-interpretation surface even while the underlying event/history system grows.

The model is intentionally narrow:
- core state only for the three-part Snapshot center
- optional subordinate secondary placeholders
- compact history counts rather than raw event detail

This keeps Snapshot aligned with the product vision:
- no raw signal leakage
- no dashboard-style context expansion
- no narrative pressure or action-driving prose
- one stable model prepared in `services/`, not interpreted inside `app/`
