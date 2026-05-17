# Strapi 5.3+ RAG-Optimized Documentation
## For LLM Coder Agents - Astro 6 + Strapi 5.3+ TypeScript Projects

---

**Document Metadata:**
- **Version**: Strapi 5.3+
- **Target Stack**: Astro 6, TypeScript, Clean Architecture
- **Use Case**: RAG for LLM Coder Agents (3 agents)
- **Last Updated**: April 2026
- **Source**: https://docs.strapi.io, https://docs-v4.strapi.io
- **Optimization**: Semantic search, problem/solution patterns, cross-references

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Core Architecture Changes v4→v5](#core-architecture-changes-v4v5)
3. [Document Service API](#document-service-api)
4. [REST API Reference](#rest-api-reference)
5. [Backend Customization](#backend-customization)
6. [Authentication & Users](#authentication--users)
7. [Content Modeling](#content-modeling)
8. [Plugin Development](#plugin-development)
9. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
10. [Migration Guide v4→v5](#migration-guide-v4v5)
11. [Performance Optimization](#performance-optimization)
12. [Security Best Practices](#security-best-practices)

---

## Quick Reference {#quick-reference}

**RAG Tags**: `#quickstart` `#reference` `#api` `#typescript`

### Essential Commands

```bash
# Create new Strapi 5 project
npx create-strapi-app@latest my-project --quickstart

# Start development server
npm run develop

# Build admin panel
npm run build

# Start production server
npm run start

# Generate TypeScript types
npm run strapi ts:generate-types

# Run upgrade tool
npx @strapi/upgrade latest

# List available codemods
npx @strapi/upgrade codemods ls
```

### Key Version Changes

| Feature | Strapi v4 | Strapi v5 | Impact Level |
|---------|-----------|-----------|--------------|
| API Response Format | Nested `{ data: { attributes: {} } }` | Flattened `{ data: {} }` | 🔴 Critical |
| Entity Service | Primary API | Deprecated | 🔴 Critical |
| Document Service | N/A | Primary API | 🔴 Critical |
| ID Field | `id` | `documentId` | 🔴 Critical |
| Draft & Publish | Single tab | Dual tabs (draft/published) | 🟡 Moderate |
| i18n | Plugin | Core feature | 🟡 Moderate |
| Bundler | Webpack | Vite | 🟡 Moderate |
| React Router | v5 | v6 | 🟡 Moderate |

### Environment Variables Template

```env
# Server Configuration
HOST=0.0.0.0
PORT=1337
APP_KEYS=toBeModified1,toBeModified2
API_TOKEN_SALT=toBeModified
ADMIN_JWT_SECRET=toBeModified
JWT_SECRET=toBeModified
TRANSFER_TOKEN_SALT=toBeModified

# Database Configuration
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi

# Optional: External Services
STRAPI_TELEMETRY_DISABLED=true
NODE_ENV=development
```

---

## Core Architecture Changes v4→v5 {#core-architecture-changes-v4v5}

**RAG Tags**: `#migration` `#breaking-changes` `#architecture` `#v5`

### ⚠️ CRITICAL: Response Format Change

**Problem**: Strapi 5 uses a flattened response format, breaking all v4 API consumers.

**v4 Response**:
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "title": "Article",
      "content": "..."
    }
  }
}
```

**v5 Response**:
```json
{
  "data": {
    "documentId": "abc123",
    "title": "Article",
    "content": "..."
  }
}
```

**Solution**: Update all API consumers to:
1. Use `documentId` instead of `id`
2. Access fields directly, not through `attributes`
3. Update TypeScript interfaces accordingly

**Code Migration Example**:
```typescript
// ❌ Strapi v4
interface Article {
  id: number;
  attributes: {
    title: string;
    content: string;
  };
}

// ✅ Strapi v5
interface Article {
  documentId: string;
  title: string;
  content: string;
}
```

**Cross-Reference**: See [REST API Reference](#rest-api-reference) for detailed API changes.

---

### ⚠️ CRITICAL: Entity Service → Document Service

**Problem**: Entity Service API is deprecated. All code using `strapi.entityService` must migrate.

**v4 Pattern**:
```javascript
// ❌ Strapi v4
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: { published: true },
  populate: ['author']
});
```

**v5 Pattern**:
```javascript
// ✅ Strapi v5
const entries = await strapi.documents('api::article.article').findMany({
  filters: { published: true },
  populate: ['author']
});
```

**Key Differences**:
| Method | v4 Entity Service | v5 Document Service |
|--------|------------------|---------------------|
| Find | `findMany()` | `findMany()` |
| Find One | `findOne()` | `findOne()` |
| Create | `create()` | `create()` |
| Update | `update()` | `update()` |
| Delete | `delete()` | `delete()` |
| Count | `count()` | ❌ Not available |
| Find Page | `findPage()` | ❌ Not available |

**Migration Codemod**:
```bash
npx @strapi/upgrade codemods run entity-service-to-document-service
```

**Cross-Reference**: See [Document Service API](#document-service-api) for complete API reference.

---

### ⚠️ CRITICAL: documentId vs id

**Problem**: Strapi 5 introduces `documentId` for content addressing. The `id` field still exists but should not be used for API calls.

**When to Use documentId**:
- ✅ API requests (REST, GraphQL)
- ✅ Content relationships
- ✅ Webhook payloads
- ✅ Frontend references

**When id Still Exists**:
- Database primary key (internal)
- Some admin panel operations
- Legacy compatibility

**Best Practice**:
```typescript
// ✅ Always use documentId in your code
interface Content {
  documentId: string;  // Use this
  id?: number;         // Ignore this
}

// API calls
await strapi.documents('api::article.article').findOne({
  documentId: 'abc123'  // ✅ Correct
});

// ❌ Don't do this
await strapi.documents('api::article.article').findOne({
  id: 1  // Wrong approach
});
```

---

### Database Changes

**Breaking Changes**:
1. **MySQL 5 Unsupported**: Must use MySQL 8+ or MariaDB 10.3+
2. **SQLite Driver**: Only `better-sqlite3` supported (not `sqlite3`)
3. **MySQL Driver**: Only `mysql2` supported (not `mysql`)
4. **Identifier Length**: Identifiers >55 chars automatically shortened
5. **Feature Columns**: All content types now have feature columns

**Migration Action**:
```javascript
// config/database.ts
export default {
  connection: {
    client: 'postgres', // or 'mysql', 'sqlite'
    connection: {
      // MySQL 8+ required
      host: env('DATABASE_HOST', 'localhost'),
      port: env('DATABASE_PORT', 3306),
      database: env('DATABASE_NAME', 'strapi'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD', 'strapi'),
    },
  },
};
```

---

### Dependencies Changes

| Package | v4 Version | v5 Version | Action Required |
|---------|-----------|-----------|-----------------|
| react-router-dom | v5 | v6 | ✅ Codemod available |
| koa-body | v4 | v6 | Manual update |
| apollo-server | v3 | v4 | Manual update |
| webpack | Default | Replaced by Vite | Manual migration |

**Vite Migration**:
```javascript
// webpack.config.js → Remove
// vite.config.ts → Create if custom config needed

// Most projects don't need custom Vite config
// Admin builds automatically with Vite
```

---

## Document Service API {#document-service-api}

**RAG Tags**: `#api` `#document-service` `#core` `#typescript`

### Overview

The Document Service API is the primary interface for content operations in Strapi 5. It replaces the Entity Service and provides better Draft & Publish integration.

### Basic Operations

#### Find Many Documents

```typescript
// Basic query
const articles = await strapi.documents('api::article.article').findMany({
  filters: { published: true },
  fields: ['title', 'slug', 'publishedAt'],
  populate: ['author', 'cover'],
  sort: { publishedAt: 'desc' },
  pagination: { page: 1, pageSize: 10 }
});

// With locale (i18n)
const articles = await strapi.documents('api::article.article').findMany({
  locale: 'en',  // or 'es', 'fr', etc.
  status: 'published'  // 'draft' | 'published'
});
```

**Parameters**:
- `filters`: Object with field conditions
- `fields`: Array of fields to return
- `populate`: Array of relations to include
- `sort`: Object or string for ordering
- `pagination`: `{ page, pageSize }` or `{ start, limit }`
- `locale`: Locale code (i18n)
- `status`: 'draft' | 'published'

**Common Filter Operators**:
```typescript
filters: {
  title: { $contains: 'strapi' },
  publishedAt: { $gte: '2024-01-01' },
  status: { $in: ['published', 'review'] },
  author: { name: { $contains: 'John' } }
}
```

---

#### Find One Document

```typescript
const article = await strapi.documents('api::article.article').findOne({
  documentId: 'abc123',
  populate: ['author', 'categories'],
  fields: ['title', 'content', 'slug']
});
```

**Error Handling**:
```typescript
try {
  const article = await strapi.documents('api::article.article').findOne({
    documentId: 'nonexistent'
  });
  
  if (!article) {
    throw new NotFoundError('Article not found');
  }
} catch (error) {
  if (error instanceof NotFoundError) {
    return ctx.notFound('Article not found');
  }
  throw error;
}
```

---

#### Create Document

```typescript
const article = await strapi.documents('api::article.article').create({
  data: {
    title: 'My Article',
    content: 'Article content here',
    slug: 'my-article',
    published: true
  },
  locale: 'en'  // Optional, defaults to default locale
});
```

**With Relations**:
```typescript
const article = await strapi.documents('api::article.article').create({
  data: {
    title: 'My Article',
    author: {
      connect: ['author-document-id']  // Use connect for relations
    },
    categories: {
      connect: ['cat1', 'cat2']
    }
  }
});
```

---

#### Update Document

```typescript
const article = await strapi.documents('api::article.article').update({
  documentId: 'abc123',
  data: {
    title: 'Updated Title',
    content: 'Updated content'
  }
});
```

**⚠️ WARNING: Repeatable Components**

Do NOT update repeatable components directly with Document Service API. Use dedicated component endpoints or recreate the entire component array.

```typescript
// ❌ Don't do this - can cause data loss
await strapi.documents('api::article.article').update({
  documentId: 'abc123',
  data: {
    blocks: [{ id: 1, text: 'updated' }]  // May lose other blocks
  }
});

// ✅ Do this instead - replace entire array
const existing = await strapi.documents('api::article.article').findOne({
  documentId: 'abc123',
  populate: ['blocks']
});

await strapi.documents('api::article.article').update({
  documentId: 'abc123',
  data: {
    blocks: [...existing.blocks, { text: 'new block' }]
  }
});
```

---

#### Delete Document

```typescript
await strapi.documents('api::article.article').delete({
  documentId: 'abc123'
});

// Delete with filters (multiple)
await strapi.documents('api::article.article').deleteMany({
  filters: { published: false }
});
```

---

### Advanced Features

#### Status (Draft & Publish)

```typescript
// Get draft version
const draft = await strapi.documents('api::article.article').findOne({
  documentId: 'abc123',
  status: 'draft'
});

// Get published version
const published = await strapi.documents('api::article.article').findOne({
  documentId: 'abc123',
  status: 'published'
});

// Publish a draft
await strapi.documents('api::article.article').publish({
  documentId: 'abc123'
});

// Unpublish
await strapi.documents('api::article.article').unpublish({
  documentId: 'abc123'
});
```

---

#### Locale (Internationalization)

```typescript
// Create in specific locale
await strapi.documents('api::article.article').create({
  data: { title: 'English Article' },
  locale: 'en'
});

// Get all locales for a document
const allLocales = await strapi.documents('api::article.article').findMany({
  filters: {
    documentId: 'abc123'  // Same documentId across locales
  }
});

// Update specific locale
await strapi.documents('api::article.article').update({
  documentId: 'abc123',
  locale: 'es',
  data: { title: 'Artículo en Español' }
});
```

---

#### Population Strategies

**Simple Population**:
```typescript
populate: ['author', 'categories']
```

**Nested Population**:
```typescript
populate: {
  author: {
    populate: ['avatar']
  },
  categories: true
}
```

**Conditional Population**:
```typescript
populate: {
  cover: {
    fields: ['url', 'alternativeText'],
    populate: {
      formats: {
        fields: ['url', 'width', 'height']
      }
    }
  }
}
```

**⚠️ Components & Dynamic Zones**:
Must use detailed population strategy (no shared strategy in v5):

```typescript
// ✅ Correct
populate: {
  blocks: {
    on: {
      'text.block': {
        populate: ['content']
      },
      'image.block': {
        populate: ['image']
      }
    }
  }
}

// ❌ Wrong - won't populate dynamic zones properly
populate: ['blocks']
```

---

### Middleware Extension

```typescript
// src/index.ts
export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.documents.use(async (ctx, next) => {
      console.log(`Document operation: ${ctx.action}`);
      await next();
      console.log(`Operation completed for: ${ctx.contentType}`);
    });
  }
};
```

**Available Middleware Context**:
- `ctx.action`: 'findMany' | 'findOne' | 'create' | 'update' | 'delete'
- `ctx.contentType`: Content type UID
- `ctx.params`: Operation parameters
- `ctx.result`: Operation result (after next())

---

### Common Patterns

#### Soft Delete Pattern

```typescript
// Add deletedAt field to schema
// Then filter in queries
const articles = await strapi.documents('api::article.article').findMany({
  filters: {
    deletedAt: { $null: true }
  }
});
```

#### Audit Logging

```typescript
strapi.documents.use(async (ctx, next) => {
  const startTime = Date.now();
  await next();
  const duration = Date.now() - startTime;
  
  // Log to audit system
  await strapi.service('api::audit-log.audit-log').create({
    data: {
      action: ctx.action,
      contentType: ctx.contentType,
      duration,
      user: ctx.state?.user?.id
    }
  });
});
```

#### Cache Layer

```typescript
const cache = new Map();

strapi.documents.use(async (ctx, next) => {
  if (ctx.action === 'findMany' || ctx.action === 'findOne') {
    const cacheKey = `${ctx.contentType}:${JSON.stringify(ctx.params)}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      ctx.result = cached;
      return;
    }
    
    await next();
    cache.set(cacheKey, ctx.result);
    
    // Clear cache on mutations
  } else {
    await next();
    cache.clear();  // Or selective clearing
  }
});
```

---

## REST API Reference {#rest-api-reference}

**RAG Tags**: `#api` `#rest` `#http` `#endpoints`

### Base URL Structure

```
http://localhost:1337/api/{content-type}
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{content-type}` | Get collection |
| GET | `/api/{content-type}/{documentId}` | Get single entry |
| POST | `/api/{content-type}` | Create entry |
| PUT | `/api/{content-type}/{documentId}` | Update entry |
| DELETE | `/api/{content-type}/{documentId}` | Delete entry |

### Query Parameters

#### Filters

```bash
# Equality
GET /api/articles?filters[title][$eq]=My Article

# Contains
GET /api/articles?filters[title][$contains]=strapi

# Greater than
GET /api/articles?filters[publishedAt][$gte]=2024-01-01

# In array
GET /api/articles?filters[status][$in][0]=published&filters[status][$in][1]=review

# Nested filters
GET /api/articles?filters[author][name][$contains]=John
```

#### Population

```bash
# Simple
GET /api/articles?populate=author

# Multiple
GET /api/articles?populate=author&populate=categories

# Nested
GET /api/articles?populate[author][populate]=avatar

# Dynamic zones
GET /api/articles?populate[blocks][on][text.block][populate]=content
```

#### Fields

```bash
# Select specific fields
GET /api/articles?fields=title&fields=slug&fields=publishedAt
```

#### Sort

```bash
# Single field
GET /api/articles?sort=publishedAt

# Multiple fields
GET /api/articles?sort=publishedAt:desc&sort=title:asc

# Nested
GET /api/articles?sort[author][name]=asc
```

#### Pagination

```bash
# Page-based
GET /api/articles?pagination[page]=2&pagination[pageSize]=10

# Offset-based
GET /api/articles?pagination[start]=0&pagination[limit]=10
```

#### Locale

```bash
# Get specific locale
GET /api/articles?locale=en

# Get all locales
GET /api/articles?locale=*
```

#### Status

```bash
# Get published only
GET /api/articles?status=published

# Get draft only
GET /api/articles?status=draft
```

### Response Format

**Collection**:
```json
{
  "data": [
    {
      "documentId": "abc123",
      "title": "Article",
      "content": "...",
      "publishedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "pageCount": 5,
      "total": 50
    }
  }
}
```

**Single Entry**:
```json
{
  "data": {
    "documentId": "abc123",
    "title": "Article",
    "content": "...",
    "publishedAt": "2024-01-01T00:00:00.000Z"
  },
  "meta": {}
}
```

---

### ⚠️ Common API Issues

#### Issue: 400 Bad Request - Invalid Populate

**Problem**: Dynamic zones not populating correctly.

**Solution**: Use detailed population strategy:
```bash
# ❌ Wrong
GET /api/pages?populate=blocks

# ✅ Correct
GET /api/pages?populate[blocks][on][hero.section][populate]=image&populate[blocks][on][text.section][populate]=content
```

---

#### Issue: 401 Unauthorized - API Token

**Problem**: API token doesn't have required permissions.

**Solution**:
1. Go to Settings → API Tokens
2. Create/Edit token
3. Grant permissions for specific content types
4. Use token in header: `Authorization: Bearer {token}`

---

#### Issue: 404 Not Found - documentId

**Problem**: Using `id` instead of `documentId` in API calls.

**Solution**: Always use `documentId` from the response data:
```typescript
// Get documentId from creation response
const { data } = await createArticle();
const documentId = data.documentId;  // ✅

// Use in subsequent calls
await fetch(`/api/articles/${documentId}`);
```

---

## Backend Customization {#backend-customization}

**RAG Tags**: `#backend` `#controllers` `#services` `#middleware`

### Controllers

**Basic Controller**:
```typescript
// src/api/article/controllers/article.ts
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::article.article', ({ strapi }) => ({
  async customAction(ctx) {
    try {
      const { documentId } = ctx.params;
      const article = await strapi.documents('api::article.article').findOne({
        documentId,
        populate: ['author']
      });
      
      return { data: article };
    } catch (error) {
      ctx.throw(500, 'Internal server error');
    }
  }
}));
```

**Extend Core Controller**:
```typescript
export default factories.createCoreController('api::article.article', ({ strapi }) => ({
  // Override find
  async find(ctx) {
    const { data, meta } = await super.find(ctx);
    
    // Add custom logic
    const enhanced = data.map(article => ({
      ...article,
      readingTime: calculateReadingTime(article.content)
    }));
    
    return { data: enhanced, meta };
  },
  
  // Custom action
  async featured(ctx) {
    const articles = await strapi.documents('api::article.article').findMany({
      filters: { featured: true },
      limit: 5
    });
    
    return { data: articles };
  }
}));
```

---

### Services

**Basic Service**:
```typescript
// src/api/article/services/article.ts
import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::article.article');
```

**Custom Service**:
```typescript
import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::article.article', ({ strapi }) => ({
  async getFeaturedArticles(limit = 5) {
    return await strapi.documents('api::article.article').findMany({
      filters: { featured: true, publishedAt: { $lte: new Date() } },
      sort: { publishedAt: 'desc' },
      limit
    });
  },
  
  async getRelatedArticles(documentId: string, limit = 3) {
    const article = await strapi.documents('api::article.article').findOne({
      documentId,
      populate: ['categories']
    });
    
    if (!article) return [];
    
    const categoryIds = article.categories.map(c => c.documentId);
    
    return await strapi.documents('api::article.article').findMany({
      filters: {
        categories: { documentId: { $in: categoryIds } },
        documentId: { $ne: documentId }
      },
      limit
    });
  }
}));
```

---

### Routes

**Custom Routes**:
```typescript
// src/api/article/routes/article.ts
export default {
  routes: [
    {
      method: 'GET',
      path: '/articles/featured',
      handler: 'article.featured',
      config: {
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/articles/:documentId/related',
      handler: 'article.related',
      config: {
        policies: ['global::is-authenticated']
      }
    }
  ]
};
```

---

### Middlewares

**Global Middleware**:
```typescript
// src/middlewares/timing.ts
export default (config, { strapi }) => {
  return async (ctx, next) => {
    const start = Date.now();
    await next();
    const delta = Date.now() - start;
    
    ctx.set('X-Response-Time', `${delta}ms`);
    strapi.log.info(`${ctx.method} ${ctx.url} - ${delta}ms`);
  };
};
```

**Register Middleware**:
```typescript
// config/middlewares.ts
export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  'global::timing'  // Custom middleware
];
```

---

### Policies

**Custom Policy**:
```typescript
// src/policies/is-owner.ts
export default (policyContext, config, { strapi }) => {
  const user = policyContext.state.user;
  const { documentId } = policyContext.params;
  
  if (!user) {
    return false;
  }
  
  // Check if user owns the resource
  // Implementation depends on your data model
  
  return true;
};
```

**Apply Policy**:
```typescript
// In routes
{
  method: 'DELETE',
  path: '/articles/:documentId',
  handler: 'article.delete',
  config: {
    policies: ['global::is-owner']
  }
}
```

---

## Authentication & Users {#authentication--users}

**RAG Tags**: `#authentication` `#users` `#security` `#jwt`

### User Authentication Flow

**Register User**:
```typescript
POST /api/auth/local/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Login**:
```typescript
POST /api/auth/local
Content-Type: application/json

{
  "identifier": "john@example.com",
  "password": "securePassword123"
}

// Response
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Use JWT Token**:
```typescript
GET /api/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Protected Routes

**Create Policy**:
```typescript
// src/policies/is-authenticated.ts
export default (policyContext, config, { strapi }) => {
  if (!policyContext.state.user) {
    return false;
  }
  return true;
};
```

**Apply to Routes**:
```typescript
// src/api/article/routes/article.ts
{
  method: 'POST',
  path: '/articles',
  handler: 'article.create',
  config: {
    policies: ['global::is-authenticated']
  }
}
```

---

### Role-Based Access Control (RBAC)

**Default Roles**:
- Public: Unauthenticated users
- Authenticated: All registered users
- Author: Can create content
- Editor: Can edit all content
- Admin: Full access

**Custom Role Creation**:
```typescript
// In Admin Panel: Settings → Roles → Create New Role
// Assign permissions per content type
// Assign to users
```

---

### ⚠️ Common Authentication Issues

#### Issue: JWT Token Expired

**Problem**: Token expires after default 30 days.

**Solution**: Configure token expiration:
```typescript
// config/plugins.ts
export default {
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d'  // 7 days
      }
    }
  }
};
```

**Handle Expiration on Client**:
```typescript
// Astro client-side
async function fetchWithAuth(url: string, options = {}) {
  let token = localStorage.getItem('jwt');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 401) {
    // Token expired, refresh or redirect to login
    localStorage.removeItem('jwt');
    window.location.href = '/login';
  }
  
  return response;
}
```

---

#### Issue: CORS Errors

**Problem**: Frontend can't connect to Strapi API.

**Solution**: Configure CORS:
```typescript
// config/middlewares.ts
export default [
  // ... other middlewares
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      header: '*',
      expose: ['WWW-Authenticate', 'Server-Authorization'],
      maxAge: 600000,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      origin: ['http://localhost:4321', 'https://yourdomain.com']
    }
  }
];
```

---

## Content Modeling {#content-modeling}

**RAG Tags**: `#content-types` `#schema` `#modeling` `#database`

