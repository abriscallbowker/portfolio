import {defineQuery} from "next-sanity";

const imageFields = /* groq */ `
  asset->{
    _id,
    url,
    metadata {
      lqip,
      dimensions { width, height }
    }
  },
  alt,
  hotspot,
  crop
`;

export const WRITING_LIST_QUERY = defineQuery(`
  *[_type == "writing" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    coverImage { ${imageFields} }
  }
`);

export const WRITING_SLUGS_QUERY = defineQuery(`
  *[_type == "writing" && defined(slug.current)] {
    "slug": slug.current
  }
`);

export const WRITING_BY_SLUG_QUERY = defineQuery(`
  *[_type == "writing" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    coverImage { ${imageFields} },
    body[] {
      ...,
      _type == "image" => {
        ...,
        ${imageFields},
        caption
      },
      _type == "video" => {
        ...,
        caption,
        asset->{
          _id,
          url,
          mimeType
        }
      }
    }
  }
`);

export const WRITING_MORE_QUERY = defineQuery(`
  *[_type == "writing" && defined(slug.current) && slug.current != $slug] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    coverImage { ${imageFields} }
  }
`);

export const SCREENSHOTS_QUERY = defineQuery(`
  *[_type == "screenshot" && (defined(image.asset) || defined(video.asset))] | order(date.year desc, date.month desc, _createdAt desc) {
    _id,
    title,
    type,
    date { month, year },
    description,
    linkedSlug,
    linkedSlugText,
    alt,
    image { ${imageFields} },
    video {
      asset->{
        _id,
        url,
        mimeType
      }
    }
  }
`);
