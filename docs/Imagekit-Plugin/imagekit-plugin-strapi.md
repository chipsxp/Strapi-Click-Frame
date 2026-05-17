---
title: Strapi Integration with ImageKit.io
description: Power your Strapi instance, delivering high-quality optimized images with the help of ImageKit.
---

Strapi is a leading open-source headless CMS for building custom websites and applications. Integrating Strapi with ImageKit offloads image storage and enables real-time image optimization and transformation, improving performance and user experience on your website.

This guide walks you through installing and configuring the ImageKit provider for Strapi's upload plugin. You can view the [source code](https://github.com/imagekit-developer/strapi-plugin-imagekit) on GitHub.

## Plugin Features

- **Media Library Integration**: Browse and manage your ImageKit media library directly in Strapi.
- **Bulk Import**: Import existing ImageKit assets into Strapi with a single click.
- **Optimized Delivery**: Serve optimized images and videos through ImageKit.
- **Upload**: Upload new files to ImageKit directly from the Strapi media library.
- **Signed URLs**: Deliver signed URLs for your media assets.

## Prerequisites

Before you begin, you need:
- A Strapi project (v5 or later)
- Node.js and npm/yarn installed
- Administrator access to your Strapi instance

You can refer to strapi's [official documentation](https://docs.strapi.io/cms/quick-start) to understand the prerequisites for running your strapi instance.

## Installation

To install the ImageKit plugin in your strapi instance, run the following command from your project's root directory:

**Using NPM:**
```bash
npm install strapi-plugin-imagekit --save
```

**Using Yarn:**
```bash
yarn add strapi-plugin-imagekit
```

Once installed, you must rebuild your Strapi instance by running the following command:

**Using NPM:**
```bash
npm run build
npm run develop
```

**Using Yarn:**
```bash
yarn build
yarn develop
```

