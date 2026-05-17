# Astro 6 + Strapi 5.3+ Integration Guide
## RAG-Optimized Documentation for LLM Coder Agents

---

**Document Metadata:**
- **Stack**: Astro 6, Strapi 5.3+, TypeScript, Clean Architecture
- **Use Case**: RAG for LLM Coder Agents (3 agents)
- **Project Type**: Blogging system with custom APIs, n8n/Flowise integration
- **Last Updated**: April 2026
- **Sources**: Astro Docs, Strapi Docs, VirtusLab Starter
- **Optimization**: Semantic search, problem/solution patterns, cross-references

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Architecture](#project-architecture)
3. [Strapi API Integration](#strapi-api-integration)
4. [Astro Content Collections](#astro-content-collections)
5. [Authentication Flow](#authentication-flow)
6. [Dynamic Content Rendering](#dynamic-content-rendering)
7. [Image & Media Handling](#image--media-handling)
8. [Webhooks & Real-time Updates](#webhooks--real-time-updates)
9. [n8n/Flowise Integration](#n8nflowise-integration)
10. [Performance Optimization](#performance-optimization)
11. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
12. [TypeScript Types Reference](#typescript-types-reference)

---

## Quick Start {#quick-start}

**RAG Tags**: `#quickstart` `#setup` `#installation` `#astro` `#strapi`

### Prerequisites

```bash
# Node.js 18+ (LTS recommended)
node --version  # v18.17.0+

# Package manager
npm --version  # 9+ or yarn 3+ or pnpm 8+

# Strapi 5.3+ project running locally or on Strapi Cloud
```

### Create Astro Project with Strapi Starter

```bash
# Option 1: Use VirtusLab starter (recommended)
npm create astro@latest -- --template VirtusLab-Open-Source/astro-strapi-starter

# Option 2: Start from scratch
npm create astro@latest my-blog -- --template minimal --typescript
cd my-blog

# Install Strapi integration packages
npm install @sensinum/astro-strapi-loader @sensinum/astro-strapi-blocks

# Install TailwindCSS (optional but recommended)
npx astro add tailwind
```

### Environment Configuration

```bash
# Create .env file
cp .env.example .env

# Edit .env with your Strapi configuration
STRAPI_URL=http://localhost:1337
STRAPI_TOKEN=your_readonly_api_token_here

# For TypeScript IntelliSense, create src/env.d.ts
```

```typescript
// src/env.d.ts
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly STRAPI_URL: string;
  readonly STRAPI_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### Start Development

```bash
# Start Strapi (in separate terminal)
cd ../strapi-project
npm run develop

# Start Astro
cd ../astro-project
npm run dev

# Open browser
open http://localhost:4321
```

---

## Project Architecture {#project-architecture}

**RAG Tags**: `#architecture` `#structure` `#patterns` `#best-practices`

### Recommended Folder Structure

```
my-astro-strapi-project/
├── src/
│   ├── components/
│   │   ├── blocks/              # Strapi Blocks Field renderers
│   │   │   ├── BlockRenderer.astro
│   │   │   ├── TextBlock.astro
│   │   │   ├── ImageBlock.astro
│   │   │   ├── CTAButton.astro
│   │   │   └── HeroBlock.astro
│   │   ├── ui/                  # Reusable UI components
│   │   │   ├── Button.astro
│   │   │   ├── Card.astro
│   │   │   └── Layout.astro
│   │   └── seo/                 # SEO components
│   │       ├── MetaTags.astro
│   │       └── StructuredData.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── BlogPostLayout.astro
│   │   └── PageLayout.astro
│   ├── lib/
│   │   ├── strapi.ts           # Strapi API client wrapper
│   │   ├── utils.ts            # Helper functions
│   │   └── auth.ts             # Authentication utilities
│   ├── pages/
│   │   ├── index.astro         # Homepage
│   │   ├── blog/
│   │   │   ├── index.astro     # Blog listing
│   │   │   └── [slug].astro    # Dynamic blog post
│   │   ├── api/
│   │   │   └── [...endpoint].ts # API routes for n8n/Flowise
│   │   └── [...404].astro      # 404 page
│   ├── content.config.ts       # Astro Content Collections config
│   ├── types/
│   │   ├── strapi.ts           # Strapi TypeScript types
│   │   └── astro.d.ts          # Astro-specific types
│   └── styles/
│       └── global.css          # Global styles
├── public/
│   ├── favicon.svg
│   └── robots.txt
├── astro.config.mjs            # Astro configuration
├── tsconfig.json               # TypeScript configuration
├── package.json
└── .env                        # Environment variables (gitignored)
```

---

### Key Configuration Files

#### astro.config.mjs

```typescript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import strapiLoader from '@sensinum/astro-strapi-loader';

export default defineConfig({
  integrations: [
    tailwind(),
    strapiLoader({
      baseUrl: import.meta.env.STRAPI_URL,
      token: import.meta.env.STRAPI_TOKEN,
      collections: {
        articles: {
          endpoint: 'articles',
          schema: './src/types/strapi.ts',
          populate: ['author', 'cover', 'categories'],
          filters: { published: true }
        },
        pages: {
          endpoint: 'pages',
          schema: './src/types/strapi.ts',
          populate: {
            blocks: {
              on: {
                'hero.section': { populate: ['image'] },
                'text.section': true,
                'cta.section': true
              }
            }
          }
        }
      }
    })
  ],
  output: 'static',  // or 'server' for SSR
  site: 'https://yourdomain.com',
  vite: {
    optimizeDeps: {
      exclude: ['@sensinum/astro-strapi-loader']
    }
  }
});
```

#### content.config.ts

```typescript
import { defineCollection, z } from 'astro:content';
import { strapiCollection } from '@sensinum/astro-strapi-loader';

export const collections = {
  articles: strapiCollection({
    endpoint: 'articles',
    schema: z.object({
      documentId: z.string(),
      title: z.string(),
      slug: z.string(),
      excerpt: z.string().optional(),
      content: z.string(),  // Markdown or rich text
      publishedAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
      author: z.object({
        documentId: z.string(),
        name: z.string(),
        avatar: z.object({
          url: z.string(),
          alternativeText: z.string().optional()
        }).optional()
      }).optional(),
      cover: z.object({
        url: z.string(),
        formats: z.object({
          thumbnail: z.object({ url: z.string() }).optional(),
          small: z.object({ url: z.string() }).optional(),
          medium: z.object({ url: z.string() }).optional(),
          large: z.object({ url: z.string() }).optional()
        }).optional()
      }).optional(),
      categories: z.array(z.object({
        documentId: z.string(),
        name: z.string(),
        slug: z.string()
      })).optional()
    })
  }),
  
  pages: strapiCollection({
    endpoint: 'pages',
    schema: z.object({
      documentId: z.string(),
      title: z.string(),
      slug: z.string(),
      blocks: z.array(z.any())  // Dynamic zone - handled by Blocks renderer
    })
  })
};
```

---

## Strapi API Integration {#strapi-api-integration}

**RAG Tags**: `#api` `#fetch` `#client` `#typescript` `#rest`

### API Client Wrapper

```typescript
// src/lib/strapi.ts
interface FetchOptions {
  endpoint: string;
  query?: Record<string, string | number | boolean>;
  populate?: string | Record<string, any>;
  fields?: string[];
  locale?: string;
  status?: 'draft' | 'published';
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  token?: string;
}

export async function fetchStrapi<T>({
  endpoint,
  query = {},
  populate,
  fields,
  locale,
  status = 'published',
  method = 'GET',
  body,
  token = import.meta.env.STRAPI_TOKEN
}: FetchOptions): Promise<T> {
  const baseUrl = import.meta.env.STRAPI_URL;
  const url = new URL(`${baseUrl}/api/${endpoint}`);
  
  // Add query parameters
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  // Add filters
  if (status) {
    url.searchParams.append('status', status);
  }
  if (locale) {
    url.searchParams.append('locale', locale);
  }
  
  // Add populate parameter (complex handling for nested relations)
  if (populate) {
    if (typeof populate === 'string') {
      url.searchParams.append('populate', populate);
    } else {
      // Handle nested populate objects
      const populateString = JSON.stringify(populate);
      url.searchParams.append('populate', populateString);
    }
  }
  
  // Add fields parameter
  if (fields?.length) {
    url.searchParams.append('fields', fields.join(','));
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    // Important for Astro: cache API responses at build time
    next: { revalidate: 3600 }  // Revalidate every hour
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Strapi API error: ${response.status} - ${error.message || response.statusText}`);
  }
  
  return response.json();
}
```

---

### Usage Examples

#### Fetch Article List

```typescript
// src/pages/blog/index.astro
---
import { fetchStrapi } from '../../lib/strapi';
import type { Article } from '../../types/strapi';

interface StrapiResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

const { data: articles, meta } = await fetchStrapi<StrapiResponse<Article>>({
  endpoint: 'articles',
  populate: ['author', 'cover'],
  fields: ['title', 'slug', 'excerpt', 'publishedAt'],
  query: {
    'pagination[page]': 1,
    'pagination[pageSize]': 10,
    'sort': 'publishedAt:desc'
  }
});
---

<article>
  {articles.map(article => (
    <a href={`/blog/${article.slug}/`}>
      <h2>{article.title}</h2>
      {article.excerpt && <p>{article.excerpt}</p>}
      <time datetime={article.publishedAt}>
        {new Date(article.publishedAt).toLocaleDateString()}
      </time>
    </a>
  ))}
</article>
```

---

#### Fetch Single Article

```typescript
// src/pages/blog/[slug].astro
---
import { fetchStrapi } from '../../lib/strapi';
import type { Article } from '../../types/strapi';
import { getStaticPaths } from 'astro';

export async function getStaticPaths() {
  const { data: articles } = await fetchStrapi<{ data: Article[] }>({
    endpoint: 'articles',
    fields: ['slug'],
    status: 'published'
  });
  
  return articles.map(article => ({
    params: { slug: article.slug },
    props: { article }
  }));
}

const { slug } = Astro.params;

const { data: article } = await fetchStrapi<{ data: Article }>({
  endpoint: `articles`,
  query: {
    'filters[slug][$eq]': slug,
    'status': 'published'
  },
  populate: {
    author: { populate: ['avatar'] },
    cover: true,
    categories: true,
    blocks: {
      on: {
        'text.block': { populate: ['content'] },
        'image.block': { populate: ['image'] },
        'cta.block': true
      }
    }
  }
});

if (!article) {
  return Astro.redirect('/404');
}
---

<Layout title={article.title} description={article.excerpt}>
  <article>
    <h1>{article.title}</h1>
    
    {article.cover && (
      <img 
        src={`${import.meta.env.STRAPI_URL}${article.cover.url}`}
        alt={article.cover.alternativeText || article.title}
        width={article.cover.formats?.large?.width}
        height={article.cover.formats?.large?.height}
      />
    )}
    
    <BlockRenderer blocks={article.blocks} />
  </article>
</Layout>
```

---

### ⚠️ Common API Issues

#### Issue: Populate Not Working for Dynamic Zones

**Problem**: Dynamic zone content not returned in API response.

**Solution**: Use detailed populate strategy:
```typescript
// ❌ Wrong - won't populate dynamic zones
populate: ['blocks']

// ✅ Correct - detailed populate for each block type
populate: {
  blocks: {
    on: {
      'text.block': {
        populate: ['content']
      },
      'image.block': {
        populate: ['image', 'caption']
      },
      'cta.block': {
        populate: ['button']
      }
    }
  }
}
```

---

#### Issue: CORS Errors in Development

**Problem**: Browser blocks API requests from localhost:4321 to localhost:1337.

**Solution**: Configure Strapi CORS:
```typescript
// Strapi: config/middlewares.ts
export default [
  // ... other middlewares
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: ['http://localhost:4321', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization']
    }
  }
];
```

---

#### Issue: API Token Permissions

**Problem**: 403 Forbidden on API calls.

**Solution**: Grant token permissions in Strapi Admin:
1. Settings → API Tokens → Create/Edit token
2. Under "Permissions", select content types
3. Check boxes: find, findOne (and create/update/delete if needed)
4. Save and use new token in Astro .env

---

## Astro Content Collections {#astro-content-collections}

**RAG Tags**: `#content-collections` `#astro` `#types` `#validation`

### Overview

Astro Content Collections provide type-safe content management. Combined with the Strapi loader, you get:
- TypeScript validation at build time
- IntelliSense in your editor
- Automatic content fetching
- Build-time error checking

---

### Define Collection Schema

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { strapiCollection } from '@sensinum/astro-strapi-loader';

export const collections = {
  articles: strapiCollection({
    endpoint: 'articles',
    schema: z.object({
      documentId: z.string(),
      title: z.string().min(1).max(200),
      slug: z.string().regex(/^[a-z0-9-]+$/),
      excerpt: z.string().max(300).optional(),
      content: z.string(),  // Markdown or rich text
      publishedAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
      featured: z.boolean().default(false),
      author: z.object({
        documentId: z.string(),
        name: z.string(),
        bio: z.string().optional(),
        avatar: z.object({
          url: z.string().url(),
          alternativeText: z.string().optional()
        }).optional()
      }).optional(),
      cover: z.object({
        url: z.string().url(),
        alternativeText: z.string().optional(),
        formats: z.object({
          thumbnail: z.object({ 
            url: z.string().url(),
            width: z.number(),
            height: z.number()
          }).optional(),
          small: z.object({
            url: z.string().url(),
            width: z.number(),
            height: z.number()
          }).optional(),
          medium: z.object({
            url: z.string().url(),
            width: z.number(),
            height: z.number()
          }).optional(),
          large: z.object({
            url: z.string().url(),
            width: z.number(),
            height: z.number()
          }).optional()
        }).optional()
      }).optional(),
      categories: z.array(z.object({
        documentId: z.string(),
        name: z.string(),
        slug: z.string()
      })).optional(),
      seo: z.object({
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaImage: z.object({
          url: z.string().url()
        }).optional()
      }).optional()
    })
  })
};
```

---

### Use Collections in Pages

```typescript
// src/pages/blog/index.astro
---
import { getCollection } from 'astro:content';
import ArticleCard from '../../components/ArticleCard.astro';

// Get all published articles
const articles = await getCollection('articles', ({ data }) => {
  return data.publishedAt <= new Date().toISOString();
});

// Sort by published date
articles.sort((a, b) => 
  new Date(b.data.publishedAt).getTime() - new Date(a.data.publishedAt).getTime()
);
---

<h1>Blog</h1>
<div class="grid gap-8">
  {articles.map(article => (
    <ArticleCard 
      href={`/blog/${article.data.slug}/`}
      title={article.data.title}
      excerpt={article.data.excerpt}
      publishedAt={article.data.publishedAt}
      author={article.data.author}
      cover={article.data.cover}
    />
  ))}
</div>
```

---

### Dynamic Routes with Collections

```typescript
// src/pages/blog/[slug].astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import { getStaticPaths } from 'astro';

export async function getStaticPaths() {
  const articles = await getCollection('articles');
  
  return articles.map(article => ({
    params: { slug: article.data.slug },
    props: { article }
  }));
}

const { article } = Astro.props as { article: CollectionEntry<'articles'> };
---

<Layout 
  title={article.data.title}
  description={article.data.excerpt}
  image={article.data.cover?.url}
>
  <article class="prose prose-lg mx-auto">
    <h1>{article.data.title}</h1>
    
    {article.data.cover && (
      <img 
        src={`${import.meta.env.STRAPI_URL}${article.data.cover.url}`}
        alt={article.data.cover.alternativeText || article.data.title}
        class="w-full h-64 object-cover rounded-lg mb-8"
      />
    )}
    
    <div class="flex items-center gap-4 mb-8 text-sm text-gray-600">
      {article.data.author && (
        <span>By {article.data.author.name}</span>
      )}
      <time datetime={article.data.publishedAt}>
        {new Date(article.data.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </time>
    </div>
    
    <div class="content">
      <!-- Render Markdown or rich text content -->
      <Fragment set:html={article.data.content} />
    </div>
  </article>
</Layout>
```

---

### Type-Safe Content Access

```typescript
// src/types/strapi.ts
export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface Article {
  documentId: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  publishedAt: string;
  updatedAt: string;
  featured?: boolean;
  author?: {
    documentId: string;
    name: string;
    bio?: string;
    avatar?: Media;
  };
  cover?: Media;
  categories?: Category[];
  seo?: SEO;
}

export interface Media {
  url: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: ImageFormat;
    small?: ImageFormat;
    medium?: ImageFormat;
    large?: ImageFormat;
  };
}

export interface ImageFormat {
  url: string;
  width: number;
  height: number;
  size: number;
}

export interface Category {
  documentId: string;
  name: string;
  slug: string;
}

export interface SEO {
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: {
    url: string;
  };
}
```

---

## Authentication Flow {#authentication-flow}

**RAG Tags**: `#authentication` `#jwt` `#users` `#security` `#astro`

### User Authentication Setup

#### Strapi Side: Enable Public Permissions

```typescript
// In Strapi Admin Panel:
// Settings → Users & Permissions Plugin → Roles → Public
// Grant permissions for:
// - Article: find, findOne
// - Category: find, findOne
// - Author: find, findOne
// (Do NOT grant create/update/delete to Public role)
```

#### Astro Side: Login Component

```astro
<!-- src/components/LoginForm.astro -->
---
interface LoginFormProps {
  onSuccess?: (user: any, token: string) => void;
  onError?: (error: Error) => void;
}

const { onSuccess, onError } = Astro.props;

async function handleLogin(event: SubmitEvent) {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);
  
  try {
    const response = await fetch(`${import.meta.env.STRAPI_URL}/api/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: formData.get('identifier'),
        password: formData.get('password')
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Login failed');
    }
    
    const { jwt, user } = await response.json();
    
    // Store token securely
    localStorage.setItem('jwt', jwt);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Redirect or callback
    if (onSuccess) {
      onSuccess(user, jwt);
    } else {
      window.location.href = '/dashboard';
    }
  } catch (error) {
    if (onError) {
      onError(error as Error);
    } else {
      alert('Login failed: ' + (error as Error).message);
    }
  }
}
---

<form onsubmit={handleLogin} class="space-y-4">
  <div>
    <label for="identifier">Email or Username</label>
    <input 
      type="text" 
      id="identifier" 
      name="identifier" 
      required
      class="w-full px-4 py-2 border rounded"
    />
  </div>
  
  <div>
    <label for="password">Password</label>
    <input 
      type="password" 
      id="password" 
      name="password" 
      required
      class="w-full px-4 py-2 border rounded"
    />
  </div>
  
  <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
    Login
  </button>
</form>
```

---

### Protected API Calls

```typescript
// src/lib/auth.ts
export function getAuthToken(): string | null {
  // Only run on client
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jwt');
}

export async function fetchProtected<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const response = await fetch(`${import.meta.env.STRAPI_URL}/api/${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.status === 401) {
    // Token expired, clear and redirect
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Session expired');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API request failed');
  }
  
  return response.json();
}
```

---

### Server-Side Authentication (SSR Mode)

```typescript
// astro.config.mjs - Enable SSR
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  // ... other config
});
```

```typescript
// src/middleware.ts (Astro middleware for auth)
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // Skip auth check for public routes
  const publicPaths = ['/', '/blog', '/login', '/register'];
  if (publicPaths.includes(context.url.pathname)) {
    return next();
  }
  
  // Check for auth token in cookies or headers
  const token = context.cookies.get('jwt')?.value || 
                context.request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return context.redirect('/login');
  }
  
  // Verify token (you can call Strapi to validate)
  try {
    const response = await fetch(`${import.meta.env.STRAPI_URL}/api/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      context.cookies.delete('jwt');
      return context.redirect('/login');
    }
    
    // Attach user to context
    context.locals.user = await response.json();
  } catch {
    return context.redirect('/login');
  }
  
  return next();
});
```

---

## Dynamic Content Rendering {#dynamic-content-rendering}

**RAG Tags**: `#blocks` `#dynamic-zones` `#rendering` `#components` `#strapi`

### Strapi Blocks Field Setup

#### In Strapi Admin:
1. Create content type with "Blocks" field
2. Field type: Dynamic Zone
3. Add components: Text, Image, CTA, Hero, etc.
4. Configure each component with fields

#### In Astro: Create Block Renderers

```astro
<!-- src/components/blocks/BlockRenderer.astro -->
---
interface BlockRendererProps {
  blocks: any[];  // Array of dynamic zone blocks from Strapi
}

const { blocks } = Astro.props;
---

{blocks.map((block, index) => {
  switch (block.__component) {
    case 'blocks.text':
      return <TextBlock {...block} key={index} />;
    case 'blocks.image':
      return <ImageBlock {...block} key={index} />;
    case 'blocks.cta':
      return <CTABlock {...block} key={index} />;
    case 'blocks.hero':
      return <HeroBlock {...block} key={index} />;
    default:
      console.warn(`Unknown block type: ${block.__component}`);
      return null;
  }
})}
```

---

### Individual Block Components

```astro
<!-- src/components/blocks/TextBlock.astro -->
---
interface TextBlockProps {
  content: string;  // Rich text or markdown
  alignment?: 'left' | 'center' | 'right';
}

const { content, alignment = 'left' } = Astro.props;
---

<div class={`text-block text-${alignment} prose max-w-none`}>
  <Fragment set:html={content} />
</div>
```

```astro
<!-- src/components/blocks/ImageBlock.astro -->
---
interface ImageBlockProps {
  image: {
    url: string;
    alternativeText?: string;
    caption?: string;
    formats?: {
      thumbnail?: { url: string; width: number; height: number };
      small?: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      large?: { url: string; width: number; height: number };
    };
  };
  caption?: string;
  width?: 'full' | 'wide' | 'normal';
}

const { image, caption, width = 'normal' } = Astro.props;

// Choose best format for responsive images
const getSrcSet = (formats: ImageBlockProps['image']['formats']) => {
  if (!formats) return undefined;
  
  const sizes = [
    formats.thumbnail && `(max-width: 400px) ${formats.thumbnail.url}`,
    formats.small && `(max-width: 768px) ${formats.small.url}`,
    formats.medium && `(max-width: 1024px) ${formats.medium.url}`,
    formats.large && `${formats.large.url}`
  ].filter(Boolean);
  
  return sizes.length > 0 ? sizes.join(', ') : undefined;
};
---

<figure class={`image-block width-${width}`}>
  <img 
    src={`${import.meta.env.STRAPI_URL}${image.url}`}
    srcset={getSrcSet(image.formats)}
    alt={image.alternativeText || caption || ''}
    loading="lazy"
    class="w-full h-auto rounded-lg"
  />
  {caption && <figcaption class="text-sm text-gray-600 mt-2">{caption}</figcaption>}
</figure>
```

```astro
<!-- src/components/blocks/CTABlock.astro -->
---
interface CTABlockProps {
  title: string;
  description?: string;
  button: {
    text: string;
    url: string;
    variant?: 'primary' | 'secondary' | 'outline';
  };
}

const { title, description, button } = Astro.props;
---

<div class="cta-block bg-gray-50 rounded-xl p-8 text-center">
  <h3 class="text-2xl font-bold mb-4">{title}</h3>
  {description && <p class="text-gray-600 mb-6">{description}</p>}
  <a 
    href={button.url}
    class={`inline-block px-6 py-3 rounded-lg font-medium transition ${
      button.variant === 'primary' 
        ? 'bg-blue-600 text-white hover:bg-blue-700'
        : button.variant === 'secondary'
        ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
        : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
    }`}
  >
    {button.text}
  </a>
</div>
```

---

### Usage in Page

```astro
<!-- src/pages/blog/[slug].astro (continued) -->
---
// After fetching article with blocks populated
const { article } = Astro.props;
---

<Layout title={article.data.title}>
  <article class="prose prose-lg mx-auto">
    <h1>{article.data.title}</h1>
    
    <!-- Render dynamic blocks -->
    <BlockRenderer blocks={article.data.blocks} />
  </article>
</Layout>
```

---

## Image & Media Handling {#image--media-handling}

**RAG Tags**: `#images` `#media` `#optimization` `#responsive` `#strapi`

### Strapi Media Configuration

#### In Strapi: Configure Upload Provider

```typescript
// config/plugins.ts - For Cloudinary/S3
export default {
  upload: {
    config: {
      provider: 'cloudinary',  // or 'aws-s3', 'local'
      providerOptions: {
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET
      },
      actionOptions: {
        upload: {
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        }
      }
    }
  }
};
```

---

### Astro Image Optimization

#### Using Astro's Built-in Image Component

```astro
<!-- src/components/OptimizedImage.astro -->
---
interface OptimizedImageProps {
  src: string;  // Strapi media URL
  alt: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
  };
  loading?: 'lazy' | 'eager';
  class?: string;
}

const { 
  src, 
  alt, 
  width, 
  height, 
  formats, 
  loading = 'lazy',
  class: className = ''
} = Astro.props;

// Use responsive formats if available
const srcset = formats ? Object.values(formats)
  .filter(f => f?.url)
  .map(f => `${import.meta.env.STRAPI_URL}${f!.url} ${f!.width}w`)
  .join(', ') : undefined;

// Use largest available size for width/height
const largest = formats?.large || formats?.medium || formats?.small;
---

<img 
  src={`${import.meta.env.STRAPI_URL}${src}`}
  {srcset}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
  alt={alt}
  width={width || largest?.width}
  height={height || largest?.height}
  loading={loading}
  class={className}
/>
```

---

### Lazy Loading Strategy

```typescript
// src/lib/image.ts
export function getOptimizedImageUrl(
  baseUrl: string,
  media: any,
  size: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium'
): string {
  if (!media?.formats?.[size]) {
    return `${baseUrl}${media?.url}`;
  }
  return `${baseUrl}${media.formats[size].url}`;
}

export function getImageDimensions(media: any): { width: number; height: number } {
  const format = media?.formats?.large || media?.formats?.medium || media;
  return {
    width: format?.width || 800,
    height: format?.height || 600
  };
}
```

---

### SEO: Structured Data for Images

```astro
<!-- src/components/seo/StructuredData.astro -->
---
interface StructuredDataProps {
  article: {
    title: string;
    publishedAt: string;
    author?: { name: string };
    cover?: { url: string };
  };
}

const { article } = Astro.props;

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: article.title,
  datePublished: article.publishedAt,
  author: article.author ? {
    '@type': 'Person',
    name: article.author.name
  } : undefined,
  image: article.cover ? `${import.meta.env.STRAPI_URL}${article.cover.url}` : undefined
};
---

<script type="application/ld+json" set:html={JSON.stringify(structuredData)} />
```

---

## Webhooks & Real-time Updates {#webhooks--real-time-updates}

**RAG Tags**: `#webhooks` `#realtime` `#n8n` `#flowise` `#integration`

### Strapi Webhook Setup

#### In Strapi Admin:
1. Settings → Webhooks → Create new webhook
2. URL: `https://your-astro-site.com/api/webhook/strapi`
3. Events: entry.create, entry.update, entry.delete
4. Headers: `Content-Type: application/json`
5. Secret: (optional) for signature verification

---

### Astro API Route for Webhooks

```typescript
// src/pages/api/webhook/strapi.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  // Verify webhook signature (if configured)
  const signature = request.headers.get('x-strapi-signature');
  const body = await request.text();
  
  // Optional: Verify HMAC signature
  // const crypto = await import('crypto');
  // const expected = crypto
  //   .createHmac('sha256', process.env.WEBHOOK_SECRET!)
  //   .update(body)
  //   .digest('hex');
  // if (signature !== expected) {
  //   return new Response('Unauthorized', { status: 401 });
  // }
  
  const payload = JSON.parse(body);
  
  // Handle different event types
  switch (payload.type) {
    case 'entry.create':
    case 'entry.update':
      // Clear cache for this content type
      await clearCache(payload.model, payload.entry.documentId);
      // Trigger rebuild if needed (for static sites)
      await triggerRebuild(payload.model);
      break;
      
    case 'entry.delete':
      // Clear cache and trigger rebuild
      await clearCache(payload.model, payload.entry.documentId);
      await triggerRebuild(payload.model);
      break;
  }
  
  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

async function clearCache(model: string, documentId?: string) {
  // Implement your cache invalidation logic
  // Could be Redis, in-memory, or CDN purge
  console.log(`Cache cleared for ${model}${documentId ? `/${documentId}` : ''}`);
}

async function triggerRebuild(model: string) {
  // For static sites: trigger rebuild on Vercel/Netlify
  if (import.meta.env.VERCEL) {
    await fetch(`https://api.vercel.com/v1/integrations/deploy/${import.meta.env.VERCEL_HOOK}`, {
      method: 'POST'
    });
  }
  // For Netlify: similar approach with Netlify build hook
}
```

---

### Real-time Updates with Server-Sent Events (SSR Mode)

```typescript
// src/pages/api/stream/updates.ts (SSR only)
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
      
      // Listen for Strapi webhook events (via Redis pub/sub or similar)
      // This is a simplified example
      const onStrapiUpdate = (data: any) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };
      
      // Register listener (implement based on your infrastructure)
      // strapiEvents.on('content.updated', onStrapiUpdate);
      
      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        // strapiEvents.off('content.updated', onStrapiUpdate);
        controller.close();
      });
    }
  });
  
  return new Response(stream, { headers });
};
```

```astro
<!-- src/components/RealtimeUpdates.astro (client-side) -->
---
// Client-side script only
---