### Collection Types vs Single Types

**Collection Type**: Multiple entries (e.g., Articles, Products)
```typescript
// schema.json
{
  "kind": "collectionType",
  "collectionName": "articles",
  "info": {
    "singularName": "article",
    "pluralName": "articles",
    "displayName": "Article"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "title": { "type": "string" },
    "content": { "type": "richtext" },
    "slug": { "type": "uid", "targetField": "title" }
  }
}
```

**Single Type**: One entry (e.g., Homepage, Settings)
```typescript
{
  "kind": "singleType",
  "collectionName": "homepage",
  "info": {
    "singularName": "homepage",
    "displayName": "Homepage"
  },
  "attributes": {
    "title": { "type": "string" },
    "heroImage": { "type": "media", "multiple": false }
  }
}
```

---

### Field Types

| Type | Description | Example |
|------|-------------|---------|
| `string` | Short text | Title, Name |
| `text` | Long text | Description |
| `richtext` | Markdown/HTML | Article content |
| `number` | Integer/Float | Price, Count |
| `boolean` | True/False | Published, Active |
| `email` | Email address | User email |
| `date` | Date | Birth date |
| `datetime` | Date + Time | Created at |
| `time` | Time | Opening hours |
| `password` | Encrypted | User password |
| `enumeration` | Dropdown | Status, Category |
| `media` | File upload | Images, Videos |
| `json` | JSON object | Config data |
| `uid` | Unique ID | Slug (auto-generated) |
| `component` | Reusable block | Hero, CTA |
| `dynamiczone` | Flexible blocks | Page sections |
| `relation` | Link to content | Author, Category |

