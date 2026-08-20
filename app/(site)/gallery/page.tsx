import {ShowcaseCarousel} from "@/components/showcase-carousel";
import {site} from "@/lib/site";
import {sanityFetch} from "@/sanity/lib/live";
import {SCREENSHOTS_QUERY} from "@/sanity/lib/queries";
import type {ScreenshotItem} from "@/sanity/lib/types";
import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "Gallery",
  description: site.description,
};

export default async function GalleryPage() {
  const {data} = await sanityFetch({
    query: SCREENSHOTS_QUERY,
    stega: false,
  });

  return (
    <div className="w-full">
      <ShowcaseCarousel items={(data as ScreenshotItem[] | null) ?? []} />
    </div>
  );
}
