# Architectural Decisions

Architectural Decision Records (ADRs) for the Strapi-Click-Frame project. Add a new entry for every significant technical choice. Never delete old entries â€” mark them superseded instead.

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
- Add to `react/package.json` â†’ Rejected: duplicates the install, adds friction when upgrading
- Monorepo workspaces â†’ Rejected: overkill for a two-project repo

**Consequences:**
- âœ… Single install location, simpler upgrades
- âœ… Works with Node's natural resolution
- âŒ The dependency is implicit â€” `react/package.json` doesn't list it, which can confuse new developers
- âŒ If `react/` is ever extracted to a standalone repo, the dependency must be moved

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
- Downgrade Astro to 5.x â†’ Rejected: goes backwards, loses Astro 6 improvements
- Add `@ts-ignore` / `as any` casts â†’ Rejected: masks errors, no runtime guarantee
- Switch to `@sensinum/astro-strapi-loader` â†’ Rejected: more actively maintained but different API; v4 is the right upgrade path for the existing code

**Consequences:**
- âœ… Fully Astro 6 compatible types
- âœ… No type casts needed
- âŒ v4 API changed â€” `strapiUrl` â†’ `clientConfig.baseURL`, Zod `schema` now required per collection
- âŒ v4 does not support Strapi single types (requires custom loader â€” see ADR-003)

---

### ADR-003: Custom `strapiSingleLoader` for Strapi Single Types (2026-04-27)

**Context:**
- Strapi has two content type kinds: collection types (paginated) and single types (one entry)
- Single types (`about`, `global`) are accessed at singular REST endpoints: `/api/about`, `/api/global`
- `strapi-community-astro-loader` v4 calls `@strapi/client`'s `client.collection()` which pluralizes the name and paginates â€” incompatible with single types

**Decision:**
- Write a `strapiSingleLoader` helper function inside `react/src/content.config.ts`
- Uses `fetch()` directly (no extra dependencies) to call `/api/{contentType}?populate=*`
- Reads `json.data`, stores one entry with `documentId` as the ID via `store.set()`
- All Strapi single types (`about`, `global`) use this loader

**Alternatives Considered:**
- Set `pluralContentType` to the singular name â†’ Rejected: `@strapi/client`'s pagination logic still fails on the single-type response shape (missing `meta.pagination`)
- Remove `about` and `global` from collections â†’ Rejected: these may be needed for future pages
- Use `@strapi/client`'s `client.single()` â†’ Rejected: `@strapi/client` is not listed in `react/package.json`, making it an implicit dependency; `fetch()` is always available in Astro

**Consequences:**
- âœ… Correct Strapi single-type REST API usage
- âœ… No extra dependencies in `react/`
- âœ… Easy to extend (just call `strapiSingleLoader({ contentType: "..." })`)
- âŒ Custom code to maintain if Astro or Strapi loader API changes

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
- Fully strict schemas â†’ Rejected: would break on any Strapi API shape change; complex to maintain for dynamic zones
- All `z.any()` â†’ Rejected: loses all type safety for fields that are actually used in pages

**Consequences:**
- âœ… Build won't break on Strapi API shape variations
- âœ… Simple scalars still type-checked in pages
- âŒ No type safety on `blocks`, `author`, `category` in page components

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
- Document "run `astro dev` first" â†’ Rejected: poor DX, editors still show red errors
- Commit `.astro/types.d.ts` â†’ Rejected: generated file, changes on every Astro upgrade

**Consequences:**
- âœ… Zero TypeScript errors in a fresh clone before running any commands
- âœ… Standard Astro project pattern
- âŒ Needs to exist in every Astro project in this repo (only one currently)

---

### ADR-006: `baseURL` for `@strapi/client` Must Include `/api` Suffix (2026-04-27)

**Context:**
- `strapi-community-astro-loader` v4 uses `@strapi/client` internally
- The env variable `STRAPI_URL` is set to `http://localhost:1337` (no `/api`)
- `@strapi/client` does NOT auto-append `/api` â€” it uses `baseURL` verbatim

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
- âœ… **Security**: Significantly improved by keeping JWTs and API keys off the client.
- âœ… **Experience**: Fully dynamic and interactive social features are now possible.
- âŒ **Complexity**: Increased frontend logic (API routes, middleware) and backend lifecycles.
- âŒ **Performance**: Shift from static HTML to on-demand rendering; mitigated by optimized Strapi queries.

### ADR-010: FormEvent Deprecation and SubmitEvent Adoption (2026-05-11)