---

### Components

**Reusable Component**:
```typescript
// components/common/seo.json
{
  "collectionName": "components_common_seos",
  "info": {
    "displayName": "SEO",
    "icon": "search"
  },
  "options": {},
  "attributes": {
    "metaTitle": { "type": "string" },
    "metaDescription": { "type": "text" },
    "metaImage": { "type": "media", "multiple": false }
  }
}
```

**Use in Content Type**:
```typescript
// In article schema
"seo": {
  "type": "component",
  "repeatable": false,
  "component": "common.seo"
}
```

---

### Dynamic Zones

**Flexible Content Blocks**:
```typescript
// In page schema
"blocks": {
  "type": "dynamiczone",
  "components": [
    "blocks.hero",
    "blocks.text",
    "blocks.image",
    "blocks.cta"
  ]
}
```

**Component Examples**:
```typescript
// components/blocks/hero.json
{
  "info": { "displayName": "Hero" },
  "attributes": {
    "title": { "type": "string" },
    "subtitle": { "type": "text" },
    "image": { "type": "media" },
    "ctaLink": { "type": "string" }
  }
}

// components/blocks/text.json
{
  "info": { "displayName": "Text" },
  "attributes": {
    "content": { "type": "richtext" }
  }
}
```

---

### Relations

**Relation Types**:
- `oneWay`: A → B (A has one B)
- `oneToOne`: A ↔ B (A has one B, B has one A)
- `oneToMany`: A → B[] (A has many B)
- `manyToOne`: A[] → B (Many A have one B)
- `manyToMany`: A[] ↔ B[] (Many A have many B)
- `manyWay`: A[] (A has many of anything)
- `polymorphic`: A → Any (A relates to any content type)

