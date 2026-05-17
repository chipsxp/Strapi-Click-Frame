// Strict TypeScript types for Strapi content types

export interface StrapiPhoto {
  id: number;
  documentId: string;
  title: string;
  description: string;
  image: StrapiMedia;
  author: StrapiUser;
  favorites: StrapiUser[];
  og_title?: string;
  og_description?: string;
  ik_file_id?: string;
  ik_url?: string;
  ik_thumbnail_url?: string;
  tags?: StrapiTag[];
  views: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiUser {
  id: number;
  documentId: string;
  username: string;
  email: string;
  photos?: StrapiPhoto[];
  favorite_photos?: StrapiPhoto[];
  bio?: string;
  avatar?: StrapiMedia;
}

export interface StrapiTag {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  photos?: StrapiPhoto[];
}

export interface StrapiMedia {
  id: number;
  documentId: string;
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiMediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: string;
}