<script>
  if ('EventSource' in window) {
    const eventSource = new EventSource('/api/stream/updates');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'content.updated') {
        // Update UI without full page reload
        updateContent(data.model, data.documentId, data.data);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      // Implement reconnection logic
    };
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      eventSource.close();
    });
  }
  
  function updateContent(model: string, documentId: string, newData: any) {
    // Implement your UI update logic
    // Could be: re-fetch content, update DOM, show notification, etc.
    console.log(`Updated ${model}/${documentId}`, newData);
  }
</script>
```

---

## n8n/Flowise Integration {#n8nflowise-integration}

**RAG Tags**: `#n8n` `#flowise` `#automation` `#ai` `#api` `#integration`

### Overview

Integrate Strapi/Astro with workflow automation tools:
- **n8n**: Open-source workflow automation
- **Flowise**: Visual AI agent builder
- Use cases: Content moderation, AI summarization, social media posting, analytics

---

### API Endpoint for External Tools

```typescript
// src/pages/api/external/[...endpoint].ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, params }) => {
  const { endpoint } = params;
  
  // Validate API key for external tools
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== import.meta.env.EXTERNAL_API_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const body = await request.json();
  
  // Route to appropriate handler
  switch (endpoint) {
    case 'create-article':
      return handleCreateArticle(body);
    case 'summarize-content':
      return handleSummarizeContent(body);
    case 'moderate-content':
      return handleModerateContent(body);
    case 'post-to-social':
      return handlePostToSocial(body);
    default:
      return new Response('Not found', { status: 404 });
  }
};

async function handleCreateArticle(data: any) {
  // Validate input
  if (!data.title || !data.content) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Create article in Strapi
  const response = await fetch(`${import.meta.env.STRAPI_URL}/api/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.STRAPI_TOKEN}`
    },
    body: JSON.stringify({
      data: {
        title: data.title,
        content: data.content,
        slug: generateSlug(data.title),
        published: data.publish_immediately || false,
        author: data.author_id ? { connect: [data.author_id] } : undefined
      }
    })
  });
  
  const result = await response.json();
  
  return new Response(JSON.stringify({ 
    success: response.ok,
    data: result.data,
    documentId: result.data?.documentId
  }), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}
```

