# Updated Strategy: Shared Flavors & Dashboard Notifications

## 1. Shared Categories (Flavor Pruning)
*   **Logical Shift**: Categories are now "Shared Community Flavors." Authenticated users can create them (e.g., during upload), but only **Editors** can Rename, Merge, or Delete them.
*   **Backend Security**: Implement an `is-editor` policy in Strapi. Apply it to `update` and `delete` routes for the `category` API.
*   **Frontend**: Hide the "Manage Flavors" button from the Dashboard for non-editor users.

## 2. Social Features (Following & Notifications)
*   **Following Feed**: Ensure users can follow/unfollow artists (Toggle-follow API).
*   **Dashboard Alerts**: 
    *   Poll for new art from followed artists.
    *   Show a dismissible alert feed (Max 5 items).
    *   Newest art appears at the top; oldest (6th) is automatically dismissed.
    *   Users can click to dismiss individual alerts.

## 3. Implementation Status
*   **Frontend**: UI placeholders for following/unfollowing and category management are present but need role-based logic.
*   **Backend**: `merge` endpoint exists; `rename` and `delete` need security policies.
