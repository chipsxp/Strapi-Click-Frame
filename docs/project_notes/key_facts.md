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

- **Super Admin**: Seeded global administrator with full control over the system. The original Super Admin account email is `chips_xp@yahoo.com` (created during initial setup), not `service@chipsxp.com`.
- **Author Role**: Individual login accounts for content creators.
- **Privacy**: Each Author has control over their own dashboard, individual media, and metadata.

---

## Media & Storage Architecture

- **Provider**: ImageKit.io via `strapi-plugin-imagekit`.
- **Storage Logic**: Binary files are stored externally in ImageKit Account Storage.
- **Strapi Properties**: ImageKit properties (optimized URLs, metadata, transforms) are stored as attributes within Strapi's media records (SQLite database).
- **Metadata**: Structured according to **Open Graph (OG)** standards for social media compatibility.

---

## Deployment URLs (Staging/Production)

- **Strapi Cloud (Backend)**: `https://lively-advice-e5a07e92e2.strapiapp.com`
- **Strapi Cloud Admin**: `https://lively-advice-e5a07e92e2.strapiapp.com/admin`
- **Railway (Frontend Staging)**: `https://crunch.chipsxp.com`
- **Production Domain**: `https://chipsxp.com` (Target)

---

## Infrastructure Notes

- **Hybrid Setup**: Strapi Cloud (Backend) + Railway (Frontend Staging) + LiteSpeed (Production).
- **Railway Deployment**: Triggered manually via CLI (`railway up`) from the `react/` directory to bypass automatic GitHub hooks during testing phases.
- **Strapi Cloud Deployment**: Triggered via CLI (`npx strapi deploy`) or via GitHub connection to the `worktree-HashBrownHub` branch.