---

### n8n Workflow Example

```json
{
  "nodes": [
    {
      "parameters": {
        "url": "https://your-astro-site.com/api/external/create-article",
        "method": "POST",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "x-api-key", "value": "={{ $env.EXTERNAL_API_KEY }}" }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "title", "value": "={{ $json.title }}" },
            { "name": "content", "value": "={{ $json.content }}" },
            { "name": "publish_immediately", "value": "={{ $json.publish }}" }
          ]
        }
      },
      "name": "Create Strapi Article",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.success }}",
              "operation": "equal",
              "value2": "true"
            }
          ]
        }
      },
      "name": "Check Success",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1
    },
    {
      "parameters": {
        "url": "https://your-astro-site.com/api/webhook/strapi",
        "method": "POST",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "type", "value": "entry.create" },
            { "name": "model", "value": "article" },
            { "name": "entry", "value": "={{ $node[\"Create Strapi Article\"].json.data }}" }
          ]
        }
      },
      "name": "Trigger Astro Rebuild",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1
    }
  ],
  "connections": {
    "Create Strapi Article": {
      "main": [[{ "node": "Check Success", "type": "main", "index": 0 }]]
    },
    "Check Success": {
      "main": [
        [{ "node": "Trigger Astro Rebuild", "type": "main", "index": 0 }],
        []
      ]
    }
  }
}
```

