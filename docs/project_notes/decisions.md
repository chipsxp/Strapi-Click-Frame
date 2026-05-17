# Architectural Decisions

Architectural Decision Records (ADRs) for the Strapi-Click-Frame project. Add a new entry for every significant technical choice. Never delete old entries — mark them superseded instead.

---

### ADR-001: Install `strapi-community-astro-loader` at Root, Not in `react/` (2026-04-27)

**Context:**
- The monorepo has a Strapi backend at root and an Astro frontend at `react/`
- The loader package is a dev-time Astro dependency, not a Strapi dependency
- `react/` does not have its own `node_modules/` for this package

**Decision:**
- Install `strapi-community-astro-loader` in the root `package.json` (alongside Strapi)
- Node's module resolution walks up directories, so `astro dev` run from `react/` finds the package in the parent `node_modules/`

**Alternatives Considered:**
- Add to `react/package.json` → Rejected: duplicates the install, adds friction when upgrading
- Monorepo workspaces → Rejected: overkill for a two-project repo

**Consequences:**
- ✅ Single install location, simpler upgrades
- ✅ Works with Node's natural resolution
- ❌ The dependency is implicit — `react/package.json` doesn't list it, which can confuse new developers
- ❌ If `react/` is ever extracted to a standalone repo, the dependency must be moved

---

### ADR-007: External Media Storage via ImageKit (2026-04-30)

**Context:**
- The project requires high-performance, optimized media delivery and simple management for individual authors.

**Decision:**
- Use `strapi-plugin-imagekit` to offload binary storage to ImageKit.io.

**Consequences:**
- Binary files are not stored in the repository or local filesystem. 
- Strapi media records will store ImageKit properties (URLs, IDs) as the "source of truth" for the frontend.

---

### ADR-008: Multi-Role Dashboard Architecture (2026-04-30)

**Context:**
- Need to distinguish between global site management and individual content contribution.

**Decision:**
- Implement a "Super Admin" for global configuration and "Author" roles for personal content/media management.

**Consequences:**
- Frontend dashboards in Astro must be role-aware and filter content/media by author ID.

---

### ADR-002: Use `strapi-community-astro-loader` v4 (Astro 6 Compatible) (2026-04-27)

**Context:**
- v2.0.6 was installed initially (targets `astro: "^5.0.0"`)
- Astro 6 changed the `Loader` type to `LoaderConstraint<{ id: string; }>` and changed `LogOptions`
- v2 produced 5 TypeScript errors that blocked the build

**Decision:**
- Upgrade to `strapi-community-astro-loader` v4.0.0 which declares `peerDependencies: { "astro": "^6.0.0" }`
- Updated `root/package.json` to `"strapi-community-astro-loader": "^4.0.0"`

**Alternatives Considered:**
- Downgrade Astro to 5.x → Rejected: goes backwards, loses Astro 6 improvements
- Add `@ts-ignore` / `as any` casts → Rejected: masks errors, no runtime guarantee
- Switch to `@sensinum/astro-strapi-loader` → Rejected: more actively maintained but different API; v4 is the right upgrade path for the existing code

**Consequences:**
- ✅ Fully Astro 6 compatible types
- ✅ No type casts needed
- ❌ v4 API changed — `strapiUrl` → `clientConfig.baseURL`, Zod `schema` now required per collection
- ❌ v4 does not support Strapi single types (requires custom loader — see ADR-003)

---

### ADR-003: Custom `strapiSingleLoader` for Strapi Single Types (2026-04-27)

**Context:**
- Strapi has two content type kinds: collection types (paginated) and single types (one entry)
- Single types (`about`, `global`) are accessed at singular REST endpoints: `/api/about`, `/api/global`
- `strapi-community-astro-loader` v4 calls `@strapi/client`'s `client.collection()` which pluralizes the name and paginates — incompatible with single types

