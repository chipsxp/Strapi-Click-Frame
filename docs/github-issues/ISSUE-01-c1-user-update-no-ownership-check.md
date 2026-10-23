# C1: Any authenticated user can edit ANY user account (account takeover + economy fraud)

**Labels:** `security`, `backend`, `priority: critical` · **PR:** #6 (PR-1) · **Status:** Fix applied (commit c0613c8, PR #6)

## Problem
`photorium/src/index.ts` bootstrap grants `plugin::users-permissions.user.update` to both `authenticated` and `editor` roles. The users-permissions plugin's `PUT /api/users/:id` performs **no ownership check** — any logged-in user can change any other user's `username`, `email`, `password`, and custom economy fields (`cheddar_munch_balance`, `classic_munch_given_total`), enabling full account takeover and chip-economy fraud.

## Evidence
- `photorium/src/index.ts` L101 (`authenticated`) and L159 (`editor`)
- Plugin source: `node_modules/@strapi/plugin-users-permissions/dist/server/controllers/auth.js` — `update` validates body but never compares `:id` to `ctx.state.user.id`

## Fix
1. Remove `plugin::users-permissions.user.update` from both role grants in bootstrap.
2. New `api::user-ext` custom controllers: `updateMe` (PUT `/api/user-ext/me`, whitelisted fields only: bio, nickname, avatar, username, real_name, social_links) and `toggleFollow` (POST `/api/user-ext/toggle-follow`, operates only on `ctx.state.user`).
3. Repoint `react/src/pages/api/update-profile.ts` and `react/src/pages/api/toggle-follow.ts` to the new endpoints.
4. Grant `api::user-ext.user-ext.updateMe`/`toggleFollow` to authenticated + editor in bootstrap.

## Acceptance Criteria
- [ ] `PUT /api/users/{otherUserId}` as authenticated → 403
- [ ] Profile edit + follow/unfollow still work via new endpoints
- [ ] `cheddar_munch_balance` not writable through any public API
