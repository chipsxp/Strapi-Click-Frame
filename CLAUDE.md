# Claude Instructions — Strapi-Click-Frame

## 🚀 MANDATORY: Before Starting Work
**Every agent session MUST begin by reading the files in `docs/project_notes/`.** These files contain the ground truth for architecture, decisions, and current state. Never proceed with coding without confirming the latest technical requirements from `docs/project_notes/key_facts.md` and `docs/project_notes/decisions.md`.

## Commands

### Strapi backend (repository root)

```bash
npm run dev          # start Strapi in development mode (with autoreload)
npm run build        # build the Strapi admin panel
npm run start        # start Strapi without autoreload (production)
npm run console      # open the Strapi interactive console
npm run seed:example # import example content from data/data.json and data/uploads/
```

### Astro frontend (`react/`)

```bash
cd react
npm run dev      # start Astro dev server (localhost:4321)
npm run build    # build static site
npm run preview  # preview the build locally
```

There are no test or lint scripts configured in either package.

## Architecture

The repo is a two-project monorepo:

- **Root** — Strapi 5 backend. Source code lives in `src/` and `config/`. Runs on `http://localhost:1337`.
- **`react/`** — Astro 6 frontend with its own `package.json`. Currently a minimal starter; not yet wired to the backend. The `strapi-community-astro-loader` package is installed at the root (not in `react/`) and will be used to connect them.

### Strapi backend internals

`config/*.ts` holds runtime configuration. Notable defaults:
- `config/database.ts` — SQLite at `.tmp/data.db` by default; env vars switch to Postgres/MySQL.
- `config/api.ts` — REST pagination: `defaultLimit: 25`, `maxLimit: 100`, `withCount: true`.
- `config/plugins.ts` — currently empty.

Content types are defined by `schema.json` files under `src/api/*/content-types/*/`. The domain model:

| Type | Kind | Notes |
|---|---|---|
| `article` | collection | Draft/publish enabled; has `author` (manyToOne), `category` (manyToOne), `cover` (media), and a `blocks` dynamic zone |
| `author` | collection | Has `avatar` media and oneToMany to articles |
| `category` | collection | Has oneToMany to articles |
| `about` | single type | Has a `blocks` dynamic zone |
| `global` | single type | Site settings; includes a `shared.seo` component |

Shared block components in `src/components/shared/`: `shared.media`, `shared.quote`, `shared.rich-text`, `shared.seo`, `shared.slider`.

Controllers, routers, and services under `src/api/*/` are all Strapi factory wrappers (`createCoreController`, `createCoreRouter`, `createCoreService`) with no custom logic. The schemas and config files drive all real behavior.

`src/admin/` contains only `*.example.*` files — there is no active custom admin code.

### Seed system

`scripts/seed.js` reads from `data/data.json` (structured content) and `data/uploads/` (13 media files). It:
1. Imports categories → authors → articles → global → about, in that order.
2. Uploads media files and patches `shared.media.file` / `shared.slider.files` references.
3. Grants public `find`/`findOne` permissions for all content types.

`data/data.json` uses hard-coded relation IDs (authors 1–2, categories 5–9) that depend on import order. If you change seeding order or add records before existing ones, update those IDs consistently.

## Project Memory System

This project maintains institutional knowledge in `docs/project_notes/` for consistency across sessions and tools.

### Memory Files

- **`docs/project_notes/bugs.md`** — Bug log with root causes, solutions, and prevention notes
- **`docs/project_notes/decisions.md`** — Architectural Decision Records (ADRs) with context and trade-offs
- **`docs/project_notes/key_facts.md`** — Project config, versions, ports, endpoints, critical file map
- **`docs/project_notes/issues.md`** — Work log of completed tasks and fixes

### Memory-Aware Protocols

**Before proposing architectural changes:** Check `decisions.md` for existing ADRs. If the proposal conflicts with a past decision, acknowledge it and explain why revisiting is warranted.

**When encountering errors:** Search `bugs.md` first. Apply known solutions if found. Document new bugs and solutions after resolving them.

**When looking up config:** Check `key_facts.md` for versions, endpoints, env vars, and file locations before assuming defaults.

**When completing work:** Add an entry to `issues.md`. Add bugs to `bugs.md`, architecture choices to `decisions.md`, and config changes to `key_facts.md`.

**Use `/log-memory` command** to quickly append a new entry to any memory file.

## Key conventions

- **Schema-first**: change `src/api/**/schema.json` and `src/components/shared/*.json` before writing custom controller/service logic.
- **`article` is the only content type with `draftAndPublish: true`**. The seed script sets `publishedAt` explicitly so imported articles are published.
- **Dynamic-zone `__component` identifiers** (`shared.media`, `shared.quote`, `shared.rich-text`, `shared.slider`) must stay stable when editing seed data or serialized content.
- **Source of truth directories**: `src/`, `config/`, `scripts/`, `data/`, `react/src/`. Do not edit `dist/`, `.tmp/`, or `node_modules/`.
- Root `tsconfig.json` includes `src/**/*.json` (so schema files are in scope) and excludes `src/admin/`, tests, and `src/plugins/`.
