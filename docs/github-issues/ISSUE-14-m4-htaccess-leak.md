# M4: react/.htaccess untracked and unignored — contains PayPal client ID and server paths

**Labels:** `security`, `chore`, `priority: medium` · **PR:** PR-7

## Problem
`react/.htaccess` shows as untracked (`?? react/.htaccess`) and is NOT covered by any `.gitignore` rule — one `git add -A` commits the PayPal client ID, absolute server paths (`/home/kntkbdup/...`), production hostnames, and a stale domain (`crunch.chipsxp.com`, superseded by `chipncheddar.com`).

## Fix
1. Add `react/.htaccess` (and `**/.htaccess`) to root `.gitignore`.
2. Optionally commit a sanitized `react/.htaccess.example` with placeholders.
3. Confirm with maintainer whether the PayPal client ID should be rotated (client IDs are public-by-design; low risk).

## Acceptance Criteria
- [ ] `git status` no longer shows `react/.htaccess`
- [ ] No secrets/infra paths committed