After rebuilding, the **ImageKit** plugin will appear in the sidebar and Settings section. Complete the [essential configuration](#essential-imagekit-plugin-configuration) steps immediately after this, followed by the [Content Security Policy](#configure-security-middleware-csp) update for the ImageKit Media Library to work.

|                                                                                                                     |                                                                                              |
| ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| ![](https://ik.imagekit.io/ikmedia/docs_images/integration/strapi/sidebar_screenshot.png?tr=h-960,w-1898,fo-left) | ![](https://ik.imagekit.io/ikmedia/docs_images/integration/strapi/settings_screenshot.png) |


## Essential ImageKit Plugin Configuration

You can configure the ImageKit plugin from within the Strapi admin dashboard just like you would do for other plugins. This section contains the essential credentials to connect with your ImageKit account. You should update these settings immediately after installing the plugin. Other settings for media delivery and media uploads are covered in subsequent sections.

1. **Public Key**: Obtain your public key (prefixed with `public_`) from the [API Keys section](https://imagekit.io/dashboard/developer/api-keys) of your ImageKit dashboard.

2. **Private Key**: Copy your private key (prefixed with `private_`) from the same dashboard page.
   > **Note:** Keep your private key confidential as it grants full access to your ImageKit account

3. **URL Endpoint**: Get your endpoint URL (formatted as `https://ik.imagekit.io/your_imagekit_id`) from the same dashboard page.

![ImageKit API Keys Dashboard](https://ik.imagekit.io/ikmedia/docs_images/integration/strapi/api_keys_dashboard.png)

## Media Delivery Configuration

These settings help you deliver the existing assets in the Strapi Media Library via ImageKit. It doesn't move any asset to the ImageKit Media Library.

1. **Configure Web Folder Origin**: Add Strapi as a web folder origin in your ImageKit dashboard (ignore if already done). Follow the [Web Server Integration Documentation](/integration/web-server) for detailed steps.

2. **Enable Integration**: Toggle **Enable Plugin** to ON to activate ImageKit integration for media handling. When OFF, Strapi will use the default provider for uploads.
3. **Enable Transformations**: **Use Transform URLs** toggle when ON leverages ImageKit's real-time transformations, generating responsive URLs with automatic format detection and image optimization capabilities. When OFF, original images are served without transformations.
4. **Configure Secure Access** (recommended):
   - Enable **Use Signed URLs**.
   - Set an appropriate **Expiry** time (0 for URLs that never expire, or a duration in seconds).

## Media Upload Configuration

These settings copy any image uploaded to the Strapi Media Library to the ImageKit Media Library as well. 

1. **Enable Uploads**: Toggle this option ON to upload the files uploaded in Strapi to your ImageKit media library. When OFF, files will be uploaded to the default Strapi storage location. Enabling this option does not upload existing files in Strapi to ImageKit.

2. **Set Upload Properties**:
   - **Upload Folder**: Specify a base directory path in ImageKit for organizing your uploads.
   - **Tags**: Add comma-separated tags to categorize and filter media assets.
   - **Overwrite Tags**: Choose whether to replace existing tags or append new ones.

3. **Configure Security & Validation**:
   - **File Checks**: Define validation rules for uploads such as size limits or allowed file types. See [Upload API Checks](https://imagekit.io/docs/api-reference/upload-file/upload-file#upload-api-checks) for available options.
   - **Mark as Private**: Toggle ON to restrict public access to uploaded files.

## Advanced: Programmatic configuration

While the primary way to configure the ImageKit plugin is through the Strapi admin settings page, you can also provide default values in your Strapi project's `config/plugins.js` file. This is particularly useful for setting up initial configurations in development or deployment environments.

Settings defined in `config/plugins.js` serve as default values that are copied to the dashboard on the first run of your Strapi application. After this initial setup, any changes made through the admin UI will be stored in the database and will be used instead of the values in the configuration file.

Here's an example showing essential credentials pulled from environment variables, with other common settings hardcoded:

```js
module.exports = ({ env }) => ({
  imagekit: {
    enabled: true,
    config: {
      // Basic Configuration
      publicKey: env("IMAGEKIT_PUBLIC_KEY"),
      privateKey: env("IMAGEKIT_PRIVATE_KEY"),
      urlEndpoint: env("IMAGEKIT_URL_ENDPOINT"),

      // Delivery Configuration
      enabled: true,
      useTransformUrls: true,
      useSignedUrls: false,
      expiry: 3600, // URL expiry time in seconds when useSignedUrls is true

      // Upload Configuration
      uploadEnabled: true,

      // Upload Options
      uploadOptions: {
        folder: "/strapi-uploads/",
        tags: ["strapi", "media"],
        overwriteTags: false,
        checks: "", // Example: '"file.size" <= "5MB"'
        isPrivateFile: false,
      },
    },
  },
});
```

You can source more settings from environment variables if needed by parsing them accordingly (e.g., convert string 'true' to boolean true).

Remember to set these environment variables in your .env file:

```
IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxxxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

## Using ImageKit Assets in Strapi

To use any media asset in Strapi, it must first be brought into the Strapi Media Library. Therefore, to utilize the assets stored in the ImageKit Media Library within Strapi, we first need to import them into Strapi.

1. Head to the ImageKit Media Library from the menu on the left.
2. Find the files you want to bring to the Strapi Media Library, select them all, and click on the "Insert" button at the top of the ImageKit Media Library.
3. You should see a success message when the import is completed, and the files should then start showing up in the Strapi Media Library as well. These assets can then be inserted into any content in the CMS.

When importing assets in this manner, Strapi does not create a copy of them in its Media Library. So you won't find these assets in the `public/uploads` folder like the other assets you upload directly to the Strapi Media Library. Instead, Strapi refers to the ImageKit asset directly via its URL and uses that URL to load the asset. Any asset inserted in this manner will always be accessed via its ImageKit URL, rather than the Strapi Media URL. You can validate this by fetching content that uses an ImageKit asset inserted in this way and verifying that it is always referenced by its ImageKit URL.

## Configure Security Middleware (CSP)

To ensure your Strapi application can securely load assets and interact with ImageKit services, you need to update your Content Security Policy (CSP) settings. This is configured in the `strapi::security` middleware.

Modify your `config/middlewares.js` file as follows. This configuration allows your Strapi admin panel and frontend (if applicable) to load images, videos, and the embedded frame for the ImageKit Media Library, while maintaining a secure policy:

```js
// config/middlewares.js
module.exports = [
  {
    "name": "strapi::security",
    "config": {
      "contentSecurityPolicy": {
        "useDefaults": true,
        "directives": {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            "ik.imagekit.io", // ImageKit domain for images, add your custom domain if you use one
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            "ik.imagekit.io", // ImageKit domain for videos/audio, add your custom domain if you use one
          ],
          "frame-src": [
            "'self'",
            "data:",
            "blob:",
            "eml.imagekit.io", // For ImageKit UI components
          ],
          "upgradeInsecureRequests": null,
        },
      },
    },
  },
  // Keep your other middleware entries as it is
];
```

> **Important**: If you use a custom domain with ImageKit, add or update the relevant lines with your custom domain.