**Example**:
```typescript
// Article has one Author, Author has many Articles
"author": {
  "type": "relation",
  "relation": "manyToOne",
  "target": "api::author.author",
  "inversedBy": "articles"
}

// Article has many Categories, Category has many Articles
"categories": {
  "type": "relation",
  "relation": "manyToMany",
  "target": "api::category.category",
  "mappedBy": "articles"
}
```

---

## Plugin Development {#plugin-development}

**RAG Tags**: `#plugins` `#extension` `#customization` `#api`

### Plugin Structure

```
my-plugin/
├── admin/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── index.js
├── server/
│   ├── config/
│   ├── content-types/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   └── index.js
├── package.json
├── strapi-admin.js
└── strapi-server.js
```

---

### Server Entry Point

```typescript
// server/index.ts
export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    // Register content types, hooks, etc.
  },
  
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Run logic after Strapi is initialized
  },
  
  destroy({ strapi }: { strapi: Core.Strapi }) {
    // Cleanup on shutdown
  }
};
```

---

### Create Plugin with CLI

```bash
npx @strapi/plugin-cli@latest create my-plugin

# Link to project
cd my-plugin
npm run watch:link

# In Strapi project
npm link ./path/to/my-plugin
```

---

### Admin Panel Extension

**Add Menu Link**:
```typescript
// admin/src/index.ts
export default {
  register(app) {
    app.registerPlugin({
      id: 'my-plugin',
      name: 'My Plugin'
    });
  },
  
  bootstrap(app) {
    app.addMenuLink({
      to: '/plugins/my-plugin',
      icon: 'star',
      label: {
        id: 'my-plugin.menu.label',
        defaultMessage: 'My Plugin'
      },
      Component: () => null
    });
  }
};
```

