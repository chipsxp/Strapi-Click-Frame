# GitHub Issues & PR Plan — Security & Quality Remediation (2026-10-22)

Source of truth: `implementation_plan.md` (repo root). Each `ISSUE-*.md` below is ready to paste into GitHub Issues (title = first heading, labels listed per file). Real issues will be created via the GitHub integration after auth.

## PR Sequencing

| PR | Title | Issues | Branch |
|----|-------|--------|--------|
| PR-1 | fix(security): auth & permissions hardening | #01 C1, #02 C2, #03 C3, #04 C4, #05 C5 | `fix/pr1-auth-permissions` |
| PR-2 | fix(security): community-stats sanitization + rate limiting | #06 H1, #09 H4 | `fix/pr2-stats-ratelimit` |
| PR-3 | fix(economy): atomic munch counters & transactions | #07 H2 | `fix/pr3-munch-atomicity` |
| PR-4 | fix(categories): safe editor-only merge | #08 H3 | `fix/pr4-category-merge` |
| PR-5 | fix(frontend): cookies, dead routes, env URLs, misc UX | #11 M1, #12 M2, #13 M3, #15 M5, #16 M6, #21 L2, #24 L5, #25 L6 | `fix/pr5-frontend-cleanup` |
| PR-6 | fix(admin): role guard + live stats | #10 H5 | `fix/pr6-admin-guard` |
| PR-7 | chore(repo): hygiene, types, docs | #14 M4, #17 M7, #18 M8, #19 M9, #20 L1, #22 L3, #23 L4 | `chore/pr7-hygiene-docs` |

## Assignment Notes

- PR-1 must merge first — every later PR assumes corrected permission grants.
- PR-3 and PR-4 both touch backend controllers; review together to avoid conflicts.
- #05 (email confirmation) blocks new signups in production — highest user-facing priority inside PR-1.
- #22 (L3) needs a product decision before implementation: keep public or restrict to authenticated.

## Labels to create (if missing)

`security`, `bug`, `data-integrity`, `performance`, `frontend`, `backend`, `chore`, `documentation`, `priority: critical`, `priority: high`, `priority: medium`, `priority: low`
