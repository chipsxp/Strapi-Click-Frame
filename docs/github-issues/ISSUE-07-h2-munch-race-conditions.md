# H2: Munch economy race conditions (double-spend daily Classic, overdraw Cheddar, lost counts)

**Labels:** `data-integrity`, `bug`, `backend`, `priority: high` · **PR:** #28 (PR-3)

## Problem
`custom-reaction.give` + `reaction/lifecycles.ts` do check-then-act without a transaction: two concurrent Classic munches both pass the daily-reset check (TOCTOU double-spend); Cheddar balance can go negative under concurrency; counter read-modify-write (`(count || 0) + 1`) loses updates. Same pattern in `custom-photo.incrementView`.

## Evidence
- `photorium/src/api/reaction/controllers/custom-reaction.ts` L19-88
- `photorium/src/api/reaction/content-types/reaction/lifecycles.ts` L74-152
- `photorium/src/api/photo/controllers/custom-photo.ts` L13-29 (`as any` + read-modify-write)

## Fix
1. Wrap the give flow in `strapi.db.transaction()`.
2. Replace counter updates with atomic SQL increments (`strapi.db.connection` knex `.increment()`/`.decrement()`).
3. Re-check daily-limit/balance inside the transaction.
4. Remove the `as any` casts while here (part of M8).

## Acceptance Criteria
- [ ] 2 parallel Classic gives → exactly one succeeds
- [ ] Cheddar balance never negative; photo counters exact under 20 parallel increments
- [ ] View counter exact under parallel load
