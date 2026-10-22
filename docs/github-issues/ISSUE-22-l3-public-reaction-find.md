# L3: Public can list who munched what via reaction.find/findOne

**Labels:** `security`, `backend`, `priority: low` · **PR:** PR-7

## Problem
`reaction.find`/`findOne` are granted to the public role, exposing the entire munch/reaction graph (who reacted to which photos, which could be PII-adjacent).

## Evidence
- `photorium/src/index.ts` reaction grants

## Fix
**Decision required:** Either revoke public `find`/`findOne` (restrict to owner/admin) or document intentional public sharing. If kept, sanitize user details and disable filters that expose others' data.

## Acceptance Criteria
- [ ] Product decision recorded in `decisions.md`
- [ ] Endpoint access matches decision
