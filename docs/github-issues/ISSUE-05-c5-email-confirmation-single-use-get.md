# C5: Email verification link dies before user clicks it (single-use GET consumed by prefetch)

**Labels:** `security`, `bug`, `backend`, `frontend`, `priority: critical` · **PR:** PR-1

## Problem
Every new signup's verification email fails with "You're already verified. No need for a second time." (even for brand-new accounts after deleting old ones). Root cause: Strapi's `GET /api/auth/email-confirmation?confirmation=TOKEN` is **single-use** — the plugin nulls `confirmationToken` on the first hit. `react/src/pages/confirm.astro` performs the confirmation as a side effect of rendering a GET page, so email link scanners (Outlook SafeLinks, Gmail/Apple prefetch) and browser prerendering consume the token **before the human clicks**. The real click then gets 400 `Invalid token`, displayed as a failure. Deleting/recreating accounts can't help — every fresh email gets scanned.

## Evidence
- `photorium/node_modules/@strapi/plugin-users-permissions/dist/server/controllers/auth.js` — `emailConfirmation` does `userService.edit(user.id, { confirmed: true, confirmationToken: null })`, then `Invalid token` on subsequent hits
- `react/src/pages/confirm.astro` L14-36 — state-changing fetch in frontmatter with `redirect: 'manual'`
- `photorium/scripts/fix-email-template.js` — link format `/confirm?token=<%= CODE %>`
- Related: `docs/project_notes/bugs.md` 2026-05-14 (same plugin, token lifecycle)

## Fix (defense in depth)
1. `confirm.astro`: remove frontmatter confirmation; render an explicit **"Confirm My Stash"** button. GET never mutates state.
2. New `react/src/pages/api/confirm-email.ts` (POST): forwards token to Strapi server-side.
3. `photorium/src/extensions/users-permissions/strapi-server.ts`: wrap `auth.emailConfirmation` to be idempotent — catch `Invalid token` and return a soft `already-confirmed` outcome instead of a hard 400 (a used token is indistinguishable from a forged one; re-confirming is harmless).
4. UX states on confirm page: pending → success / error. The server maps a used token to a success response, so the page shows success.
5. **Follow-up (not in PR-1):** offer a "resend link" action via the plugin's `POST /api/auth/send-email-confirmation` when a token is truly invalid.

## Acceptance Criteria
- [ ] Simulate scanner: GET `/confirm?token=X` twice → no error; then POST confirm → account confirmed
- [ ] Second POST → friendly "already verified" state, not an error
- [ ] Full loop: register → confirm → login passes
