# Bug Log: Zeroed-Out User Stats & Panels

## Issue Description
After logging in, the floating user stats card and various panels (Community Support, Top Artists, etc.) showed zero values ($0, 0 Munching, 0 Photos), even though they worked correctly when logged out.

## Root Cause Analysis
1. **Backend Permission Mismatch (Primary)**:
   - The custom `community-stats` endpoint was correctly permitted for the `public` role in Strapi.
   - However, the `authenticated` and `editor` roles lacked permission for `api::community-stat.community-stat.getStats`.
   - When a user logged in, Astro sent the request with an `Authorization` header. Strapi checked the user's role, found no permission, and returned a `403 Forbidden`.

2. **Astro Error Handling**:
   - In `react/src/pages/index.astro`, the `fetch` call for stats failed due to the 403.
   - The code defaulted the `stats` object to `null`, leading the UI components to receive `0` as a fallback value for all stats.

3. **State Management Misconception**:
   - It was initially suspected that Astro's "islands" architecture needed a shared state manager (like Nano Stores).
   - **Correction**: Since the data is fetched server-side (SSR) in the Astro frontmatter and passed as static props to the components, client-side state management was not the bottleneck.

## Solution
1. **Bootstrap Permission Fix**:
   - Modified `photorium/src/index.ts` to include `api::community-stat.community-stat.getStats` in the `authActions` and `editorActions` arrays.
   - This ensures that every time the Strapi server starts, it programmatically grants the necessary permissions to logged-in users.

2. **Validation**:
   - Confirmed that the `community-stats` controller is correctly using the Strapi 5 **Document Service API** (`strapi.documents()`), maintaining alignment with modern Strapi standards.

## Lessons Learned
- **Check the Network Tab First**: A 403 error is a definitive indicator of a permission issue, regardless of how complex the state management seems.
- **Bootstrap for Scalability**: Always add new custom controller actions to the `bootstrap` permission script to prevent "silent" failures for authenticated users.
- **SSR vs Client State**: Data fetched in Astro frontmatter is static props. Use Nano Stores only when you need reactivity *between* components after the page has loaded.

# Bug Log: Comment Deletion Not Persisting

## Issue Description
As an Editor, deleting a comment would remove it from the UI immediately, but refreshing the page would cause the comment to reappear.

## Root Cause Analysis
- **Legacy ID vs. Document ID**: The `CommentSection.tsx` component was passing the numeric `id` to the delete API endpoint. 
- **Strapi 5 Requirement**: In Strapi 5, the Document Service (which the API route uses) expects the `documentId` (a string UUID-like identifier) for operations like deletion. While the numeric `id` might work for some operations, it was failing to correctly persist the deletion of comments in this specific context.

## Solution
- Updated `CommentSection.tsx` to pass both the numeric `id` (for immediate UI state filtering) and the `documentId` (for the API call).
- Updated the `handleDelete` function to call the API using the `documentId`.

## Lessons Learned
- **Always use documentId for APIs**: In Strapi 5, when calling any custom API route that interacts with the Document Service, prioritize `documentId` over numeric `id`.
- **UI State vs. Server State**: Just because an item disappears from the UI (due to `setComments` filtering) doesn't mean the server request succeeded. Always verify persistence with a refresh.
