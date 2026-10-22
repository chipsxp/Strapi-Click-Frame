# Implementation Plan — Full-Stack Security & Quality Remediation

## [Overview]

Remediate 25 issues found in the 2026-10-22 audit of the Strapi-Click-Frame monorepo (`photorium/` Strapi 5.46 backend + `react/` Astro 6 SSR frontend): 5 critical API security flaws, 5 high-severity authorization/data-integrity bugs, 9 medium issues, 6 low-severity items. Work is sequenced as 7 PRs, each mapped to a pre-written GitHub issue in `docs/github-issues/`, with project memory (`docs/project_notes/`) updated per protocol. Cross-referenced: `bugs.md` (2026-05-14 CamelCase token bug, 2026-05-17 populate strictness), ADR-009 (JWT-in-cookie), and graphify Community 6 (donation/PayPal surface).

## [Issue Register]

### Critical (PR-1)
- **C1** — `plugin::users-permissions.user.update` granted to `authenticated`+`editor` roles (`photorium/src/index.ts`): plugin `PUT /users/:id` has NO ownership check → account takeover + munch-balance fraud. Fix: revoke grant; new self-scoped `user-ext.updateMe` / `user-ext.toggleFollow` controllers; repoint Astro `update-profile.ts` + `toggle-follow.ts`.
- **C2** — `email` and `real_name` were not `private` in the user schema, so public `GET /api/users` leaked every email. Decision: public `user.find`/`findOne` and the munch stats stay public (artist discovery, Hash Brown Hub). Fix: mark only `email`, `real_name`, `special_date` `"private": true`; new `GET /api/user-ext/public-profile/:username` with an explicit field allow-list.
- **C3** — `photo.create`/`comment.create`/`category.create` granted to authenticated with no author enforcement → author spoofing via direct Strapi calls. Fix: new `global::force-author` policy overwriting `data.author`/`data.user` with `ctx.state.user`; attach to `create` on all three routers.
- **C4** — Public role has `donation.create` → unauthenticated donation forgery (any amount/month/user). Fix: remove grant; custom `donation.record` controller (server-set `month`, strip `user` unless self, `amount > 0`).
- **C5** — Email confirmation token is single-use and consumed by GET; `confirm.astro` confirms in frontmatter, so email-scanner/browser prefetch consumes the token before the user's click → 400 `Invalid token` ("already verified"). Evidence: plugin `auth.js` `emailConfirmation` nulls `confirmationToken` on first hit. Fix: button-gated POST flow (`POST /api/confirm-email`), idempotent `emailConfirmation` wrapper in `strapi-server.ts` (Invalid token → soft already-confirmed), friendly UX states, resend option.

### High (PR-2..PR-4, PR-6)
- **H1** — `/api/community-stats` returns raw `top_photos_*` with full author objects (email leak) + unbounded `findMany` (DoS). Fix: field projection, `count()` aggregations, 60s cache.
- **H2** — Munch economy TOCTOU races: `custom-reaction.give` + `reaction/lifecycles.ts` check-then-act without transactions; `incrementView` read-modify-write. Fix: `strapi.db.transaction()`, atomic SQL increments.
- **H3** — Category merge replaces ALL category memberships (`categories: [target]`), non-atomic, contradictory authz. Decision: **editor-only merge of any category**. Fix: `{disconnect:[source],connect:[target]}`, transaction, editor bypass of ownership check.
- **H4** — No rate limiting (`strapi::ratelimit` absent). Fix: enable globally + strict limits on auth/comment/donation/upload/view routes.
- **H5** — `/admin` unguarded (`AdminLayout.astro` has no role check), dead `/admin/users` link, hardcoded stats. Fix: role guard, remove dead link, wire real stats.

### Medium (PR-5, PR-7)
- **M1** — `register.ts`: manual `Set-Cookie` (no `Secure` in prod), 30d vs login 7d Max-Age, JWT in response body (violates ADR-009). Fix: `cookies.set()`, drop body JWT, align TTL.
- **M2** — Dead `api/munch.ts` (always 403; superseded by `give-chip.ts`). Fix: delete.
- **M3** — Hardcoded `127.0.0.1:1337`/`localhost:1337` in client-shipped code (`Navbar.tsx`, `PhotoGrid.tsx`, `photo/[id].astro`). Fix: `PUBLIC_STRAPI_URL` or same-origin API routes.
- **M4** — `react/.htaccess` untracked + unignored; contains PayPal client ID, absolute server paths, stale domain. Fix: gitignore + sanitized `.htaccess.example`.
- **M5** — `Astro.redirect('/404')` but no `404.astro`. Fix: add styled page.
- **M6** — `/crunch.mp3` vs `/sfx/crunch.mp3` mismatch; neither exists in `react/public/`. Fix: add `public/sfx/crunch.mp3`, unify refs.
- **M7** — Middleware fetches `/users/me` on every request uncached. Fix: skip static assets, 30s token-keyed cache.
- **M8** — `any` regressions vs zero-`any` mandate (custom-photo, custom-reaction, community-stat, comment.ts, index.astro, dashboard.astro). Fix: local-interface pattern.
- **M9** — Doc drift: `.clinerules`/`key_facts.md` describe root-level Strapi + 5.43; actual `photorium/` + 5.46; ADR-001 stale (loader now in `react/package.json`). Fix: rewrite docs, ADR-012 supersedes ADR-001 (ADR-011 was used by PR-1).

