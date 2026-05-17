# Strapi CMS Complete Documentation

> **Note**: This file contains the complete Strapi CMS documentation compiled from official sources including llms.txt files and documentation pages.
> 
> **Versions Covered**: Strapi v4 and Strapi v5
> 
> **Last Updated**: April 2026
> 
> **Source**: https://docs.strapi.io and https://docs-v4.strapi.io

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Installation](#installation)
3. [Strapi v5 Documentation Index](#strapi-v5-documentation)
4. [Strapi v4 Documentation Index](#strapi-v4-documentation)
5. [API Reference](#api-reference)
6. [Backend Customization](#backend-customization)
7. [Admin Panel](#admin-panel)
8. [Plugins Development](#plugins-development)
9. [Configuration](#configuration)
10. [Deployment](#deployment)
11. [Features](#features)
12. [Migration Guides](#migration-guides)
13. [Cloud Documentation](#cloud-documentation)

---

## Getting Started

### Quick Start Guide

Get Strapi, your favorite open-source headless CMS, up and running in less than 3 minutes.

**Prerequisites:**
- Node.js (LTS version recommended)
- npm or yarn package manager
- A supported database (SQLite, PostgreSQL, MySQL, MariaDB)

**Installation Command:**
```bash
npx create-strapi-app@latest my-project --quickstart
```

---

## Installation

### CLI Installation
Fast-track local install for getting Strapi running on your computer in less than a minute.

### Docker Installation
Quickly create a Docker container from a local project.

### Additional Installation Options
- Manual installation with custom database configuration
- Enterprise edition installation
- Cloud deployment setup

---

## Strapi v5 Documentation

### Core Concepts

#### Introduction
Welcome to the Strapi CMS Documentation! Strapi is an open-source headless CMS that gives developers the freedom to choose their favorite tools and frameworks and allows editors to easily manage and distribute content.

#### Project Structure
Discover the project structure of any default Strapi application:
```
my-project/
├── config/
│   ├── admin.js
│   ├── api.js
│   ├── database.js
│   ├── middlewares.js
│   ├── plugins.js
│   └── server.js
├── public/
├── src/
│   ├── admin/
│   │   ├── app.example.js
│   │   └── webpack.config.example.js
│   ├── api/
│   ├── components/
│   ├── content-types/
│   ├── controllers/
│   ├── middlewares/
│   ├── policies/
│   ├── services/
│   └── index.js
├── types/
├── .gitignore
├── .strapi-updater.json
├── package.json
├── README.md
└── tsconfig.json
```

### API Documentation

#### Content API
Learn more about Strapi 5's Content API for interacting with your content-types.

#### REST API Reference
Interact with your Content-Types using the REST API endpoints Strapi generates for you.

**Key Parameters:**
- `filters`: Filter results based on field values
- `populate`: Include relations, media fields, components, and dynamic zones
- `fields`: Return only specific fields
- `sort`: Order results by field values
- `pagination`: Paginate results with page and pageSize
- `locale`: Work with internationalization
- `status`: Work with draft or published versions

#### Document Service API
The Document Service API is the recommended way to interact with your content from the back-end server or from plugins.

**Key Features:**
- Field selection and population
- Advanced filtering capabilities
- Locale support for internationalization
- Draft & Publish workflow integration
- Middleware extension points
- Sort and pagination support

#### GraphQL API
Use GraphQL to query and mutate your Strapi content with a flexible query language.

#### Entity Service API
The Entity Service handles Strapi's complex data structures like components and dynamic zones.

### Backend Customization

#### Controllers
Controllers bundle actions that handle business logic for each route within Strapi's MVC pattern.

```javascript
// Example: Custom controller
module.exports = {
  async find(ctx) {
    const entries = await strapi.service('api::article.article').find();
    return { data: entries };
  },
  
  async create(ctx) {
    const entry = await strapi.service('api::article.article').create(ctx.request.body);
    return { data: entry };
  }
};
```

#### Services
Services store reusable functions to keep controllers concise and follow DRY principles.

```javascript
// Example: Custom service
module.exports = {
  async findWithAuthor(params) {
    return await strapi.documents('api::article.article').findMany({
      ...params,
      populate: ['author']
    });
  }
};
```

#### Models
Models define Strapi's content structure via content-types and reusable components.

#### Routes
Routes map incoming URLs to controllers and ship pre-generated for each content type.

#### Middlewares
Middlewares alter the request or response flow at application or API levels.

#### Policies
Policies execute before controllers to enforce authorization or other checks on routes.

#### Webhooks
Webhooks let Strapi notify external systems when content changes.

### Admin Panel Customization

#### Overview
The admin panel can be tailored to match your branding and workflow needs.

#### Customization Options:
- **Logos**: Update login and navigation logos (prefer SVG for crisp rendering)
- **Favicon**: Replace the favicon displayed in Strapi's admin panel
- **Theme Extension**: Extend Strapi's admin panel theme with custom colors and styles
- **Locales & Translations**: Configure admin panel languages and override default strings
- **Homepage Customization**: Add custom widgets to the admin panel homepage
- **Rich Text Editor**: Customize the WYSIWYG editor with plugins and configurations
- **Bundlers**: Choose between Webpack, Vite, or other JavaScript bundlers

### Configuration

#### Environment Variables
Strapi-specific environment variables and .env usage enable per-environment configs.

```env
# Database Configuration
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi

# Server Configuration
HOST=0.0.0.0
PORT=1337
APP_KEYS=toBeModified1,toBeModified2
API_TOKEN_SALT=toBeModified
ADMIN_JWT_SECRET=toBeModified
JWT_SECRET=toBeModified
TRANSFER_TOKEN_SALT=toBeModified
```

#### Database Configuration
/config/database defines connections, clients, and pooling for supported databases.

#### Server Configuration
/config/server manages host, port, URL, proxy, cron, and more.

#### API Configuration
/config/api centralizes response privacy, REST defaults, and parameter validation.

#### Plugins Configuration
/config/plugins enables or disables plugins and overrides their settings.

### Features

#### Content Manager
The Content Manager is Strapi's interface for browsing and editing entries.

#### Content-type Builder
The Content-type Builder is a tool for designing content types and components.

#### Media Library
Media Library centralizes all uploaded assets with search, filters, and folder organization.

#### Internationalization (i18n)
Internationalization manages content in multiple locales directly from the admin panel.

#### Draft & Publish
Draft & Publish separates drafts from live entries, allowing editors to stage content before release.

#### Role-Based Access Control (RBAC)
RBAC manages administrator roles and granular permissions in the admin panel.

#### API Tokens
API tokens provide scoped authentication for REST and GraphQL requests without exposing user credentials.

#### Users & Permissions
Users & Permissions manages end-user accounts, JWT-based authentication, and role-based access to APIs.

#### Review Workflows
Review Workflows define custom multi-stage pipelines for content review.

#### Releases
Releases group entries into publishable batches to trigger simultaneous publish or unpublish actions.

#### Audit Logs
Audit Logs captures every administrative action in a searchable, filterable history.

#### Content History
Content History stores previous document versions so editors can compare and restore earlier states.

### Plugins Development

#### Plugin Creation & Setup
The Plugin SDK generates plugins without a Strapi project and links them to an existing app.

**Basic Plugin Structure:**
```
my-plugin/
├── admin/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── index.js
│   └── package.json
├── server/
│   ├── config/
│   ├── content-types/
│   ├── controllers/
│   ├── middlewares/
│   ├── policies/
│   ├── routes/
│   ├── services/
│   └── index.js
├── package.json
└── strapi-admin.js
```

#### Server API for Plugins
The Server API defines what a plugin registers, exposes, and executes on the Strapi server.

#### Admin Panel API for Plugins
The Admin Panel API exposes register, bootstrap, and registerTrads hooks to inject React components.

#### Content Manager APIs
Content Manager APIs add panels and actions to list or edit views through addEditViewSidePanel, addDocumentAction, etc.

#### Plugin Guides
- How to create admin permissions from plugins
- How to create components for Strapi plugins
- How to pass data from server to admin panel
- How to store and access data from a Strapi plugin

### Testing

Testing relies on Jest and Supertest with an in-memory SQLite database.

```javascript
// Example test
const { createStrapiInstance } = require('test-utils');

describe('Article API', () => {
  let strapi;
  
  beforeAll(async () => {
    strapi = await createStrapiInstance();
  });
  
  test('should create article', async () => {
    const article = await strapi.service('api::article.article').create({
      data: { title: 'Test Article' }
    });
    expect(article.title).toBe('Test Article');
  });
});
```

### TypeScript Support

#### Adding TypeScript Support
Learn how to add TypeScript support to an existing Strapi project.

#### Development with TypeScript
Strapi typings provide autocompletion, schema type generation with `ts:generate-types`, and programmatic server starts.

### Migration Guides

#### Upgrading to Strapi 5
- Breaking changes between v4 and v5
- Step-by-step upgrade guide
- Additional resources for specific use cases

#### Key Breaking Changes in v5:
- GraphQL API updated with flattened response format
- Internationalization (i18n) is now part of Strapi core
- Templates are now regular, standalone Strapi applications
- Design System updates with new component structure and APIs
- Webpack aliases removed in favor of simplified aliasing

---

## Strapi v4 Documentation

### Core Concepts (v4)

#### Entity Service API (v4)
The Entity Service is the layer that handles Strapi's complex data structures like components and dynamic zones.

#### Query Engine API (v4)
Strapi provides a Query Engine API to give unrestricted internal access to the database layer.

#### REST API Reference (v4)
Interact with your Content-Types using the REST API endpoints Strapi generates for you.

### Backend Customization (v4)

#### Controllers (v4)
Controllers handle business logic and can be extended using createCoreController.

#### Services (v4)
Services contain reusable business logic and can be extended using createCoreService.

#### Models (v4)
Models define content structure via schema.json files in content-types.

### Configuration (v4)

#### Admin Panel Configuration (v4)
Strapi's admin panel offers a single entry point file for its configuration at `config/admin.js`.

#### Database Configuration (v4)
Strapi offers a single entry point file to configure its databases at `config/database.js`.

### Plugins (v4)

#### Built-in Plugins:
- **i18n**: Internationalization for multi-language content
- **GraphQL**: GraphQL endpoint for flexible querying
- **Users & Permissions**: Authentication and authorization
- **Upload**: File upload management with provider support
- **Email**: Transactional email sending
- **Documentation**: Auto-generated OpenAPI/Swagger docs

### Migration (v3 to v4)

#### Code Migration:
- Configuration files restructuring
- Content-Type schema updates
- Controllers and services migration
- Dependencies and package updates
- Global middleware configuration
- GraphQL resolvers updates
- Policies and routes migration
- Webpack configuration changes

#### Data Migration:
- MongoDB to SQL migration guide
- SQL database migration from v3 to v4
- Relations cheatsheet for schema differences

---

## Strapi Cloud Documentation

### Getting Started with Strapi Cloud

#### Cloud Fundamentals
Before using Strapi Cloud, understand the main concepts:
- Projects and environments
- Deployment workflows
- Billing and usage models
- Collaboration features

#### Deployment Options
- **Dashboard Deployment**: Deploy via the Strapi Cloud web interface
- **CLI Deployment**: Deploy using the Strapi Cloud CLI
- **Git Integration**: Automatic deployments on git pushes

### Project Management

#### Collaboration
Project owners invite maintainers through the Share button, manage pending invitations, and revoke access.

#### Deployments Management
- Manual or automatic deployment triggers
- Cancel active builds from dashboard or CLI
- View deployment status and progress

#### Deployment History & Logs
- List every build with status
- Deep inspection of build and runtime logs
- Filter and search deployment history

#### Runtime Logs
- Stream live server output
- Free plan logs reset when apps scale to zero
- Access logs via dashboard or CLI

### Advanced Configuration

#### Database Configuration
Default PostgreSQL can be swapped for any supported SQL database by aligning configuration and environment variables.

#### Email Provider Configuration
Third-party email services integrate through plugins and environment variables to replace the default sender.

#### Upload Provider Configuration
External storage like S3 or Cloudinary requires plugin setup, security middleware, and Cloud variables.

#### Caching & Performance
Edge caching via Cache-Control headers reduces latency and server load for heavy static content.

### Billing & Usage

#### Account Billing & Invoices
Manage billing details and invoices for your Strapi Cloud account on the Profile page.

#### Profile Settings
Settings include account details, connected accounts, and account deletion options.

#### Usage Information
General information related to the usage and billing of your Strapi Cloud account and projects.

---

## API Quick Reference

### REST API Examples

#### Fetch Articles with Filters
```bash
GET /api/articles?filters[title][$contains]=strapi&populate=author
```

#### Create New Article
```bash
POST /api/articles
Content-Type: application/json

{
  "data": {
    "title": "My Article",
    "content": "Article content here",
    "author": {
      "connect": [1]
    }
  }
}
```

#### Update Article
```bash
PUT /api/articles/1
Content-Type: application/json

{
  "data": {
    "title": "Updated Title"
  }
}
```

#### Delete Article
```bash
DELETE /api/articles/1
```

### GraphQL Examples

#### Query Articles
```graphql
query {
  articles(filters: { title: { contains: "strapi" } }) {
    data {
      id
      attributes {
        title
        content
        author {
          data {
            attributes {
              name
            }
          }
        }
      }
    }
  }
}
```

#### Mutation: Create Article
```graphql
mutation {
  createArticle(data: { title: "New Article", content: "Content here" }) {
    data {
      id
      attributes {
        title
        publishedAt
      }
    }
  }
}
```

### Document Service API Examples

#### Find Many with Populate
```javascript
const articles = await strapi.documents('api::article.article').findMany({
  filters: { published: true },
  populate: ['author', 'cover'],
  fields: ['title', 'slug'],
  sort: { publishedAt: 'desc' },
  pagination: { page: 1, pageSize: 10 }
});
```

#### Create Document
```javascript
const article = await strapi.documents('api::article.article').create({
  data: {
    title: 'My Article',
    content: 'Content here',
    published: true
  }
});
```

---

## Best Practices

### Security
- Always validate and sanitize user input
- Use API tokens with minimal required permissions
- Enable rate limiting for public APIs
- Keep dependencies updated
- Use environment variables for sensitive configuration

### Performance
- Implement proper indexing on frequently queried fields
- Use pagination for large datasets
- Enable caching for static content
- Optimize image uploads with compression
- Use CDN for media assets

### Development Workflow
- Use version control (Git) for all changes
- Write tests for critical functionality
- Document custom code and configurations
- Use TypeScript for type safety in larger projects
- Follow Strapi's coding conventions

### Content Modeling
- Plan your content structure before implementation
- Use components for reusable content blocks
- Leverage dynamic zones for flexible content
- Implement proper relations between content types
- Consider internationalization from the start

---

## Troubleshooting

### Common Issues

#### Database Connection Errors
- Verify database credentials in config/database.js
- Ensure database server is running and accessible
- Check firewall rules and network configuration
- Verify database user permissions

#### Build Errors
- Clear node_modules and reinstall dependencies
- Check Node.js version compatibility
- Verify TypeScript configuration if using TS
- Review webpack/vite configuration for customizations

#### Admin Panel Issues
- Clear browser cache and cookies
- Rebuild admin panel with `npm run build`
- Check for plugin conflicts
- Review browser console for JavaScript errors

#### API Errors
- Verify API token permissions and scopes
- Check request headers and content-type
- Review server logs for detailed error messages
- Validate request payload structure

### Getting Help

- **Documentation**: https://docs.strapi.io
- **Community Forum**: https://forum.strapi.io
- **GitHub Issues**: https://github.com/strapi/strapi/issues
- **Discord Community**: https://discord.strapi.io
- **Stack Overflow**: Tag questions with `strapi`

---

## Resources

### Official Links
- Website: https://strapi.io
- Documentation: https://docs.strapi.io
- GitHub: https://github.com/strapi/strapi
- Marketplace: https://market.strapi.io
- Blog: https://strapi.io/blog

### Learning Resources
- Strapi Masterclass (YouTube)
- Official tutorials and guides
- Community-contributed tutorials
- Example projects and templates

### Tools & Extensions
- Strapi CLI for project management
- Plugin SDK for extending functionality
- OpenAPI generator for API documentation
- Data transfer tool for migrations

---

## Appendix: Command Line Reference

### Strapi CLI Commands

```bash
# Create new project
npx create-strapi-app@latest my-project

# Start development server
npm run develop

# Build admin panel
npm run build

# Start production server
npm run start

# Generate new content-type
npm run strapi generate:content-type

# Run database migrations
npm run strapi migrate:up

# Export data
npm run strapi data:export

# Import data
npm run strapi data:import

# Transfer data between instances
npm run strapi data:transfer

# Generate TypeScript types
npm run strapi ts:generate-types

# List all available commands
npm run strapi --help
```

### Plugin CLI Commands

```bash
# Create new plugin
npx @strapi/plugin-cli@latest create my-plugin

# Link plugin to project
npm run watch:link

# Build plugin for distribution
npm run build

# Publish to npm
npm publish
```

---

> **Disclaimer**: This documentation compilation is based on official Strapi documentation available at the time of creation. For the most up-to-date information, always refer to the official documentation at https://docs.strapi.io.
> 
> **License**: Strapi is open-source software licensed under the MIT License. See https://github.com/strapi/strapi/blob/master/LICENSE for details.

---

*Document compiled for Jimmy - Senior React/JS Developer*
*Generated: April 2026*
