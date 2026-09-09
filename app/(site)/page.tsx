import {ShowcaseCarousel} from "@/components/showcase-carousel";
import {preloadAboutImages} from "@/lib/preload-about-images";
import {sanityFetch} from "@/sanity/lib/live";
import {SCREENSHOTS_QUERY} from "@/sanity/lib/queries";
import type {ScreenshotItem} from "@/sanity/lib/types";

export default async function ShowcasePage() {
  preloadAboutImages();
  const {data} = await sanityFetch({
    query: SCREENSHOTS_QUERY,
    stega: false,
  });

  return (
    <div className="w-full">
      <ShowcaseCarousel
        items={(data as ScreenshotItem[] | null) ?? []}
      />
    </div>
  );
}
