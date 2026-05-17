import { defineCollection } from 'astro:content';
import { strapiLoader } from 'strapi-community-astro-loader';
import type { Loader } from 'astro/loaders';

// Ensure the environment variable is loaded (Astro handles .env natively)
const strapiUrl = import.meta.env.STRAPI_URL || process.env.STRAPI_URL || 'http://localhost:1337';
const clientConfig = { baseURL: `${strapiUrl}/api` };

export function strapiSingleLoader({ contentType, clientConfig }: { contentType: string, clientConfig: { baseURL: string } }): Loader {
  return {
    name: `strapi-single-${contentType}`,
    load: async ({ store, logger, parseData }) => {
      const url = `${clientConfig.baseURL}/${contentType}`;
      logger.info(`Fetching ${url}`);
      const res = await fetch(url);
      if (!res.ok) {
        logger.error(`Failed to fetch ${url}: ${res.statusText}`);
        return;
      }
      const json = await res.json();
      if (!json.data) return;
      const data = json.data;
      const id = data.documentId || data.id || contentType;
      const parsed = await parseData({ id: String(id), data });
      store.set({ id: String(id), data: parsed });
    }
  };
}

const photo = defineCollection({
  loader: strapiLoader({ contentType: 'photo', pluralContentType: 'photos', clientConfig }),
});

const tag = defineCollection({
  loader: strapiLoader({ contentType: 'tag', pluralContentType: 'tags', clientConfig }),
});

const reaction = defineCollection({
  loader: strapiLoader({ contentType: 'reaction', pluralContentType: 'reactions', clientConfig }),
});

const comment = defineCollection({
  loader: strapiLoader({ contentType: 'comment', pluralContentType: 'comments', clientConfig }),
});

const category = defineCollection({
  loader: strapiLoader({ contentType: 'category', pluralContentType: 'categories', clientConfig }),
});

const about = defineCollection({
  loader: strapiSingleLoader({ contentType: 'about', clientConfig }),
});

const global = defineCollection({
  loader: strapiSingleLoader({ contentType: 'global', clientConfig }),
});

export const collections = { photo, tag, reaction, comment, category, about, global };