---

### Flowise AI Agent Integration

```typescript
// src/pages/api/ai/process.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const { action, content, options = {} } = await request.json();
  
  // Forward to Flowise API
  const flowiseResponse = await fetch(`${import.meta.env.FLOWISE_API_URL}/api/v1/prediction/${options.flowId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.FLOWISE_API_KEY}`
    },
    body: JSON.stringify({
      question: content,
      overrideConfig: {
        sessionId: options.sessionId,
        ...options.config
      }
    })
  });
  
  const flowiseResult = await flowiseResponse.json();
  
  // Process AI response based on action
  switch (action) {
    case 'summarize':
      return new Response(JSON.stringify({
        summary: flowiseResult.text,
        metadata: flowiseResult.sourceDocuments
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    case 'generate-tags':
      // Parse AI response for tags
      const tags = parseTagsFromAI(flowiseResult.text);
      return new Response(JSON.stringify({ tags }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    case 'moderate':
      // Check for inappropriate content
      const moderation = await moderateContent(flowiseResult.text);
      return new Response(JSON.stringify({ 
        approved: moderation.approved,
        reasons: moderation.reasons
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    default:
      return new Response(JSON.stringify(flowiseResult), {
        headers: { 'Content-Type': 'application/json' }
      });
  }
};

function parseTagsFromAI(text: string): string[] {
  // Simple parser - improve based on your AI prompt
  return text
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0 && tag.length < 30);
}

async function moderateContent(text: string) {
  // Implement content moderation logic
  // Could use AI, keyword lists, or external API
  const bannedWords = ['spam', 'offensive', 'inappropriate'];
  const hasBanned = bannedWords.some(word => 
    text.toLowerCase().includes(word)
  );
  
  return {
    approved: !hasBanned,
    reasons: hasBanned ? ['Contains inappropriate language'] : []
  };
}
```

