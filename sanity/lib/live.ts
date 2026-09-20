import {defineLive} from "next-sanity/live";
import {client} from "./client";

const token = process.env.SANITY_API_READ_TOKEN;

const live = defineLive({
  client,
  // `false` silences the setup warning when no read token is configured.
  // Published documents still live-update; drafts need a Viewer token.
  serverToken: token || false,
  browserToken: token || false,
});

export const SanityLive = live.SanityLive;

type SanityFetch = typeof live.sanityFetch;

// next-sanity's live helper caches with a ~1 year cacheLife and relies on
// <SanityLive /> to expire tags. In development that cache is easy to miss
// (page closed while publishing, live socket not connected), so fetch
// published documents uncached from the API instead.
export const sanityFetch: SanityFetch = async (options) => {
  if (process.env.NODE_ENV !== "production") {
    const params = await Promise.resolve(options.params ?? {});
    const data = await client.fetch(options.query, params, {
      perspective: options.perspective ?? "published",
      stega: options.stega ?? false,
      useCdn: false,
    });
    return {data, sourceMap: null, tags: []};
  }

  return live.sanityFetch(options);
};
