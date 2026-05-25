# Deployment Stress Test Execution Plan

**Objective:** Audit the dual-deployment (Railway Frontend + Strapi Cloud Backend) for secret leakage, local storage bloat, and garbage collection efficiency under load.

## Strategy: Divide and Conquer
To avoid the processing delays encountered previously with Chrome DevTools MCP, the workload is split:
1.  **The Agitator (Background):** A headless Playwright script (`scripts/stress_tester.js`) running locally that generates continuous user activity against the live Railway app.
2.  **The Inspector (Foreground):** Gemini using Chrome DevTools MCP on a single, isolated page to observe the state of the application under load.

## Execution Schedule (4 Hours)

### Hour 1: Setup & Baseline
*   Write `photorium/scripts/stress_tester.js` (Playwright).
    *   *Requirements:* Automate login, rapid navigation between photo feeds/details, and API interaction (comments/munches).
*   Verify the script successfully authenticates and interacts with `https://photorium-production.up.railway.app`.
*   Use Chrome DevTools MCP (`take_memory_snapshot`) to establish a baseline heap snapshot on a clean load.

### Hour 2: Security & Network Audit
*   Launch `stress_tester.js` in the background.
*   Use DevTools MCP to monitor the active session.
*   **Action:** Call `list_network_requests` and inspect JSON payloads.
*   **Assertion:** Ensure no JWTs, API keys, or sensitive backend user fields (like password hashes or reset tokens) are exposed in API responses.

### Hour 3: Storage & Memory Audit
*   While the load continues, evaluate client-side state.
*   **Action:** Use `evaluate_script` to dump `window.localStorage` and `window.sessionStorage`.
*   **Assertion:** Ensure no secrets are cached and storage is not accumulating non-essential data.
*   **Action:** Periodically call `take_memory_snapshot`.
*   **Assertion:** Analyze the JS heap size to confirm garbage collection is clearing old DOM nodes and image data (preventing memory leaks).

### Hour 4: Review & Hotfix
*   Terminate the background stress tester.
*   Synthesize the findings.
*   Implement local fixes for any detected leaks, over-fetching, or memory issues.
*   Prepare the local repository for a hotfix push to Railway and Strapi Cloud.
