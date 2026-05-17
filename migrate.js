const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'schema-types');
const destDir = path.join(__dirname, 'photorium');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function writeBoilerplate(apiName) {
    const apiDir = path.join(destDir, 'src', 'api', apiName);
    
    // controllers
    ensureDir(path.join(apiDir, 'controllers'));
    fs.writeFileSync(path.join(apiDir, 'controllers', `${apiName}.ts`), `/**
 * ${apiName} controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::${apiName}.${apiName}');
`);

    // routes
    ensureDir(path.join(apiDir, 'routes'));
    fs.writeFileSync(path.join(apiDir, 'routes', `${apiName}.ts`), `/**
 * ${apiName} router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::${apiName}.${apiName}');
`);

    // services
    ensureDir(path.join(apiDir, 'services'));
    fs.writeFileSync(path.join(apiDir, 'services', `${apiName}.ts`), `/**
 * ${apiName} service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::${apiName}.${apiName}');
`);
}

// 1. Setup category schema
const categorySchemaDest = path.join(destDir, 'src', 'api', 'category', 'content-types', 'category');
ensureDir(categorySchemaDest);
fs.copyFileSync(
    path.join(srcDir, 'api_category_content-types_schema.json'),
    path.join(categorySchemaDest, 'schema.json')
);

// 2. Setup comment api
writeBoilerplate('comment');
const commentSchemaDest = path.join(destDir, 'src', 'api', 'comment', 'content-types', 'comment');
ensureDir(commentSchemaDest);
fs.copyFileSync(
    path.join(srcDir, 'api_comment_content-types_schema.json'),
    path.join(commentSchemaDest, 'schema.json')
);
fs.copyFileSync(
    path.join(srcDir, 'api_comment_max1-reply_lifecycles.ts'),
    path.join(commentSchemaDest, 'lifecycles.ts')
);

// 3. Setup photo api
writeBoilerplate('photo');
const photoSchemaDest = path.join(destDir, 'src', 'api', 'photo', 'content-types', 'photo');
ensureDir(photoSchemaDest);
fs.copyFileSync(
    path.join(srcDir, 'api_photo_content-types_schema.json'),
    path.join(photoSchemaDest, 'schema.json')
);

// merge photo lifecycles
const photoLifecycleContent = `export default {
  async beforeCreate(event) {
    const { tags } = event.params.data;
    if (tags && tags.length > 3) {
      throw new Error('Maximum 3 tags allowed per photo');
    }
  },
  async beforeUpdate(event) {
    const { tags } = event.params.data;
    if (tags && tags.length > 3) {
      throw new Error('Maximum 3 tags allowed per photo');
    }
  },
  async afterCreate(event) {
    const { image } = event.result;
    if (image && image.provider === 'imagekit') {
      await strapi.entityService.update('api::photo.photo', event.result.id, {
        data: {
          ik_file_id: image.fileId,
          ik_url: image.url,
          ik_thumbnail_url: image.thumbnailUrl
        }
      });
    }
  }
};
`;
fs.writeFileSync(path.join(photoSchemaDest, 'lifecycles.ts'), photoLifecycleContent);

// 4. Setup reaction api
writeBoilerplate('reaction');
const reactionSchemaDest = path.join(destDir, 'src', 'api', 'reaction', 'content-types', 'reaction');
ensureDir(reactionSchemaDest);

// merge reaction schema with indexes
const reactionSchemaStr = fs.readFileSync(path.join(srcDir, 'api_reactions_content-types_schema.json'), 'utf8');
const reactionSchemaObj = JSON.parse(reactionSchemaStr);
reactionSchemaObj.indexes = [
  {
    "name": "unique_user_photo_type",
    "columns": ["user", "photo", "type"],
    "type": "unique"
  }
];
fs.writeFileSync(path.join(reactionSchemaDest, 'schema.json'), JSON.stringify(reactionSchemaObj, null, 2));

fs.copyFileSync(
    path.join(srcDir, 'api_reaction-count-caching_lifecycles.ts'),
    path.join(reactionSchemaDest, 'lifecycles.ts')
);

// 5. Setup tag api
writeBoilerplate('tag');
const tagSchemaDest = path.join(destDir, 'src', 'api', 'tag', 'content-types', 'tag');
ensureDir(tagSchemaDest);
fs.copyFileSync(
    path.join(srcDir, 'api_tags_content-types_schema.json'),
    path.join(tagSchemaDest, 'schema.json')
);

// 6. Setup users-permissions extensions
const userExtDest = path.join(destDir, 'src', 'extensions', 'users-permissions', 'content-types', 'user');
ensureDir(userExtDest);
fs.copyFileSync(
    path.join(srcDir, 'extensions_users-permissions_content-types_schema.json'),
    path.join(userExtDest, 'schema.json')
);

// 7. Setup plugins.ts
const pluginsContent = `import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  upload: {
    config: {
      provider: '@strapi-community/provider-upload-imagekit',
      providerOptions: {
        publicKey: env('IMAGEKIT_PUBLIC_KEY'),
        privateKey: env('IMAGEKIT_PRIVATE_KEY'),
        urlEndpoint: env('IMAGEKIT_URL_ENDPOINT'),
        transformation: {
          format: 'webp,avif',
          quality: 80,
        },
      },
      sizeLimit: 15 * 1024 * 1024, // 15MB max
    },
  },
});

export default config;
`;
fs.writeFileSync(path.join(destDir, 'config', 'plugins.ts'), pluginsContent);

// 8. Setup types
ensureDir(path.join(destDir, 'types'));
fs.copyFileSync(
    path.join(srcDir, 'types-strapi-ts.ts'),
    path.join(destDir, 'types', 'types-strapi-ts.ts')
);

console.log("Migration script complete.");