---

## Common Pitfalls & Solutions {#common-pitfalls--solutions}

**RAG Tags**: `#troubleshooting` `#errors` `#solutions` `#debugging`

### ⚠️ Pitfall 1: Using v4 API Patterns in v5

**Problem**: Code written for Strapi v4 doesn't work in v5.

**Symptoms**:
- `Cannot read properties of undefined (reading 'attributes')`
- `id is not defined`
- API responses don't match expected structure

**Solution**:
```typescript
// ❌ v4 Pattern
const article = await strapi.entityService.findOne('api::article.article', id, {
  populate: ['author']
});
const title = article.attributes.title;

// ✅ v5 Pattern
const article = await strapi.documents('api::article.article').findOne({
  documentId: id,
  populate: ['author']
});
const title = article.title;
```

---

### ⚠️ Pitfall 2: Incorrect Dynamic Zone Population

**Problem**: Dynamic zone content not returned in API responses.

**Symptoms**:
- Blocks array is empty
- Only block types returned, no content
- 400 error on complex populate queries

**Solution**: Use detailed population strategy:
```typescript
// ❌ Wrong
populate: ['blocks']

// ✅ Correct
populate: {
  blocks: {
    on: {
      'hero.section': {
        populate: ['image', 'ctaButton']
      },
      'text.section': {
        populate: ['content']
      },
      'image.section': {
        populate: ['image', 'caption']
      }
    }
  }
}
```

