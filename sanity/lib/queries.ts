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
        ${imageFields}
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
