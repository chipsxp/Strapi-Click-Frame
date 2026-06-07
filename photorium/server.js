'use strict';

const strapi = require('@strapi/strapi');

// Strapi 5 requires createStrapi() and needs to know where the compiled code lives (distDir)
const app = strapi.createStrapi({ distDir: './dist' });

app.start();
