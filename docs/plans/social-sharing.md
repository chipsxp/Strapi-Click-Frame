# Plan: Social Media Sharing Implementation

This plan outlines the steps to add social media sharing capabilities to the Photorium photo detail pages, allowing users to share art instantly to popular platforms.

## 1. Objective
Enable "One-Click" sharing for photos, ensuring that the title, description, and high-res image are correctly captured by platform link previews (Open Graph).

## 2. Technical Architecture

### A. Metadata (Open Graph)
To ensure social platforms display the correct image and text, we must update the global layout to handle dynamic metadata.
- **File**: `react/src/layouts/ClientLayout.astro`
- **Action**: Add `<meta>` tags for `og:title`, `og:description`, `og:image`, and `og:url`.
- **Logic**: Use Props passed from individual pages to fill these tags.

### B. Sharing Component
A reusable Astro component for sharing buttons.
- **File**: `react/src/components/SocialShare.astro`
- **Supported Platforms**:
  - **X (Twitter)**: `https://twitter.com/intent/tweet?text={title}&url={url}`
  - **Facebook**: `https://www.facebook.com/sharer/sharer.php?u={url}`
  - **Pinterest**: `https://pinterest.com/pin/create/button/?url={url}&media={image}&description={description}`
  - **LinkedIn**: `https://www.linkedin.com/sharing/share-offsite/?url={url}`
- **Props**: `url`, `title`, `description`, `image`.

### C. Detail Page Integration
- **File**: `react/src/pages/photo/[id].astro`
- **Action**: 
  - Pass photo metadata to `ClientLayout`.
  - Import and render `SocialShare` below the photo description.

## 3. Implementation Steps

1. **Update Layout**: Modify `ClientLayout.astro` to accept `title`, `description`, and `image` as props and render the corresponding OG meta tags in the `<head>`.
2. **Create Component**: Build `SocialShare.astro` with stylized buttons (icons + text) using the platform-specific sharing URLs.
3. **Update Detail Page**:
   - Ensure the `fetch` in `[id].astro` populates all necessary fields.
   - Insert `<SocialShare />` into the metadata card.
4. **Styling**: Ensure buttons match the Photorium aesthetic (bold typography, rounded corners, brand colors).

## 4. Verification
- Use the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) or [Twitter Card Validator](https://cards-dev.twitter.com/validator) to verify that the high-res ImageKit URL is being picked up correctly.
- Manually test each share button to ensure the intent URL opens a new window with the correct pre-filled text.
