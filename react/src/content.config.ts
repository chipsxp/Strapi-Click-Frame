import { defineCollection } from 'astro:content';
import type { Loader } from 'astro/loaders';

// Ensure the environment variable is loaded (Astro handles .env natively)
const strapiUrl = import.meta.env.STRAPI_URL || process.env.STRAPI_URL || 'http://127.0.0.1:1337';
const clientConfig = { baseURL: `${strapiUrl}/api` };

async function fetchWithRetry(url: string, logger: any, retries = 3, timeout = 30000) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      
      if (res.ok) return res;
      
      logger.warn(`Fetch failed (${res.status}): ${url}. Attempt ${i + 1} of ${retries}`);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        logger.warn(`Fetch timed out: ${url}. Attempt ${i + 1} of ${retries}`);
      } else {
        logger.warn(`Fetch error: ${error.message}. Attempt ${i + 1} of ${retries}`);
      }
    }
    // Wait before retry (exponential backoff)
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
  }
  return null;
}

/**
 * Resilient loader for Strapi collection types with retries and custom timeouts.
 */
export function resilientStrapiLoader({ contentType, pluralContentType, clientConfig }: { contentType: string, pluralContentType: string, clientConfig: { baseURL: string } }): Loader {
  return {
    name: `strapi-${contentType}`,
    load: async ({ store, logger, parseData }) => {
      let page = 1;
      let totalPages = 1;
      
      while (page <= totalPages) {
        // We use documentId for ID to ensure Strapi 5 compatibility
        const url = `${clientConfig.baseURL}/${pluralContentType}?pagination[page]=${page}&pagination[pageSize]=100&populate=*`;
        logger.info(`[resilient-loader] Fetching ${url} (Page ${page})...`);
        
        const res = await fetchWithRetry(url, logger);
        
        if (!res || !res.ok) {
          logger.error(`[resilient-loader] Failed to fetch ${url} after multiple attempts.`);
          break;
        }
        
        const json = await res.json() as any;
        if (!json.data || !Array.isArray(json.data)) {
          logger.warn(`[resilient-loader] No data found for ${contentType}`);
          break;
        }
        
        for (const item of json.data) {
          // Strapi 5 uses documentId as the stable identifier
          const id = item.documentId || item.id;
          if (!id) continue;
          
          const parsed = await parseData({ id: String(id), data: item });
          store.set({ id: String(id), data: parsed });
        }
        
        totalPages = json.meta?.pagination?.pageCount || 1;
        page++;
      }
    }
  };
}

/**
 * Resilient loader for Strapi single types with retries and custom timeouts.
 */
export function resilientStrapiSingleLoader({ contentType, clientConfig }: { contentType: string, clientConfig: { baseURL: string } }): Loader {
  return {
    name: `strapi-single-${contentType}`,
    load: async ({ store, logger, parseData }) => {
      const url = `${clientConfig.baseURL}/${contentType}?populate=*`;
      logger.info(`[resilient-loader] Fetching single type ${url}...`);
      
      const res = await fetchWithRetry(url, logger);
      
      if (!res || !res.ok) {
        logger.error(`[resilient-loader] Failed to fetch single type ${url} after multiple attempts.`);
        return;
      }
      
      const json = await res.json() as any;
      if (!json.data) {
        logger.warn(`[resilient-loader] No data found for single type ${contentType}`);
        return;
      }
      
      const data = json.data;
      const id = data.documentId || data.id || contentType;
      const parsed = await parseData({ id: String(id), data });
      store.set({ id: String(id), data: parsed });
    }
  };
}

const photo = defineCollection({
  loader: resilientStrapiLoader({ contentType: 'photo', pluralContentType: 'photos', clientConfig }),
});

const tag = defineCollection({
  loader: resilientStrapiLoader({ contentType: 'tag', pluralContentType: 'tags', clientConfig }),
});

const reaction = defineCollection({
  loader: resilientStrapiLoader({ contentType: 'reaction', pluralContentType: 'reactions', clientConfig }),
});

const comment = defineCollection({
  loader: resilientStrapiLoader({ contentType: 'comment', pluralContentType: 'comments', clientConfig }),
});

const category = defineCollection({
  loader: resilientStrapiLoader({ contentType: 'category', pluralContentType: 'categories', clientConfig }),
});

const about = defineCollection({
  loader: resilientStrapiSingleLoader({ contentType: 'about', clientConfig }),
});

const global = defineCollection({
  loader: resilientStrapiSingleLoader({ contentType: 'global', clientConfig }),
});

export const collections = { photo, tag, reaction, comment, category, about, global };
