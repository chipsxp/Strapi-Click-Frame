# Implementation Plan: Photorium Dynamic Features & "Munch" Economy

## Background & Motivation
Transition Photorium from a static gallery to a dynamic, community-driven platform. The core engagement mechanic is the **"Munch" economy**—a reciprocal support system where artists earn "Cheddar" (favorites) by actively engaging with and supporting their fellow creators using "Classic" (daily likes) chips.

## The "Munch" Economy Rules
The frontend and backend will strictly enforce the following reciprocity-based logic:

| Feature | Classic Munch (Like) | Cheddar Munch (Favorite) |
| :--- | :--- | :--- |
| **Visual Representation** | Light Chip | Yellow Chip |
| **Grant Rule** | 1 chip per day, non-accumulating. | 1 chip earned per 5 Classic Munches given. |
| **Accumulation** | None. Must use today's to get tomorrow's. | Earned and saved for special "faves". |
| **Constraint** | Cannot vote for self. | Cannot vote for self. |
| **Goal** | Daily community participation. | High-tier appreciation/curation. |

---

## Phased Implementation Plan

### Phase 1: Backend Data Modeling & Auth (Strapi 5)
1.  **User Schema Extensions:**
    *   `last_classic_munch_at`: DateTime (to track daily chip resets).
    *   `classic_munch_given_total`: Integer (to calculate Cheddar progress).
    *   `cheddar_munch_balance`: Integer (available favorites to spend).
2.  **Photo Schema Extensions:**
    *   `classic_munch_count`: Integer (total light chips).
    *   `cheddar_munch_count`: Integer (total yellow chips).
    *   `munched_by`: Relation (track which users gave which chips to prevent duplicates/self-voting).
3.  **Global Settings:** `ProfileConfig` (Single Type) for cover images and featured stats.
4.  **RBAC:** Author role restricted to own media; Public can "Munch" only when authenticated.

### Phase 2: Astro SSR & Authentication Flow
1.  **SSR Mode:** Enable `output: 'server'` with Node adapter.
2.  **Secure Session:** JWT stored in `HttpOnly` cookies via Astro API routes (`/api/login`).
3.  **Middleware:** Protect `/dashboard` and check for active session before allowing `/api/munch` calls.

### Phase 3: Dashboards & Token Management
1.  **Author Dashboard:** Upload/Manage media via ImageKit.
2.  **Chip Wallet UI:** A small status indicator showing:
    *   "Daily Classic: Ready/Used"
    *   "Cheddar Progress: [|||..] (3/5)"
    *   "Cheddar Balance: [1]"
3.  **Upload Proxy:** `/api/upload` to handle multipart data for ImageKit plugin.

### Phase 4: Dynamic Frontend & "Chip Stack" UI
1.  **Munch Chip Display:** Update grid items to show two distinct counters:
    *   Light Chip Icon + `classic_munch_count`.
    *   Yellow Chip Icon + `cheddar_munch_count`.
2.  **Masonry Grid:** Implement dynamic loading and infinite scroll.
3.  **Flavor Bar:** Filter gallery by "Most Classic" or "Cheddar Favorites".

### Phase 5: The "Munch" Interaction Logic
1.  **Interaction State Machine:**
    *   **Step A:** Verify User != Author.
    *   **Step B:** Check if User wants to spend Classic or Cheddar.
    *   **Step C (Classic):** Check if `last_classic_munch_at` is older than 24h OR null.
    *   **Step D (Cheddar):** Check `cheddar_munch_balance > 0`.
    *   **Step E:** On success, update Strapi, play "Crunch" SFX, and update local UI state.
2.  **Cheddar Awarding Logic:** Triggered on the backend when `classic_munch_given_total` increments; if `total % 5 == 0`, increment `cheddar_munch_balance`.

## Verification & Testing
*   **Auth:** Ensure no one can Munch without a session.
*   **Daily Reset:** Test that a user cannot use two Classic chips in the same calendar day.
*   **Self-Vote Prevention:** API must return 403 if `user_id == author_id`.
*   **Cheddar Grant:** Verify a Cheddar chip appears in the wallet exactly after the 5th, 10th, 15th, etc., Classic Munch is given.
*   **Optimization:** Ensure the Masonry grid handles the dual-chip display without layout thrashing.
