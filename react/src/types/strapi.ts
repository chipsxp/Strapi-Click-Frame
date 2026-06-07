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
  classic_munch_count: number;
  cheddar_munch_count: number;
  categories?: StrapiCategory[];
  createdAt: string;
  updatedAt: string;
  comments?: StrapiComment[];
}

export interface StrapiComment {
  id: number;
  documentId: string;
  content: string;
  author: StrapiUser;
  photo: StrapiPhoto | number;
  parent?: StrapiComment;
  reply?: StrapiComment;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiUser {
  id: number;
  documentId: string;
  username: string;
  email: string;
  nickname?: string;
  photos?: StrapiPhoto[];
  favorite_photos?: StrapiPhoto[];
  bio?: string;
  avatar?: StrapiMedia;
  cheddar_munch_balance?: number;
  classic_munch_given_total?: number;
  last_classic_munch_at?: string;
  following?: StrapiUser[];
  followers?: StrapiUser[];
  role?: {
    id: number;
    name: string;
    type: string;
  };
}

export interface StrapiCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  user?: StrapiUser;
  photos?: StrapiPhoto[];
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
  data?: {
    id: number;
    attributes: {
      url: string;
      alternativeText?: string;
      caption?: string;
      width?: number;
      height?: number;
    };
  };
}

export interface StrapiProfileConfig {
  id: number;
  documentId: string;
  cover_images?: StrapiMedia[];
  total_users_display?: number;
  total_munching_display?: number;
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

export interface StrapiSeo {
  metaTitle: string;
  metaDescription: string;
  shareImage?: StrapiMedia;
  metaViewport?: string;
  canonicalURL?: string;
}

export interface StrapiGlobal {
  id: number;
  documentId: string;
  siteName: string;
  siteDescription: string;
  favicon?: StrapiMedia;
  defaultSeo: StrapiSeo;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiDonation {
  id: number;
  documentId: string;
  amount: number;
  isAnonymous: boolean;
  user?: StrapiUser;
  nickname?: string;
  month: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiCommunityStats {
  community: {
    total_users: number;
    total_photos: number;
    total_munching: number;
    monthly_total_donation: number;
    monthly_chips: number;
    monthly_cheddar: number;
    top_donors: {
      nickname: string;
      amount: number;
    }[];
    top_followed: {
      nickname: string;
      followers: number;
    }[];
    top_photos_chips: StrapiPhoto[];
    top_photos_cheddar: StrapiPhoto[];
    top_photos_clicks: StrapiPhoto[];
  };
  user: {
    classic_munch_given_total: number;
    cheddar_munch_balance: number;
    total_photos_fried: number;
    total_followers: number;
    total_following: number;
    total_donations_given: number;
  } | null;
}