---

### Environment Variables for Integrations

```bash
# .env
# Strapi
STRAPI_URL=http://localhost:1337
STRAPI_TOKEN=your_readonly_token

# External API Key (for n8n/Flowise)
EXTERNAL_API_KEY=your_secure_random_key

# Flowise
FLOWISE_API_URL=https://your-flowise-instance.com
FLOWISE_API_KEY=your_flowise_api_key

# Optional: Redis for caching/webhooks
REDIS_URL=redis://localhost:6379

# Optional: CDN for images
CDN_URL=https://cdn.yourdomain.com
```

---

## Performance Optimization {#performance-optimization}

**RAG Tags**: `#performance` `#caching` `#build` `#astro` `#optimization`

### Astro Build Optimization

#### Static Generation (SSG) - Default & Recommended

```typescript
// astro.config.mjs
export default defineConfig({
  output: 'static',  // Pre-render at build time
  site: 'https://yourdomain.com',
  
  // Image optimization
  image: {
    domains: [import.meta.env.STRAPI_URL.replace('http://', '').replace('https://', '')],
    remotePatterns: [{
      protocol: 'https',
      hostname: '**.strapiapp.com'  // For Strapi Cloud
    }]
  },
  
  // Vite optimizations
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['@sensinum/astro-strapi-loader']
          }
        }
      }
    }
  }
});
```

