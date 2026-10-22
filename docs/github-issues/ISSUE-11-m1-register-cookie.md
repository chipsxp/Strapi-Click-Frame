# M1: register.ts cookie is insecure and inconsistent with login

**Labels:** `security`, `bug`, `frontend`, `priority: medium` · **PR:** PR-5

## Problem
`react/src/pages/api/register.ts` sets the session cookie via a manual `Set-Cookie` string: no `Secure` flag in production, `Max-Age=2592000` (30 days) vs login's 7 days, and it returns the JWT in the JSON response body — defeating the HttpOnly design from ADR-009.

## Evidence
- `react/src/pages/api/register.ts` L40-55 vs `react/src/pages/api/login.ts` L55-61

## Fix
Use `cookies.set('strapi_jwt', jwt, { path: '/', httpOnly: true, secure: import.meta.env.PROD, sameSite: 'lax', maxAge: ... })` identical to `login.ts`; remove `jwt` from the response body; align maxAge with the Strapi JWT TTL.

## Acceptance Criteria
- [ ] Register and login cookies have identical flags/TTL
- [ ] JWT absent from response body
- [ ] `Secure` present in production builds
