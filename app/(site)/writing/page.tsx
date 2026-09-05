import {WritingList} from "@/components/writing-list";
import {preloadAboutImages} from "@/lib/preload-about-images";
import {preloadGalleryImages} from "@/lib/preload-gallery-images";
import {site} from "@/lib/site";
import {sanityFetch} from "@/sanity/lib/live";
import {WRITING_LIST_QUERY} from "@/sanity/lib/queries";
import type {WritingListItem} from "@/sanity/lib/types";
import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "Writing",
  description: site.description,
};

export default async function WritingPage() {
  preloadAboutImages();

  const [{data}] = await Promise.all([
    sanityFetch({
      query: WRITING_LIST_QUERY,
      stega: false,
    }),
    preloadGalleryImages(),
  ]);

  return (
    <div className="site-column w-full -mb-48 pb-10">
      <WritingList
        posts={(data as WritingListItem[] | null) ?? []}
        filterable
      />
    </div>
  );
}