**Decision:**
- Write a `strapiSingleLoader` helper function inside `react/src/content.config.ts`
- Uses `fetch()` directly (no extra dependencies) to call `/api/{contentType}?populate=*`
- Reads `json.data`, stores one entry with `documentId` as the ID via `store.set()`
- All Strapi single types (`about`, `global`) use this loader

**Alternatives Considered:**
- Set `pluralContentType` to the singular name → Rejected: `@strapi/client`'s pagination logic still fails on the single-type response shape (missing `meta.pagination`)
- Remove `about` and `global` from collections → Rejected: these may be needed for future pages
- Use `@strapi/client`'s `client.single()` → Rejected: `@strapi/client` is not listed in `react/package.json`, making it an implicit dependency; `fetch()` is always available in Astro

**Consequences:**
- ✅ Correct Strapi single-type REST API usage
- ✅ No extra dependencies in `react/`
- ✅ Easy to extend (just call `strapiSingleLoader({ contentType: "..." })`)
- ❌ Custom code to maintain if Astro or Strapi loader API changes

---

### ADR-004: Zod Schemas Use `z.any()` for Relations and Dynamic Zones (2026-04-27)

**Context:**
- `strapi-community-astro-loader` v4 requires explicit Zod schemas for every collection (auto-inference removed)
- Relations (`author`, `category` populated via `populate: "*"`) and dynamic zone `blocks` have complex, deeply nested shapes
- Strict schemas for these would be brittle against Strapi API changes

**Decision:**
- Simple scalar fields (`title`, `description`, `slug`, `publishedAt`, etc.) typed strictly
- Strapi media fields use a shared `strapiMedia` Zod object with known fields
- Relations (`author`, `category`) use `z.any()`
- `blocks` dynamic zone uses `z.array(z.record(z.string(), z.any()))`

**Alternatives Considered:**
- Fully strict schemas → Rejected: would break on any Strapi API shape change; complex to maintain for dynamic zones
- All `z.any()` → Rejected: loses all type safety for fields that are actually used in pages

**Consequences:**
- ✅ Build won't break on Strapi API shape variations
- ✅ Simple scalars still type-checked in pages
- ❌ No type safety on `blocks`, `author`, `category` in page components

---

### ADR-005: `react/src/env.d.ts` for Astro Virtual Module Types (2026-04-27)

**Context:**
- Astro generates `react/.astro/types.d.ts` on first `astro dev` run
- Before that file exists, TypeScript cannot resolve `astro:content`
- `react/.astro/` is git-ignored, so fresh clones always start without it

**Decision:**
- Commit `react/src/env.d.ts` containing `/// <reference types="astro/client" />`
- This provides a stable, always-present fallback for TypeScript to resolve all Astro virtual modules

**Alternatives Considered:**
- Document "run `astro dev` first" → Rejected: poor DX, editors still show red errors
- Commit `.astro/types.d.ts` → Rejected: generated file, changes on every Astro upgrade

**Consequences:**
- ✅ Zero TypeScript errors in a fresh clone before running any commands
- ✅ Standard Astro project pattern
- ❌ Needs to exist in every Astro project in this repo (only one currently)

---

### ADR-006: `baseURL` for `@strapi/client` Must Include `/api` Suffix (2026-04-27)

**Context:**
- `strapi-community-astro-loader` v4 uses `@strapi/client` internally
- The env variable `STRAPI_URL` is set to `http://localhost:1337` (no `/api`)
- `@strapi/client` does NOT auto-append `/api` — it uses `baseURL` verbatim

**Decision:**
- Always pass `clientConfig: { baseURL: \`${strapiUrl}/api\` }` to `strapiLoader()`
- The `STRAPI_URL` env var stays as the bare host; `/api` is appended in code

**Consequences:**
---

### ADR-009: Transition to Astro SSR and "Munch" Economy Implementation (2026-05-04)

**Context:**
- To support user authentication, secure media uploads, and dynamic social interactions (likes/favorites), the Photorium frontend required a shift from static site generation (SSG) to server-side rendering (SSR). 
- A reciprocal engagement system ("Munch" economy) was needed to drive community participation.

