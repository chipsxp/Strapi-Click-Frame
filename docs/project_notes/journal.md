# Strapi-Click-Frame: A Development Journal

## The Genesis: Building a Flickr-Style Gallery

*May 3, 2026*

Every great project begins with a pivot. What started as a standard Strapi-powered blog has quickly evolved into a dedicated, Flickr-style photo-sharing application. The architecture is a modern two-project monorepo: a robust Strapi 5 backend managing the data and an Astro 6 frontend delivering a lightning-fast, static grid layout.

But transforming a blog template into a media-heavy platform is rarely a straight line. Here is the story of how we built the foundation, the roadblocks we hit, and the engineering decisions that shaped the current architecture.

### The Monorepo Decision
From the start, we wanted a seamless developer experience without the heavy abstraction of enterprise monorepo tools like Turborepo or Lerna. We settled on a simple structure: the Strapi backend at the root, and the Astro frontend nestled in a `react/` subdirectory. 

This required some clever configuration. We decided to install the `strapi-community-astro-loader` at the root level (ADR-001). Because of Node's natural module resolution, the Astro frontend could still locate the dependency by walking up the directory tree. It kept our dependencies centralized, even if it meant the frontend’s `package.json` looked a bit sparse.

### Upgrading the Bridge: Astro 6 and Strapi 5
Our first real hurdle was the integration layer. The project was using `strapi-community-astro-loader` v2, which immediately threw TypeScript errors against our Astro 6 installation. Astro 6 had introduced breaking changes to its `Loader` types.

Rather than patching it with `@ts-ignore` casts, we made the call to upgrade the loader to v4.0.0 (ADR-002). This solved our type issues but introduced a new challenge: the v4 loader dropped native support for Strapi's "Single Types" (like our `global` and `about` pages). It expected everything to be a paginated collection.

Our solution? We built a custom bridge. We wrote a `strapiSingleLoader` directly into our `content.config.ts` (ADR-003) that bypasses the internal `@strapi/client` pagination logic and uses native `fetch()` to grab the single-type endpoints. It was a surgical fix that kept our dependencies light and our data flowing.

### The Media Pivot: Enter ImageKit
As the project pivoted toward photography, storing high-resolution images locally in SQLite or the filesystem became untenable. We needed a CDN.

We selected ImageKit.io and installed the `strapi-plugin-imagekit` (ADR-007). The goal was simple: Strapi would handle the relational data, but the heavy lifting of media storage, optimization, and delivery would be offloaded to ImageKit. 

This, however, led to one of our most frustrating bugs. When Astro tried to build the frontend, Strapi crashed entirely, throwing a `500 Internal Server Error`. 

The root cause was a subtle configuration quirk in Strapi 5. While we had provided our ImageKit API keys to the `upload` provider in `config/plugins.ts`, the ImageKit plugin *also* required a standalone `imagekit` configuration block to initialize properly. Every time a content type containing an image was requested, the plugin panicked.

Adding to the mystery, our attempt to quickly paste the API keys into the `.env` file using PowerShell corrupted the file with a mix of UTF-8 and UTF-16LE encodings. Node.js read the resulting null bytes and assumed the `.env` file was a binary executable. After a quick script to strip the null bytes and the addition of the missing `imagekit` block in `plugins.ts`, the backend stabilized.

### Re-aligning the Front and Back
With the backend running, we faced our final sync issue. Astro reported `fetch failed` with a `404 Not Found` for `/api/articles` and a `403 Forbidden` for other routes.

The backend had moved on—we now had `photo`, `category`, `tag`, `reaction`, and `comment` models—but the frontend `content.config.ts` was still looking for the old `article` and `author` endpoints. Furthermore, our Strapi seed script was broken because it was trying to seed `article` JSON data into an empty schema, meaning the `public` role was never granted permission to read the new endpoints.

We updated the Astro collections to mirror the new schema. Then, rather than relying on manual clicking in the Strapi Admin panel or a brittle seed script, we wrote a dynamic initialization script in `photorium/src/index.ts`. Now, every time Strapi boots, it checks the database and automatically grants public `find` and `findOne` permissions to all our frontend-facing endpoints.

Finally, we polished the developer experience by installing `@types/node` to resolve a lingering `process.env` TypeScript warning in the Astro config.

### Looking Ahead
Today, the foundation is solid. The Strapi backend automatically configures its own permissions on startup. The Astro frontend is strictly typed, error-free, and dynamically syncing with our new photo-centric models. ImageKit is fully wired up, ready to serve optimized photography to the world.

Next up: Designing the visual grid, implementing author-specific dashboards, and bringing the Flickr-style aesthetic to life.
