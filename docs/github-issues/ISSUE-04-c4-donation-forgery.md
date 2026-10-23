# C4: Unauthenticated donation forgery pollutes leaderboard

**Labels:** `security`, `backend`, `priority: critical` · **PR:** #6 (PR-1) · **Status:** Fix applied (commit c0613c8, PR #6)

## Problem
Bootstrap grants `donation.create` to the **public** role. Anyone can POST arbitrary donations — any `amount`, any `month`, and a `user` relation pointing at any account — directly forging the Hash Brown Hub "Top Munch Support" leaderboard and spamming the DB.

## Evidence
- `photorium/src/index.ts` L50-52
- `photorium/src/api/donation/content-types/donation/schema.json` (no constraints)
- Surfaced publicly via `community-stat.getStats` `top_donors`

## Fix
1. Remove public `donation.create` grant.
2. Custom `donation.record` controller + route: server-sets `month`, strips/validates `user` (self only when authenticated), enforces `amount > 0` and sane bounds.
3. Grant `api::donation.donation.record` to authenticated role (public donations, if desired, go through the same controller with `user` stripped).
4. Rate-limit the route (see ISSUE-09).

## Acceptance Criteria
- [ ] Unauthenticated `POST /api/donations` → 403
- [ ] `month`/`user` cannot be forged via `record`
- [ ] Leaderboard shows only server-validated donations
