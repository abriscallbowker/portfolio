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
  coverImage?: SanityImageValue | null;
};

export type WritingDetail = WritingListItem & {
  body?: unknown[] | null;
};