**Context:**
- React's synthetic `FormEvent` type was producing TypeScript errors during `astro check` when assigned to a standard DOM `SubmitEvent` handler inside React components embedded in Astro.
- Explicitly casting or adhering to the DOM `SubmitEvent` ensures better compatibility when moving beyond standard React boundaries or strict type-checking modes.

**Decision:**
- We are deprecating the use of `React.FormEvent<HTMLFormElement>` in favor of the standard DOM `SubmitEvent` for form submission handlers.
- In cases where React's `onSubmit` prop strictly expects a `FormEventHandler`, we will cast the synthetic event appropriately (e.g., `onSubmit={(e) => handleSearch(e as unknown as SubmitEvent)}`) to maintain the `SubmitEvent` signature on our handler functions.

**Consequences:**
- ✅ Standardizes form event types closer to the DOM specification.
- ✅ Resolves strict Astro type-checking errors in cross-framework setups.
- ⚠️ Requires a slightly verbose cast at the inline `onSubmit` prop site within React components.

---

### ADR-011: Hybrid Cloud Architecture (Railway + Strapi Cloud) (2026-05-22)

**Context:**
- The project needs a production-ready backend and a staging/testing environment for the frontend that supports Playwright E2E testing.
- Strapi Cloud provides the most stable and zero-config environment for the Strapi 5 backend, including automatic Postgres, CDN, and Email setup.
- Railway is highly cost-effective for testing and supports manual CLI-based deployments that bypass global GitHub hooks, allowing for isolated "staging" pushes.

**Decision:**
- We are adopting a Hybrid Cloud Architecture:
    1. **Backend**: Strapi Cloud (Official) for the production backend and database.
    2. **Frontend**: Railway for staging and E2E testing (via Playwright).
    3. **Final Production**: LiteSpeed LAMP server (`chipsxp.com`) for the static Astro build.

**Alternatives Considered:**
- **Full Railway**: Rejected because Strapi 5's Postgres and Media Library configuration is more robust on Strapi's native cloud.
- **Full Strapi Cloud**: Rejected as it does not natively host non-Strapi frontend projects like Astro in the same project context as easily as Railway.

**Consequences:**
- ✅ **Stability**: Backend is on optimized infrastructure.
- ✅ **Testability**: Railway staging allows for full E2E validation before production deployment.
- ⚠️ **Multi-Platform Management**: Requires managing two sets of environment variables and two different CLI tools (Railway and Strapi).

---

### ADR-012: Build-Time Content Sync Resilience (2026-05-25)

**Context:**
- Astro content loaders fetch data from Strapi Cloud during the build phase.
- Network latency or transient CMS downtime can cause build failures on Railway if the fetch times out (default 10s).

**Decision:**
- Implement a `fetchWithRetry` utility for all custom content loaders.
- Set a 30-second timeout per attempt and perform up to 3 retries with exponential backoff.

**Consequences:**
- ✅ **Build Stability**: Significantly reduces "flaky" builds due to transient network issues.
- ✅ **Hybrid Cloud Support**: Better handles the inherent latency of cross-provider communication (Railway <-> Strapi Cloud).
- ⚠️ **Build Duration**: Failed builds will take longer to fail (up to ~2 minutes) due to retries and backoff.

---

### ADR-014: Triple-Clear Logout and Aggressive Cache-Control (2026-05-25)

**Context:**
- Users reported "sticky" sessions where they remained logged in even after clicking Logout.
- This is often caused by browsers or proxy layers (like Cloudflare or Railway's edge) caching the `strapi_jwt` cookie or the HTML of the dashboard page.

**Decision:**
- **Triple-Clear Logout**: The `/api/logout` route now:
    1. Calls `cookies.delete()` with synchronized attributes (path, secure, sameSite).
    2. Explicitly sets the cookie to an empty string with `maxAge: 0` and an expired date in the past.
    3. Returns a `302 Redirect` to ensure the browser clears its internal state and performs a fresh navigation.
- **Direct Navigation**: Switched from `fetch`-based logout in the dashboard to a direct `<a>` link to ensure a full browser lifecycle.
- **Aggressive Cache-Control**: Updated `middleware.ts` to inject `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` and `Pragma: no-cache` on ALL responses.

**Consequences:**
- ✅ **Session Integrity**: Guarantees that logout is immediate and consistent across all browsers.
- ✅ **Dynamic Accuracy**: Ensures that users always see the correct "Logged In" or "Logged Out" state without stale cache interference.
- ⚠️ **Performance**: Disables browser caching for the entire application; acceptable for Photorium's highly dynamic community nature, but may increase server load slightly.