---

### Caching Strategies

#### Build-Time Caching (SSG)

```typescript
// src/lib/strapi.ts - Add caching to fetch function
const cache = new Map();
const CACHE_TTL = 3600 * 1000;  // 1 hour

export async function fetchStrapi<T>({
  endpoint,
  query = {},
  populate,
  fields,
  locale,
  status = 'published'
}: FetchOptions): Promise<T> {
  // Create cache key
  const cacheKey = `${endpoint}:${JSON.stringify({ query, populate, fields, locale, status })}`;
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  // Fetch from API
  const data = await fetchFromStrapi<T>({ endpoint, query, populate, fields, locale, status });
  
  // Store in cache
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}
```

#### CDN Caching Headers

```typescript
// src/middleware.ts - Add cache headers for static assets
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  
  // Add cache headers for API responses
  if (context.url.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  }
  
  // Add cache headers for images
  if (context.url.pathname.match(/\.(jpg|jpeg|png|webp|gif)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  return response;
});
```

---

### Database Query Optimization

#### Strapi Side: Add Indexes

```typescript
// In Strapi content type schema (schema.json)
{
  "attributes": {
    "slug": {
      "type": "uid",
      "targetField": "title",
      "index": true  // Add database index
    },
    "publishedAt": {
      "type": "datetime",
      "index": true  // Add index for sorting
    }
  }
}
```

#### Astro Side: Efficient Queries

```typescript
// ❌ Bad: Fetching all fields when not needed
const articles = await fetchStrapi({
  endpoint: 'articles',
  populate: ['*']  // Fetches everything
});

// ✅ Good: Only fetch what you need
const articles = await fetchStrapi({
  endpoint: 'articles',
  fields: ['title', 'slug', 'excerpt', 'publishedAt'],
  populate: {
    author: { fields: ['name'] },
    cover: { fields: ['url', 'formats.thumbnail.url'] }
  }
});
```

---

### Image Optimization

#### Use Responsive Images

```astro
<!-- src/components/ResponsiveImage.astro -->
---
interface Props {
  src: string;
  alt: string;
  formats?: {
    thumbnail?: { url: string; width: number };
    small?: { url: string; width: number };
    medium?: { url: string; width: number };
    large?: { url: string; width: number };
  };
}

const { src, alt, formats } = Astro.props;

// Generate srcset
const srcset = formats ? Object.entries(formats)
  .filter(([_, format]) => format?.url)
  .map(([size, format]) => 
    `${import.meta.env.STRAPI_URL}${format!.url} ${format!.width}w`
  )
  .join(', ') : undefined;
---

<img 
  src={`${import.meta.env.STRAPI_URL}${src}`}
  {srcset}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
  alt={alt}
  loading="lazy"
  decoding="async"
  class="w-full h-auto"
/>
```

---

### Bundle Size Optimization

#### Tree Shaking & Code Splitting

```typescript
// astro.config.mjs
export default defineConfig({
  vite: {
    build: {
      // Enable code splitting
      rollupOptions: {
        output: {
          manualChunks: {
            'strapi-client': ['@sensinum/astro-strapi-loader'],
            'blocks-renderer': ['./src/components/blocks']
          }
        }
      }
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['@sensinum/astro-strapi-loader']
    }
  }
});
```

