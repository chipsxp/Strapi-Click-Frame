# Phase 4: Playwright Security, Performance & E2E Testing Plan

**Objective:** Thoroughly test the Photorium frontend (Railway) and backend (Strapi Cloud) with a strict focus on Security (zero-leakage, memory management) and Performance (image optimization).

## Step 4.1: Cloud Environment Synchronization (Manual Assist Needed) - **COMPLETED**
*   **Action:** Populate the Strapi Cloud Dashboard (`Settings > Variables`) with ImageKit API keys and PayPal sandbox credentials. 
*   **Dependency:** Manual addition by the project owner to the Strapi Cloud instance.

## Step 4.2: Initial User Seeding (Editor & Test User)
*   **[x] Action (ArtistOne):** Create the Editor account. *(Completed via Strapi Admin UI)*
    *   **Username:** ArtistOne
    *   **Nickname:** ArtOne
    *   **Email:** service@chipsxp.com
    *   **Status:** Verified Email = `true`, Role = `Editor`
*   **[ ] Action (FanOne):** Automate the frontend UI signup process via Playwright to ensure the public registration flow works perfectly.

## Step 4.3: Chrome DevTools MCP Integration & Security Auditing
*Security is Priority #1.* Leverage Playwright combined with Chrome DevTools Protocol (CDP) / Chrome DevTools MCP.
*   **Action (Documentation):** Ingest Chrome DevTools MCP documentation (via Web Fetch or Graphify) to understand required API structures.
*   **Action (Leakage Check):** Playwright will authenticate users and aggressively assert the browser state:
    *   Scan `window.localStorage` and `window.sessionStorage`. 
    *   **Assertion:** Must be completely void of JWTs, API keys, or user emails (relying solely on `HttpOnly` secure cookies).
*   **Action (Garbage Collection):** Trigger CDP commands (e.g., `HeapProfiler.collectGarbage`) during heavy DOM manipulations (scrolling the photo grid) to ensure no detached DOM nodes or memory leaks occur.

## Step 4.4: Performance & Image Optimization Validation
*Performance is Priority #2.*
*   **Action (Upload & Delivery):** Playwright logs in as `ArtistOne` and uploads a high-resolution test image.
*   **Action (Network Interception):** Intercept frontend grid network requests.
    *   **Assertion:** Response headers for images must return `content-type: image/webp` or `image/avif`.
    *   **Assertion:** Image URLs must contain ImageKit transformation parameters to ensure optimized delivery.

## Step 4.5: Social & "Munch" Economy E2E Testing
*   **Action (Following):** `FanOne` follows `ArtistOne`. Assert follower count updates without page refresh.
*   **Action (Munching):** `FanOne` gives a "Classic Munch" to `ArtistOne`'s photo.
    *   **Assertion:** `FanOne` daily limit decreases.
    *   **Assertion:** `ArtistOne` receives notification/stat bump.
    *   **Assertion:** Verify 5-to-1 Cheddar conversion logic triggers successfully on the backend once thresholds are met.

## Step 4.6: Monetization (PayPal) Validation
*   **Action (Donation Flow):** Use Playwright to mock a PayPal sandbox transaction for a direct artist donation.
*   **Action (Cheddar Purchasing):** Test the flow of purchasing premium "Cheddar" chips.
    *   **Assertion:** Upon successful sandbox payment capture, verify `cheddar_munch_balance` increments securely without relying on easily manipulated client-side callbacks.
