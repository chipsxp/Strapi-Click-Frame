# Deployment & Testing Plan: Photorium

**Railway Project Name:** photorium
**Railway URL:** https://photorium-production.up.railway.app
**Backend:** Strapi Cloud
**Strapi Cloud URL:** https://lively-advice-e5a07e92e2.strapiapp.com
**Production Target:** LiteSpeed LAMP server (`chipsxp.com` with SSL)  

## Phase 1: Railway CLI Initialization (Frontend Only)
*   **Target:** The `react/` (Astro/React) frontend folder.
*   **Action:** Used Railway CLI to initialize `photorium` project and service. Done.

## Phase 2: Environment Configuration
*   **Action:** Set environment variables in Railway to point to Strapi Cloud. Done.
    *   `STRAPI_BASE_URL` = `https://lively-advice-e5a07e92e2.strapiapp.com`
    *   `PUBLIC_STRAPI_URL` = `https://lively-advice-e5a07e92e2.strapiapp.com`
    *   `STRAPI_URL` = `https://lively-advice-e5a07e92e2.strapiapp.com`

## Phase 3: Manual Staging Deployment
*   **Action:** Deployed via `railway up`. Done.
*   **Status:** Active at https://photorium-production.up.railway.app

## Phase 4: Playwright E2E Testing
*   **Action:** Configure the Playwright test suite to target the newly generated Railway domain. Run the full suite of UI tests to verify that the frontend correctly communicates with the Strapi Cloud backend and functions as expected in a production-like environment.

## Phase 5: LiteSpeed LAMP Production Prep (`chipsxp.com`)
*   **Action:** Once the Railway staging tests pass:
    1.  Run a local static production build (`npm run build`).
    2.  Prepare an `.htaccess` file optimized for LiteSpeed routing (necessary for handling Astro's routing on a LAMP stack).
    3.  Zip the output directory for deployment to the `chipsxp.com` server with its SSL certificate.