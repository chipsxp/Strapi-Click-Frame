# H3: Category merge destroys other category memberships, is non-atomic, and contradicts its own policy

**Labels:** `data-integrity`, `bug`, `backend`, `priority: high` · **PR:** PR-4

## Problem
Three defects in `category.merge`:
1. **Data loss**: `categories: [targetCategory.documentId]` REPLACES all memberships — a photo in 3 flavors loses the other 2.
2. **Non-atomic**: photo moves and category delete are separate awaited calls — a mid-flight failure leaves corrupted state.
3. **Contradictory authz**: route policy `global::is-editor` blocks authors, but the controller requires ownership of source+target — so editors can only merge their OWN categories and authors none at all.

**Decision (confirmed 2026-10-22):** editor-only merge of ANY category — relax the controller ownership check for editor/admin, keep the policy.

## Evidence
- `photorium/src/api/category/controllers/category.ts` L51-94
- `photorium/src/api/category/routes/custom-category.ts` (policy)
- `react/src/pages/api/merge-category.ts` L32-36 (editor gate)

## Fix
1. Per photo: `categories: { disconnect: [sourceDocumentId], connect: [targetDocumentId] }`.
2. Wrap the whole merge in `strapi.db.transaction()`.
3. Bypass ownership check when caller role type is `editor`/`admin` (populate role on the lookup).

## Acceptance Criteria
- [ ] Merged photos keep non-source category memberships
- [ ] Editor can merge another user's categories; author → 403
- [ ] Simulated failure mid-merge rolls back cleanly
