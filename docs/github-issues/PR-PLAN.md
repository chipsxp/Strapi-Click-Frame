# GitHub Issues & PR Plan — Security & Quality Remediation (2026-10-22)

Source of truth: `implementation_plan.md` (repo root). Each `ISSUE-*.md` below is ready to paste into GitHub Issues (title = first heading, labels listed per file). Real issues will be created via the GitHub integration after auth.

## PR Sequencing

| PR | Title | Issues | Branch | GitHub PR |
|----|-------|--------|--------|-----------|
| PR-1 | fix(security): auth & permissions hardening | #01 C1, #02 C2, #03 C3, #04 C4, #05 C5 | `fix/pr1-auth-permissions` | #6 (open, code complete) |
| PR-2 | fix(security): community-stats sanitization + rate limiting | #06 H1, #09 H4 | `fix/pr2-stats-ratelimit` | #27 (draft) |
| PR-3 | fix(economy): atomic munch counters & transactions | #07 H2 | `fix/pr3-munch-atomicity` | #28 (draft) |
| PR-4 | fix(categories): safe editor-only merge | #08 H3 | `fix/pr4-category-merge` | #29 (draft) |
| PR-5 | fix(frontend): cookies, dead routes, env URLs, misc UX | #11 M1, #12 M2, #13 M3, #15 M5, #16 M6, #21 L2, #24 L5, #25 L6 | `fix/pr5-frontend-cleanup` | #30 (draft) |
| PR-6 | fix(admin): role guard + live stats | #10 H5 | `fix/pr6-admin-guard` | #31 (draft) |
| PR-7 | chore(repo): hygiene, types, docs | #14 M4, #17 M7, #18 M8, #19 M9, #20 L1, #22 L3, #23 L4 | `chore/pr7-hygiene-docs` | #32 (draft) |

## Filing Status (2026-10-23)

- GitHub issues #1-#5 exist and are closed by PR #6 (code applied: `docs/project_notes/issues.md` "2026-10-22 - PR-1" entry).
- GitHub issues #7-#26 filed from `ISSUE-06-*.md` .. `ISSUE-25-*.md` on 2026-10-23 (issue #6 is occupied by the already-existing open PR; the doc numbering and GitHub numbering differ by one from #06 onward).
- Draft PRs #27-#32 created with placeholder commits; implementation pending assignment. No assignees set.
- #23 (L3) needs a product decision before implementation; #24 (L4) was partially addressed in PR-1 (invalid grant removed).

## Assignment Notes

- PR-1 must merge first — every later PR assumes corrected permission grants.
- PR-3 and PR-4 both touch backend controllers; review together to avoid conflicts.
- #05 (email confirmation) blocks new signups in production — highest user-facing priority inside PR-1.
- #22 (L3) needs a product decision before implementation: keep public or restrict to authenticated.

## Labels to create (if missing)

`security`, `bug`, `data-integrity`, `performance`, `frontend`, `backend`, `chore`, `documentation`, `priority: critical`, `priority: high`, `priority: medium`, `priority: low`