---

## Common Pitfalls & Solutions {#common-pitfalls--solutions}

**RAG Tags**: `#troubleshooting` `#errors` `#debugging` `#solutions`

### ⚠️ Pitfall 1: Hydration Mismatch

**Problem**: Server-rendered HTML doesn't match client-rendered content.

**Symptoms**:
- Console warning: "Hydration failed"
- Interactive components not working
- Layout shifts after load

**Solution**:
```astro
<!-- Use client:only for interactive components -->
<ClientComponent client:load />

<!-- Or use client:visible for lazy loading -->
<HeavyComponent client:visible />

<!-- For Strapi content, ensure consistent rendering -->
---
// Server-side: fetch and render content
const content = await fetchStrapi(...);
---
<div>{content}</div>  // Same on server and client
```

---

### ⚠️ Pitfall 2: Strapi API Rate Limiting

**Problem**: Too many API calls during build cause 429 errors.

**Symptoms**:
- Build fails with "Too Many Requests"
- Intermittent missing content
- Slow build times

**Solution**:
```typescript
// src/lib/strapi.ts - Add rate limiting
const requestQueue: Array<() => Promise<any>> = [];
let processing = false;

async function processQueue() {
  if (processing || requestQueue.length === 0) return;
  
  processing = true;
  
  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (request) {
      try {
        await request();
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('API request failed:', error);
      }
    }
  }
  
  processing = false;
}

export async function fetchStrapiWithQueue<T>(options: FetchOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      try {
        const result = await fetchStrapi<T>(options);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    processQueue();
  });
}
```

---

### ⚠️ Pitfall 3: TypeScript Type Mismatches

**Problem**: Strapi API response types don't match Astro types.

**Symptoms**:
- TypeScript errors in editor
- Build fails with type errors
- Runtime errors from undefined properties

**Solution**:
```typescript
// src/types/strapi.ts - Define strict types
export interface StrapiArticle {
  documentId: string;  // NOT id
  title: string;
  content: string;
  // ... other fields
}

export interface StrapiResponse<T> {
  data: T;  // Flattened in v5, no 'attributes' wrapper
  meta?: {
    pagination?: PaginationMeta;
  };
}

// Use types in fetch function
export async function fetchArticle(slug: string): Promise<StrapiArticle | null> {
  const response = await fetchStrapi<StrapiResponse<StrapiArticle>>({
    endpoint: 'articles',
    query: { 'filters[slug][$eq]': slug }
  });
  
  return response.data ?? null;
}
```

---

### ⚠️ Pitfall 4: Image URL Issues

**Problem**: Images not loading or broken links.

**Symptoms**:
- 404 errors for images
- Images showing as broken
- Mixed content warnings (HTTP/HTTPS)

**Solution**:
```typescript
// src/lib/media.ts - Centralized image URL handling
export function getMediaUrl(media: any, format: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium'): string {
  if (!media?.url) return '';
  
  // Use formats if available
  if (media.formats?.[format]?.url) {
    return `${import.meta.env.STRAPI_URL}${media.formats[format].url}`;
  }
  
  // Fallback to original
  return `${import.meta.env.STRAPI_URL}${media.url}`;
}

// Handle relative vs absolute URLs
export function normalizeMediaUrl(url: string): string {
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) {
    return `${import.meta.env.STRAPI_URL}${url}`;
  }
  return `${import.meta.env.STRAPI_URL}/${url}`;
}
```

---

### ⚠️ Pitfall 5: Build-Time Data Staleness

**Problem**: Static site shows outdated content.

**Symptoms**:
- New articles not appearing
- Updated content not reflected
- Need manual rebuild for changes

**Solution**:
```typescript
// Option 1: Use webhooks to trigger rebuild (see Webhooks section)

// Option 2: Use ISR (Incremental Static Regeneration)
// astro.config.mjs
export default defineConfig({
  output: 'server',  // Enable SSR for ISR
  adapter: node({ mode: 'standalone' }),
  
  // Configure revalidation
  vite: {
    ssr: {
      noExternal: ['@sensinum/astro-strapi-loader']
    }
  }
});

// In page: add revalidate header
export async function getStaticPaths() {
  const articles = await getCollection('articles');
  
  return articles.map(article => ({
    params: { slug: article.data.slug },
    props: { article },
    // Revalidate this page every hour
    revalidate: 3600
  }));
}
```

---

### ⚠️ Pitfall 6: Authentication Token Expiry

**Problem**: API calls fail after token expires.

**Symptoms**:
- 401 errors after some time
- Users logged out unexpectedly
- Protected routes inaccessible

**Solution**:
```typescript
// src/lib/auth.ts - Token refresh logic
export async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token = getAuthToken();
  
  const makeRequest = async (authToken: string) => {
    const response = await fetch(`${import.meta.env.STRAPI_URL}/api/${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.status === 401) {
      // Token expired, try to refresh
      const newToken = await refreshToken();
      if (newToken) {
        return makeRequest(newToken);
      }
      // If refresh fails, clear and redirect
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Authentication failed');
    }
    
    return response.json();
  };
  
  if (!token) {
    throw new Error('No authentication token');
  }
  
  return makeRequest(token);
}

