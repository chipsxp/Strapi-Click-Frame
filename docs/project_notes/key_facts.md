# Key Facts

Non-sensitive project configuration and constants. **Never store passwords, API keys, or secrets here.**

---

## Project Structure

- **Type**: Two-project monorepo (Strapi CMS backend + Astro frontend)
- **Root**: Strapi 5 backend — `src/`, `config/`, `scripts/`, `data/`
- **Frontend**: Astro 6 — lives in `react/` subdirectory with its own `package.json`
- **Git**: Not currently a git repository (as of 2026-04-27)

---

## Local Development URLs

- **Strapi backend**: `http://localhost:1337`
- **Strapi admin panel**: `http://localhost:1337/admin`
- **Strapi REST API base**: `http://localhost:1337/api`
- **Astro dev server**: `http://localhost:4321`

---

## Package Versions (as of 2026-05-17)

- Strapi: `5.46.0`
- Astro: `^6.3.3` (in `react/package.json`)
- `strapi-community-astro-loader`: `^4.0.0`
- `@astrojs/node`: Added for SSR support
- Node: `>=22.12.0`
- Database: SQLite (`better-sqlite3`)

---

## Strapi Content Types

| Content Type | Kind | REST Endpoint | Notes |
|---|---|---|---|
| `photo` | Collection | `/api/photos` | Main media assets with munch counts |
| `reaction` | Collection | `/api/reactions` | Munching records (classic/cheddar) |
| `profile-config` | **Single type** | `/api/profile-config` | Header visuals and global stats |
| `category` | Collection | `/api/categories` | Plural: `categories` |
| `category` (Merge) | Custom | `/api/categories/:documentId/merge` | Batch move photos & delete source |
| `comment` | Collection | `/api/comments` | 1-level threading; max 1 reply per comment |
| `comment` (Moderation) | Custom (Astro) | `/api/comment/[id]` (DELETE) | Moderator/Editor only deletion |
| `follow` | Custom (Astro) | `/api/toggle-follow` | Toggle user follow relationship |
| `about` | **Single type** | `/api/about` | Singular loader |
| `global` | **Single type** | `/api/global` | Singular loader |

---

## Munch Economy Rules

- **Classic Munch**: 1 per day per user, non-accumulating. Represented by light chip.
- **Cheddar Munch**: 1 earned per 5 Classics given. Represented by yellow chip.
- **Self-Voting**: Strictly forbidden for both types.
- **Awarding**: Backend lifecycles automate Cheddar balance and Daily reset.

---

## User Schema Extensions

- `last_classic_munch_at`: DateTime (Daily reset tracking)
- `classic_munch_given_total`: Integer (Cheddar progress)
- `cheddar_munch_balance`: Integer (Spendable favorites)

---

## Critical Files

| File | Purpose |
|---|---|
| `react/astro.config.mjs` | Astro config — `output: 'server'` with Node adapter |
| `react/src/middleware.ts` | Auth middleware for session validation |
| `react/src/pages/api/` | SSR endpoints for login, logout, munch, and upload |
| `photorium/src/api/reaction/content-types/reaction/lifecycles.ts` | Munch economy business logic |

---

## Module Resolution Notes

- `strapi-community-astro-loader` is installed in **root `node_modules/`**, not `react/node_modules/`
- Node's parent-directory resolution allows `react/` to find it — this is intentional (see ADR-001)
- `react/package.json` does NOT list the loader package — it's an implicit dependency via root install

---

## User Roles & Permissions

- **Super Admin**: Seeded global administrator with full control over the system.
- **Author Role**: Individual login accounts for content creators.
- **Privacy**: Each Author has control over their own dashboard, individual media, and metadata.

---

## Media & Storage Architecture

- **Provider**: ImageKit.io via `strapi-plugin-imagekit`.
- **Storage Logic**: Binary files are stored externally in ImageKit Account Storage.
- **Strapi Properties**: ImageKit properties (optimized URLs, metadata, transforms) are stored as attributes within Strapi's media records (SQLite database).
- **Metadata**: Structured according to **Open Graph (OG)** standards for social media compatibility.

---

## Frontend Design (Flickr-style)

- **Layout**: Responsive grid array with rows and columns.
- **Intersections**: Each grid cell contains:
  - Photograph (Optimized via ImageKit)
  - Title
  - Description
- **Tech Stack**: Astro 6 + Vite + strapi-community-astro-loader.
- **Content Delivery**: Strapi REST API → Astro Content Collections → Vite Build → Static/SSR Public Grid.



---

## ImageKit Plugin Admin Settings (as of 2026-10-22)

- **Settings location**: Strapi Admin > ImageKit plugin > Settings page. Stored in the **database** (plugin store), NOT in `plugins.ts`.
- **Precedence**: Once saved in the admin panel, DB values override the `imagekit.config` block in `photorium/config/plugins.ts` (which only supplies credentials as first-run fallback). Changing `IMAGEKIT_*` env vars after an admin save has NO effect on plugin settings.
- **Media Delivery**: "Deliver media using ImageKit" = ON; "Use ImageKit Transformations for Responsive URLs" = ON; Signed URLs = OFF (public photo grid).
- **Upload Configuration**: "Enable Uploads" = OFF (intentional) - uploads already go to ImageKit via `strapi-provider-upload-imagekit` (the `upload` provider block in `plugins.ts`). Enabling both would duplicate uploads.
- **Per-environment**: Local SQLite and Strapi Cloud production DBs are separate - toggles must be set in EACH admin panel.


---

## PR-1 API Surface and Permission Model (as of 2026-10-22)

- **Backend dir**: Strapi lives in `photorium/` (not the repo root).
- **Custom endpoints**:
  - `PUT /api/user-ext/me` - authenticated; whitelisted fields only (bio, nickname, avatar, username, real_name).
  - `POST /api/user-ext/toggle-follow` - authenticated; body `{ targetUserDocumentId }`.
  - `GET /api/user-ext/public-profile/:username` - public; explicit field allow-list plus follower/following counts.
  - `POST /api/donations/record` - authenticated; `month` is server-assigned.
  - `POST /api/confirm-email` - Astro route; forwards the verification token to Strapi.
- **Policies**: `global::force-author` (`config.field` = `author` or `user`) on `create` for photo, comment, category.
- **Not granted to any API role**: `plugin::users-permissions.user.update`, `plugin::upload.api.upload`, public `donation.create`.
- **Public read by design**: `user.find`/`findOne`, munch counters, `community-stat.getStats`.
- **Private user fields**: `email`, `real_name`, `special_date`, plus the plugin's token fields.
- **Email confirmation**: link is `/confirm?token=...`; the page shows a button and confirms via POST. Strapi tokens are single-use.
- **Strictness rule**: no `any`, no `unknown` annotations, no `as unknown as`. Known remaining violations are tracked in issue M8.