### Low (PR-7)
- **L1** — Comment lifecycle fails open on lookup errors. Fix: fail closed.
- **L2** — Nested `<a>` via `<object>` in `PhotoGrid.tsx` (invalid HTML/a11y). Fix: sibling overlay links.
- **L3** — Public `reaction.find/findOne` exposes who munched what. Confirm intent.
- **L4** — `plugin::upload.api.upload` (admin-scope ID) granted to API roles; unlimited 15MB uploads for any authed user. Fix: remove wrong ID; rate-limit.
- **L5** — `notifications.ts` wildcard `populate[author][populate]=*`. Fix: scope fields.
- **L6** — `index.astro` `9999999` sentinel filter. Fix: early-empty render.

## [Types]

- `react/src/types/strapi.ts`: add `PublicArtistProfile` (username, nickname, bio, avatar, documentId, counts); `SanitizedPhotoSummary`; make `StrapiUser.email` optional; narrow `StrapiCommunityStats.community.top_photos_*`.
- Backend: reuse local-interface pattern (`CategoryWithUser`-style) to eliminate M8 `any`s; no class changes.
- User schema: `"private": true` on `email`, `real_name`, `special_date` only (output-hiding). Munch stats stay public by product decision.
- Strictness rule (project-wide): no `any`, no `unknown` as an annotation, no `as unknown as` double casts. Use local interfaces and the generated Strapi types.


## [Files]

**Backend (`photorium/`)** — New: `src/policies/force-author.ts`; `src/api/user-ext/{controllers,routes}/user-ext.ts` (`updateMe`, `toggleFollow`, `publicProfile`); donation custom `record` controller + route. Modify: `src/index.ts` bootstrap grants; `config/middlewares.ts` (ratelimit); `community-stat` controller; `reaction` lifecycles + `custom-reaction.ts` + `custom-photo.ts` (transactions/atomic); `category/controllers/category.ts` (merge); `comment` lifecycles (fail closed); user `schema.json` (private flags); `extensions/users-permissions/strapi-server.ts` (idempotent emailConfirmation).
**Frontend (`react/`)** — Modify: `api/register.ts`, `api/update-profile.ts`, `api/toggle-follow.ts`, `artist/[username].astro`, `Navbar.tsx`, `PhotoGrid.tsx`, `photo/[id].astro`, `middleware.ts`, `AdminLayout.astro`, `admin/index.astro`, `index.astro`, `api/notifications.ts`, `confirm.astro`. New: `pages/404.astro`, `pages/api/confirm-email.ts`, `public/sfx/crunch.mp3`, `react/.env.example`. Delete: `pages/api/munch.ts`.
**Repo** — `.gitignore` (+`react/.htaccess`), `.clinerules`, `docs/project_notes/*`, `docs/github-issues/`, sanitized `react/.htaccess.example`.

## [Functions]

- New: `forceAuthor` policy; `userExt.updateMe(ctx)` (whitelist bio/nickname/avatar/username/real_name/social_links); `userExt.toggleFollow(ctx)` (server-side connect/disconnect, caller only); `userExt.publicProfile(ctx)`; `donation.record(ctx)`; Astro `POST /api/confirm-email`.
- Modified: `customReaction.give` (transaction + atomic), reaction `afterCreate/afterDelete` (atomic), `customPhoto.incrementView` (atomic), `category.merge` (connect/disconnect + transaction + editor bypass), `communityStat.getStats` (projection + counts + cache), comment `beforeCreate` (fail closed), bootstrap permission arrays, plugin `auth.emailConfirmation` wrapper (idempotent).
- Removed: Astro `munch.ts` POST (no callers).

## [Classes]

None — codebase uses Strapi factories + Astro routes only.

## [Dependencies]

No new packages. Rate limiting via built-in `strapi::ratelimit`; transactions via built-in `strapi.db.transaction`. No version bumps in scope.

## [Testing]

1. Security regression (curl/PS): unauth `GET /api/users` → 403; authed `PUT /api/users/{otherId}` → 403; photo create with foreign `author` → stored as caller; unauth `POST /api/donations` → 403; community-stats response has no `email`.
2. Economy concurrency: 2 parallel classic gives → exactly 1 succeeds; 20 parallel views → exact count.
3. Merge: photo in 2 categories retains target + other; editor merges another user's categories; author → 403.
4. Email loop: register → GET `/confirm?token=X` twice (scanner sim) → POST confirm → success; second POST → already-confirmed friendly state; login works.
5. `cd photorium && npm run build`; `cd react && npx astro check && npm run build` — zero errors, zero `any`.
6. Log each fix in `docs/project_notes/bugs.md`.

## [Implementation Order]

1. **PR-1 · Auth & permissions hardening** — C1, C2, C3, C4, C5 (shared bootstrap + users-permissions extension).
2. **PR-2 · community-stats sanitization + rate limiting** — H1, H4.
3. **PR-3 · Munch economy atomicity** — H2.
4. **PR-4 · Category merge fix** — H3.
5. **PR-5 · Frontend route/cookie/env cleanup** — M1, M2, M3, M5, M6, L2, L5, L6.
6. **PR-6 · Admin guard** — H5.
7. **PR-7 · Repo hygiene + types + docs** — M4, M7, M8, M9, L1, L3, L4 + project-memory updates.

GitHub tracking: one markdown per issue in `docs/github-issues/` + `PR-PLAN.md`; real issues created on GitHub after auth.