async function refreshToken(): Promise<string | null> {
  // Implement token refresh logic
  // Could use refresh token endpoint or re-authenticate
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;
  
  const response = await fetch(`${import.meta.env.STRAPI_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  if (!response.ok) return null;
  
  const { jwt } = await response.json();
  localStorage.setItem('jwt', jwt);
  return jwt;
}
```

---

## TypeScript Types Reference {#typescript-types-reference}

**RAG Tags**: `#typescript` `#types` `#interfaces` `#reference` `#strapi` `#astro`

### Core Strapi Types

```typescript
// src/types/strapi.ts

// Base document interface (Strapi v5)
export interface StrapiDocument {
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  locale?: string;
}

// Media/File interface
export interface StrapiMedia {
  id: number;
  documentId: string;
  url: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: ImageFormat;
    small?: ImageFormat;
    medium?: ImageFormat;
    large?: ImageFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  provider: string;
  provider_metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  path?: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

// API Response wrapper
export interface StrapiCollectionResponse<T> {
  data: T[];
  meta: {
    pagination: PaginationMeta;
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta?: Record<string, any>;
}

// Error response
export interface StrapiError {
  error: {
    status: number;
    name: string;
    message: string;
    details?: Record<string, any>;
  };
}
```

---

### Content Type Interfaces

```typescript
// Article content type
export interface Article extends StrapiDocument {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;  // Markdown or rich text
  featured?: boolean;
  
  // Relations
  author?: Author;
  cover?: StrapiMedia;
  categories?: Category[];
  blocks?: DynamicZoneBlock[];
  
  // SEO
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaImage?: StrapiMedia;
  };
}

// Author content type
export interface Author extends StrapiDocument {
  name: string;
  slug: string;
  bio?: string;
  avatar?: StrapiMedia;
  email?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

// Category content type
export interface Category extends StrapiDocument {
  name: string;
  slug: string;
  description?: string;
}

// Page with dynamic zones
export interface Page extends StrapiDocument {
  title: string;
  slug: string;
  blocks: DynamicZoneBlock[];
}
```

---

### Dynamic Zone Block Types

```typescript
// Base block interface
export interface DynamicZoneBlock {
  __component: string;  // Component UID, e.g., 'blocks.text'
  id: number;
  documentId: string;
}

// Text block
export interface TextBlock extends DynamicZoneBlock {
  __component: 'blocks.text';
  content: string;  // Rich text
  alignment?: 'left' | 'center' | 'right';
}

// Image block
export interface ImageBlock extends DynamicZoneBlock {
  __component: 'blocks.image';
  image: StrapiMedia;
  caption?: string;
  width?: 'full' | 'wide' | 'normal';
}

// CTA block
export interface CTABlock extends DynamicZoneBlock {
  __component: 'blocks.cta';
  title: string;
  description?: string;
  button: {
    text: string;
    url: string;
    variant?: 'primary' | 'secondary' | 'outline';
  };
}

// Hero block
export interface HeroBlock extends DynamicZoneBlock {
  __component: 'blocks.hero';
  title: string;
  subtitle?: string;
  image?: StrapiMedia;
  cta?: {
    text: string;
    url: string;
  };
}

// Union type for all blocks
export type BlockType = TextBlock | ImageBlock | CTABlock | HeroBlock;
```

---

### Astro Content Collection Types

```typescript
// Extend Astro's collection types
declare module 'astro:content' {
  export interface CollectionEntry {
    articles: {
      data: Article;
      render(): {
        Content: import('astro').MarkdownInstance<Record<string, any>>['Content'];
      };
    };
    pages: {
      data: Page;
      render(): {
        Content: import('astro').MarkdownInstance<Record<string, any>>['Content'];
      };
    };
  }
}

// Helper type for getCollection results
export type ArticleCollection = CollectionEntry<'articles'>;
export type PageCollection = CollectionEntry<'pages'>;
```

---

### API Client Types

```typescript
// src/lib/types/api.ts

export interface FetchStrapiOptions {
  endpoint: string;
  query?: Record<string, string | number | boolean | string[]>;
  populate?: string | PopulateConfig;
  fields?: string[];
  locale?: string;
  status?: 'draft' | 'published';
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  token?: string;
}

export interface PopulateConfig {
  [key: string]: string | boolean | PopulateConfig;
  on?: {
    [componentUid: string]: PopulateConfig;
  };
}

export interface ApiError extends Error {
  status: number;
  details?: Record<string, any>;
}

// Type guard for API responses
export function isCollectionResponse<T>(response: any): response is StrapiCollectionResponse<T> {
  return response?.data && Array.isArray(response.data);
}

export function isSingleResponse<T>(response: any): response is StrapiSingleResponse<T> {
  return response?.data && !Array.isArray(response.data);
}

export function isErrorResponse(response: any): response is StrapiError {
  return response?.error?.status && response?.error?.message;
}
```

---

### Utility Types

```typescript
// src/lib/types/utils.ts

// Make all properties in T optional
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Make all properties in T required
export type Required<T> = {
  [P in keyof T]-?: T[P];
};

// Pick only certain properties
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Omit certain properties
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Extract only string keys
export type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

// Deep partial for nested objects
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Awaited type for promises
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
```

---

## Appendix: Quick Reference Cards {#appendix-quick-reference-cards}

### Astro + Strapi Quick Commands

```bash
# Start development
npm run dev  # Astro
npm run develop  # Strapi

# Build for production
npm run build  # Astro (generates /dist)
npm run build  # Strapi (builds admin panel)

# Preview production build
npm run preview  # Astro

# Type checking
npx astro check  # Astro
npx tsc --noEmit  # TypeScript

# Clear caches
rm -rf .astro node_modules/.cache  # Astro
rm -rf .cache build  # Strapi
```

### API Endpoint Quick Reference

```
# Content endpoints
GET  /api/articles              # List articles
GET  /api/articles/:id          # Get article
POST /api/articles              # Create article (auth required)
PUT  /api/articles/:id          # Update article (auth required)
DELETE /api/articles/:id        # Delete article (auth required)

# Query parameters
?populate=author,cover          # Include relations
?fields=title,slug,excerpt      # Select specific fields
?filters[published][$eq]=true   # Filter by field
?sort=publishedAt:desc          # Sort results
?pagination[page]=1&pageSize=10 # Paginate
?locale=en                      # Get specific locale
?status=published               # Draft or published

# Authentication
POST /api/auth/local            # Login
POST /api/auth/local/register   # Register
GET  /api/users/me              # Get current user (auth required)
```

### Common Populate Patterns

```typescript
// Simple populate
populate: ['author', 'categories']

// Nested populate
populate: {
  author: { populate: ['avatar'] },
  cover: true
}

// Dynamic zones (CRITICAL)
populate: {
  blocks: {
    on: {
      'text.block': { populate: ['content'] },
      'image.block': { populate: ['image'] }
    }
  }
}

// Fields selection
fields: ['title', 'slug', 'publishedAt']

// Combined
{
  fields: ['title', 'slug'],
  populate: {
    author: { fields: ['name'] },
    cover: { fields: ['url', 'formats.thumbnail.url'] }
  }
}
```

---

**Document End**

*This documentation is optimized for RAG systems and LLM coder agents working with Astro 6 + Strapi 5.3+ TypeScript projects. For the most up-to-date information, always refer to the official documentation at https://docs.astro.build and https://docs.strapi.io*

---

**Sources**:
- Astro Documentation: https://docs.astro.build
- Astro Strapi Loader: https://github.com/VirtusLab-Open-Source/astro-strapi-loader
- Astro Strapi Blocks: https://github.com/VirtusLab-Open-Source/astro-strapi-blocks
- Astro Strapi Starter: https://github.com/VirtusLab-Open-Source/astro-strapi-starter
- Strapi Documentation: https://docs.strapi.io

---

*Generated for Jimmy - Senior React/JS Developer*
*Astro 6 + Strapi 5.3+ TypeScript Blogging System with n8n/Flowise Integration*
*April 2026*