**Decision:**
- **Astro SSR**: Set `output: 'server'` and implemented `@astrojs/node` adapter.
- **HttpOnly Auth**: JWT tokens are stored in secure cookies and validated via Astro middleware.
- **Munch Logic**: Implemented two chip types (Classic/Cheddar) with backend-enforced daily resets and reward cycles.
- **Upload Proxying**: Built a secure server-side proxy for ImageKit uploads to protect API credentials.

**Consequences:**
- ✅ **Security**: Significantly improved by keeping JWTs and API keys off the client.
- ✅ **Experience**: Fully dynamic and interactive social features are now possible.
- ❌ **Complexity**: Increased frontend logic (API routes, middleware) and backend lifecycles.
- ❌ **Performance**: Shift from static HTML to on-demand rendering; mitigated by optimized Strapi queries.

 # # #   A D R - 0 1 0 :   F o r m E v e n t   D e p r e c a t i o n   a n d   S u b m i t E v e n t   A d o p t i o n   ( 2 0 2 6 - 0 5 - 1 1 ) 
 
 * * C o n t e x t : * * 
 -   R e a c t ' s   s y n t h e t i c   \ F o r m E v e n t \   t y p e   w a s   p r o d u c i n g   T y p e S c r i p t   e r r o r s   d u r i n g   \  s t r o   c h e c k \   w h e n   a s s i g n e d   t o   a   s t a n d a r d   D O M   \ S u b m i t E v e n t \   h a n d l e r   i n s i d e   R e a c t   c o m p o n e n t s   e m b e d d e d   i n   A s t r o . 
 -   E x p l i c i t l y   c a s t i n g   o r   a d h e r i n g   t o   t h e   D O M   \ S u b m i t E v e n t \   e n s u r e s   b e t t e r   c o m p a t i b i l i t y   w h e n   m o v i n g   b e y o n d   s t a n d a r d   R e a c t   b o u n d a r i e s   o r   s t r i c t   t y p e - c h e c k i n g   m o d e s . 
 
 * * D e c i s i o n : * * 
 -   W e   a r e   d e p r e c a t i n g   t h e   u s e   o f   \ R e a c t . F o r m E v e n t < H T M L F o r m E l e m e n t > \   i n   f a v o r   o f   t h e   s t a n d a r d   D O M   \ S u b m i t E v e n t \   f o r   f o r m   s u b m i s s i o n   h a n d l e r s . 
 -   I n   c a s e s   w h e r e   R e a c t ' s   \ o n S u b m i t \   p r o p   s t r i c t l y   e x p e c t s   a   \ F o r m E v e n t H a n d l e r \ ,   w e   w i l l   c a s t   t h e   s y n t h e t i c   e v e n t   a p p r o p r i a t e l y   ( e . g . ,   \ o n S u b m i t = { ( e )   = >   h a n d l e S e a r c h ( e   a s   u n k n o w n   a s   S u b m i t E v e n t ) } \ )   t o   m a i n t a i n   t h e   \ S u b m i t E v e n t \   s i g n a t u r e   o n   o u r   h a n d l e r   f u n c t i o n s . 
 
 * * C o n s e q u e n c e s : * * 
 -   '  S t a n d a r d i z e s   f o r m   e v e n t   t y p e s   c l o s e r   t o   t h e   D O M   s p e c i f i c a t i o n . 
 -   '  R e s o l v e s   s t r i c t   A s t r o   t y p e - c h e c k i n g   e r r o r s   i n   c r o s s - f r a m e w o r k   s e t u p s . 
 -   L'  R e q u i r e s   a   s l i g h t l y   v e r b o s e   c a s t   a t   t h e   i n l i n e   \ o n S u b m i t \   p r o p   s i t e   w i t h i n   R e a c t   c o m p o n e n t s .  
 