---

### ⚠️ Pitfall 3: Repeatable Component Data Loss

**Problem**: Updating repeatable components causes data loss.

**Symptoms**:
- Some blocks disappear after update
- Component order changes unexpectedly
- Duplicate entries created

**Solution**: Always fetch-merge-update pattern:
```typescript
// ❌ Wrong - direct update
await strapi.documents('api::page.page').update({
  documentId: 'abc123',
  data: {
    blocks: [{ id: 1, text: 'updated' }]  // Loses other blocks!
  }
});

// ✅ Correct - fetch-merge-update
const page = await strapi.documents('api::page.page').findOne({
  documentId: 'abc123',
  populate: ['blocks']
});

const updatedBlocks = [
  ...page.blocks.map(b => b.id === 1 ? { ...b, text: 'updated' } : b),
  { text: 'new block' }
];

await strapi.documents('api::page.page').update({
  documentId: 'abc123',
  data: { blocks: updatedBlocks }
});
```

---

### ⚠️ Pitfall 4: Locale Not Propagating

**Problem**: Content not appearing in correct language.

**Symptoms**:
- Default locale content shown instead of requested locale
- Mixed locale content in responses
- i18n fields undefined

**Solution**: Always specify locale explicitly:
```typescript
// ❌ Wrong - relies on default
const articles = await strapi.documents('api::article.article').findMany({
  filters: { published: true }
});

// ✅ Correct - explicit locale
const articles = await strapi.documents('api::article.article').findMany({
  locale: 'en',  // or from request
  filters: { published: true },
  status: 'published'
});
```

---

### ⚠️ Pitfall 5: Missing Permissions for API Token

**Problem**: 401/403 errors on API calls.

**Symptoms**:
- `Forbidden` error on public endpoints
- Token works for some content types, not others
- Admin panel works, API doesn't

**Solution**:
1. Go to Settings → API Tokens
2. Select or create token
3. Grant permissions:
   - ✅ find
   - ✅ findOne
   - ✅ create (if needed)
   - ✅ update (if needed)
   - ✅ delete (if needed)
4. For each content type used
5. Save and regenerate token if needed

---

### ⚠️ Pitfall 6: Database Migration Issues

**Problem**: Schema changes break existing data.

**Symptoms**:
- Server won't start after schema change
- Data missing after migration
- Foreign key constraint errors

**Solution**:
```bash
# Before making schema changes:
# 1. Backup database
pg_dump strapi > backup.sql

# 2. Use migration tool
npx @strapi/upgrade latest

# 3. Review codemods
npx @strapi/upgrade codemods ls

# 4. Run migrations in development first
npm run develop

# 5. Check logs for errors
# 6. Only then deploy to production
```

---

