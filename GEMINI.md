# Gemini Instructions — Strapi-Click-Frame

## 🚀 MANDATORY: Before Starting Work
**Every agent session MUST begin by reading the files in `docs/project_notes/`.** These files contain the ground truth for architecture, decisions, and current state. Never proceed with coding without confirming the latest technical requirements from `key_facts.md` and `decisions.md`.

## Project Memory

This project maintains institutional knowledge in `docs/project_notes/`. Always read these files before proposing changes or solutions.

| File | Contents |
|---|---|
| `docs/project_notes/bugs.md` | Known bugs with root causes, solutions, and prevention notes |
| `docs/project_notes/decisions.md` | Architectural Decision Records (ADRs) |
| `docs/project_notes/key_facts.md` | Versions, ports, REST endpoints, env vars, critical file map |
| `docs/project_notes/issues.md` | Work log of completed tasks |

### Protocols

- Search `bugs.md` before proposing a fix for any error
- Check `decisions.md` before recommending an architectural approach
- Update the appropriate memory file after completing work
- Check `key_facts.md` before assuming default values for config, ports, or package versions

---

## Project Overview

**Type**: Two-project monorepo

| Project | Location | Tech | URL |
|---|---|---|---|
| Backend | `/` (root) | Strapi 5, SQLite | `http://localhost:1337` |
| Frontend | `react/` | Astro 6 | `http://localhost:4321` |

## Critical Known Issues

### Strapi Single Types Require a Custom Loader
`about` and `global` are Strapi single types. They must use the `strapiSingleLoader` function defined in `react/src/content.config.ts`. Do NOT use `strapiLoader()` for them — it pluralizes the endpoint and causes a 404.

### `strapi-community-astro-loader` Version
Must be v4.0.0+ (installed in root `package.json`). v2 causes TypeScript errors with Astro 6.

### `baseURL` Must Include `/api`
```typescript
clientConfig: { baseURL: `${strapiUrl}/api` }
```
The env var `STRAPI_URL=http://localhost:1337` does not include `/api`.

### `categories` Needs Explicit Plural
```typescript
strapiLoader({ contentType: "category", pluralContentType: "categories", ... })
```

### `env.d.ts` Must Exist
`react/src/env.d.ts` must contain `/// <reference types="astro/client" />` or TypeScript cannot resolve `astro:content`.

## Commands

```bash
# From repo root
npm run dev           # Strapi backend with autoreload
npm run seed:example  # Import example data into Strapi

# From react/
npm run dev           # Astro dev server
npm run build         # Build static site
```

## Content Types

| Type | Kind | REST Endpoint | Loader |
|---|---|---|---|
| `article` | Collection | `/api/articles` | `strapiLoader` |
| `author` | Collection | `/api/authors` | `strapiLoader` |
| `category` | Collection | `/api/categories` | `strapiLoader` (needs `pluralContentType`) |
| `about` | Single | `/api/about` | `strapiSingleLoader` |
| `global` | Single | `/api/global` | `strapiSingleLoader` |
