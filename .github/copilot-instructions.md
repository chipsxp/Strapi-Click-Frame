# GitHub Copilot Instructions — Strapi-Click-Frame

## 🚀 MANDATORY: Before Starting Work
**Every agent session MUST begin by reading the files in `docs/project_notes/`.** These files contain the ground truth for architecture, decisions, and current state. Never proceed with generating code without confirming the latest technical requirements from `docs/project_notes/key_facts.md` and `docs/project_notes/decisions.md`.

## Project Memory

This project maintains institutional knowledge in `docs/project_notes/`. Read these before generating code that touches the areas they cover.

- `docs/project_notes/bugs.md` — Known bugs and verified solutions
- `docs/project_notes/decisions.md` — Architecture choices and their rationale
- `docs/project_notes/key_facts.md` — Versions, endpoints, file locations
- `docs/project_notes/issues.md` — Work history

---

## Project Structure

```
/ (root)         — Strapi 5 backend (http://localhost:1337)
  src/api/       — Content type schemas and Strapi factories
  config/        — Runtime config (database, plugins, API)
  scripts/       — seed.js for importing example data
  data/          — Seed data (data.json + uploads/)

react/           — Astro 6 frontend (http://localhost:4321)
  src/
    content.config.ts  — Content collections + Zod schemas
    env.d.ts           — /// <reference types="astro/client" />
    pages/             — index.astro, blog/[slug].astro
    components/        — BlockRenderer.astro
```

---

## Strapi Content Collections (Astro)

File: `react/src/content.config.ts`

```typescript
// Collection types → use strapiLoader
import { strapiLoader } from "strapi-community-astro-loader";
// Single types → use custom strapiSingleLoader (defined in the same file)

// REQUIRED: baseURL must include /api
clientConfig: { baseURL: `${strapiUrl}/api` }

// REQUIRED: categories has an irregular plural
strapiLoader({ contentType: "category", pluralContentType: "categories", ... })

// REQUIRED: single types (about, global) use strapiSingleLoader, NOT strapiLoader
// strapiLoader calls @strapi/client's collection() which paginates → 404 on single types
```

---

## Critical Rules

1. **Never pass `about` or `global` to `strapiLoader()`** — they are Strapi single types with singular REST endpoints (`/api/about`, `/api/global`). Use `strapiSingleLoader`.

2. **`strapi-community-astro-loader` must be v4.0.0+** — v2 is incompatible with Astro 6 types.

3. **`baseURL` always includes `/api`** — `http://localhost:1337/api`, not `http://localhost:1337`.

4. **`react/src/env.d.ts` must not be deleted** — it provides `/// <reference types="astro/client" />` so TypeScript resolves `astro:content` before `astro dev` generates `.astro/types.d.ts`.

5. **`strapi-community-astro-loader` is in root `node_modules/`** — not in `react/node_modules/`. Do not add it to `react/package.json`; Node resolves it from the parent directory.

6. **Schema-first development** — change `src/api/**/schema.json` before writing controller/service logic.

---

## Key Versions

- Strapi: 5.43.0
- Astro: ^6.1.9
- `strapi-community-astro-loader`: ^4.0.0
- Node: >=20.0.0 <=24.x.x
