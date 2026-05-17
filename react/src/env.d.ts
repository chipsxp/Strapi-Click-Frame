/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: import("./types/strapi").StrapiUser | null;
    token?: string;
  }
}