### ⚠️ Pitfall 7: Admin Panel Build Failures

**Problem**: Admin panel won't build after customization.

**Symptoms**:
- `npm run build` fails
- Webpack/Vite errors
- Module not found errors

**Solution**:
```bash
# Clear cache
rm -rf .cache build node_modules/.cache

# Reinstall dependencies
npm ci

# Rebuild admin
npm run build

# If still failing:
# 1. Check for TypeScript errors
npx tsc --noEmit

# 2. Check custom admin code
# 3. Review webpack/vite config if customized
# 4. Check plugin compatibility
```

---

## Migration Guide v4→v5 {#migration-guide-v4v5}

**RAG Tags**: `#migration` `#upgrade` `#v4` `#v5` `#codemods`

### Pre-Migration Checklist

- [ ] Backup database
- [ ] Backup code (git commit)
- [ ] Review breaking changes
- [ ] Test in development environment
- [ ] Update Node.js to LTS version
- [ ] Update npm/yarn to latest
- [ ] Document custom plugins
- [ ] Test all API endpoints

---

### Step-by-Step Migration

#### Step 1: Update Dependencies

```bash
# Update Strapi packages
npm install @strapi/strapi@latest @strapi/plugin-users-permissions@latest @strapi/plugin-i18n@latest @strapi/plugin-upload@latest

# Or use upgrade tool
npx @strapi/upgrade latest
```

#### Step 2: Run Codemods

```bash
# List available codemods
npx @strapi/upgrade codemods ls

# Run all codemods
npx @strapi/upgrade codemods run all

# Or run specific codemods
npx @strapi/upgrade codemods run entity-service-to-document-service
npx @strapi/upgrade codemods run react-router-v5-to-v6
```

#### Step 3: Update Configuration Files

```typescript
// config/database.ts - Update client if needed
export default {
  connection: {
    client: 'postgres',  // or 'mysql', 'sqlite'
    // ... rest of config
  }
};

// config/middlewares.ts - Update order if needed
export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public'
];
```

#### Step 4: Update API Calls

```typescript
// Controllers
// ❌ v4
const entries = await strapi.entityService.findMany('api::article.article', {
  filters: { published: true }
});

// ✅ v5
const entries = await strapi.documents('api::article.article').findMany({
  filters: { published: true }
});

// Response handling
// ❌ v4
return { data: entries.data.map(e => e.attributes) };

// ✅ v5
return { data: entries };
```

#### Step 5: Update TypeScript Types

```typescript
// interfaces/article.ts
// ❌ v4
export interface Article {
  id: number;
  attributes: {
    title: string;
    content: string;
  };
}

// ✅ v5
export interface Article {
  documentId: string;
  title: string;
  content: string;
  publishedAt: string;
}
```

#### Step 6: Test Thoroughly

```bash
# Start development server
npm run develop

# Test all endpoints
# Check admin panel
# Verify data integrity
# Test authentication
# Check file uploads
# Verify webhooks
```

#### Step 7: Deploy

```bash
# Build admin panel
npm run build

# Start production
npm run start

# Monitor logs
# Check performance
# Verify all features
```

---

### Post-Migration Verification

**Checklist**:
- [ ] All content types accessible
- [ ] API responses correct format
- [ ] Authentication working
- [ ] File uploads working
- [ ] Webhooks firing
- [ ] Admin panel functional
- [ ] Plugins working
- [ ] Database queries performant
- [ ] No console errors
- [ ] All tests passing

---

## Performance Optimization {#performance-optimization}

**RAG Tags**: `#performance` `#optimization` `#caching` `#database`

### Database Optimization

**Indexing**:
```typescript
// Add indexes to frequently queried fields
// In content type schema
{
  "attributes": {
    "slug": {
      "type": "uid",
      "targetField": "title",
      "index": true  // Add index
    },
    "publishedAt": {
      "type": "datetime",
      "index": true  // Add index
    }
  }
}
```

**Query Optimization**:
```typescript
// ❌ Bad - N+1 queries
const articles = await strapi.documents('api::article.article').findMany();
for (const article of articles) {
  const author = await strapi.documents('api::author.author').findOne({
    documentId: article.author
  });
}

// ✅ Good - Single query with populate
const articles = await strapi.documents('api::article.article').findMany({
  populate: ['author']
});
```

---

### Caching Strategies

**In-Memory Cache**:
```typescript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;  // 5 minutes

strapi.documents.use(async (ctx, next) => {
  if (ctx.action === 'findMany' || ctx.action === 'findOne') {
    const cacheKey = `${ctx.contentType}:${JSON.stringify(ctx.params)}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      ctx.result = cached.data;
      return;
    }
    
    await next();
    cache.set(cacheKey, {
      data: ctx.result,
      timestamp: Date.now()
    });
  } else {
    await next();
    cache.clear();  // Clear on mutations
  }
});
```

**Redis Cache** (Production):
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getFromCache(key: string) {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

async function setCache(key: string, data: any, ttl = 300) {
  await redis.setex(key, ttl, JSON.stringify(data));
}
```

---

### API Response Optimization

**Field Selection**:
```typescript
// Only return needed fields
const articles = await strapi.documents('api::article.article').findMany({
  fields: ['title', 'slug', 'publishedAt'],  // Reduce payload
  populate: {
    cover: {
      fields: ['url', 'formats']  // Only needed image fields
    }
  }
});
```

**Pagination**:
```typescript
// Always paginate large collections
const articles = await strapi.documents('api::article.article').findMany({
  pagination: {
    page: 1,
    pageSize: 20  // Reasonable page size
  }
});
```

