import type {WritingCategory} from "@/lib/writing";

export type {WritingCategory};

export type SanityImageValue = {
  _type?: "image";
  alt?: string;
  hotspot?: unknown;
  crop?: unknown;
  asset?: {
    _id?: string;
    url?: string;
    metadata?: {
      lqip?: string;
      dimensions?: {width: number; height: number};
    };
  };
};

export type WritingListItem = {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  category?: WritingCategory | null;
  coverImage?: SanityImageValue | null;
};

export type WritingDetail = WritingListItem & {
  body?: unknown[] | null;
};

export type ScreenshotItem = {
  _id: string;
  title: string;
  type?: "mobile" | "laptop" | null;
  date?: {
    month?: number | null;
    year?: number | null;
  } | null;
  description?: string | null;
  linkedSlug?: string | null;
  linkedSlugText?: string | null;
  alt?: string | null;
  image?: SanityImageValue | null;
  video?: {
    asset?: {
      _id?: string;
      url?: string;
      mimeType?: string;
    } | null;
  } | null;
};