---

### Build Optimization

**Admin Panel**:
```typescript
// config/admin.ts
export default {
  build: {
    backend: {
      // Reduce admin bundle size
      typings: false
    }
  }
};
```

**Production Build**:
```bash
# Build with optimizations
npm run build

# Use PM2 for process management
npm install pm2 -g
pm2 start npm --name "strapi" -- start

# Enable cluster mode for multi-core
pm2 start npm --name "strapi" -i max -- start
```

---

## Security Best Practices {#security-best-practices}

**RAG Tags**: `#security` `#authentication` `#authorization` `#best-practices`

### API Security

**Rate Limiting**:
```typescript
// config/middlewares.ts
{
  name: 'strapi::rateLimit',
  config: {
    enabled: true,
    interval: 60000,  // 1 minute
    max: 100  // 100 requests per minute
  }
}
```

**CORS Configuration**:
```typescript
// config/middlewares.ts
{
  name: 'strapi::cors',
  config: {
    enabled: true,
    origin: ['https://yourdomain.com'],  // Whitelist domains
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    headers: ['Content-Type', 'Authorization']
  }
}
```

---

### Authentication Security

**Strong Password Policy**:
```typescript
// config/plugins.ts
export default {
  'users-permissions': {
    config: {
      email: {
        from: 'noreply@yourdomain.com'
      },
      rateLimit: {
        interval: 60000,
        max: 5  // 5 attempts per minute
      }
    }
  }
};
```

**JWT Security**:
```typescript
// config/plugins.ts
export default {
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',  // Short expiration
        secret: process.env.JWT_SECRET  // Use env variable
      }
    }
  }
};
```

---

### Input Validation

**Sanitize Input**:
```typescript
// In controllers
async create(ctx) {
  const { title, content } = ctx.request.body;
  
  // Validate
  if (!title || title.length > 200) {
    return ctx.badRequest('Title must be between 1-200 characters');
  }
  
  // Sanitize
  const sanitizedTitle = title.trim();
  
  // Proceed with creation
  const entry = await strapi.documents('api::article.article').create({
    data: { title: sanitizedTitle, content }
  });
  
  return { data: entry };
}
```

---

### Environment Variables

**Never Commit Secrets**:
```bash
# .env (add to .gitignore)
DATABASE_PASSWORD=secure_password
JWT_SECRET=super_secret_key
API_TOKEN_SALT=random_salt
ADMIN_JWT_SECRET=admin_secret
```

**Validate Environment**:
```typescript
// config/functions/bootstrap.ts
export default async ({ strapi }: { strapi: Core.Strapi }) => {
  const required = ['DATABASE_PASSWORD', 'JWT_SECRET', 'ADMIN_JWT_SECRET'];
  
  for (const envVar of required) {
    if (!process.env[envVar]) {
      strapi.log.error(`Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }
};
```

---

### Audit Logging

**Log Important Actions**:
```typescript
// Create audit log service
strapi.documents.use(async (ctx, next) => {
  const startTime = Date.now();
  await next();
  const duration = Date.now() - startTime;
  
  // Log mutations
  if (['create', 'update', 'delete'].includes(ctx.action)) {
    await strapi.service('api::audit-log.audit-log').create({
      data: {
        action: ctx.action,
        contentType: ctx.contentType,
        user: ctx.state?.user?.id,
        duration,
        timestamp: new Date()
      }
    });
  }
});
```

---

## Appendix: Quick Reference Cards {#appendix-quick-reference-cards}

### API Quick Reference

```
GET    /api/{content-type}              # List
GET    /api/{content-type}/{id}         # Get one
POST   /api/{content-type}              # Create
PUT    /api/{content-type}/{id}         # Update
DELETE /api/{content-type}/{id}         # Delete

Query Params:
?filters[field][$operator]=value
?populate=relation
?fields=field1,field2
?sort=field:asc
?pagination[page]=1&pagination[pageSize]=10
?locale=en
?status=published
```

### Document Service Quick Reference

```typescript
// Find
strapi.documents('uid').findMany({ filters, populate, sort, pagination })
strapi.documents('uid').findOne({ documentId, populate })

// Mutate
strapi.documents('uid').create({ data, locale })
strapi.documents('uid').update({ documentId, data, locale })
strapi.documents('uid').delete({ documentId })

// Publish
strapi.documents('uid').publish({ documentId, locale })
strapi.documents('uid').unpublish({ documentId, locale })
```

### Common Operators

```
$eq        # Equals
$ne        # Not equals
$lt        # Less than
$lte       # Less than or equal
$gt        # Greater than
$gte       # Greater than or equal
$in        # In array
$notIn     # Not in array
$contains  # Contains (case-sensitive)
$containsi # Contains (case-insensitive)
$null      # Is null
$notNull   # Is not null
```

---

**Document End**

*This documentation is optimized for RAG systems and LLM coder agents. For the most up-to-date information, always refer to the official Strapi documentation at https://docs.strapi.io*

---

**Sources**:
- Strapi 5 Documentation: https://docs.strapi.io
- Strapi v4 Documentation: https://docs-v4.strapi.io
- Breaking Changes: https://docs.strapi.io/cms/migration/v4-to-v5/breaking-changes
- Document Service API: https://docs.strapi.io/cms/api/document-service
- REST API: https://docs.strapi.io/cms/api/rest

---

*Generated for Jimmy - Senior React/JS Developer*
*Astro 6 + Strapi 5.3+ TypeScript Project*
*April 2026*
