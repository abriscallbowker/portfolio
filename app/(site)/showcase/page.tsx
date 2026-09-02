import {ShowcaseCarousel} from "@/components/showcase-carousel";
import {site} from "@/lib/site";
import {sanityFetch} from "@/sanity/lib/live";
import {SCREENSHOTS_QUERY} from "@/sanity/lib/queries";
import type {ScreenshotItem} from "@/sanity/lib/types";
import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "Showcase",
  description: site.description,
};

export default async function ShowcasePage({
  searchParams,
}: {
  searchParams: Promise<{card?: string | string[]}>;
}) {
  const card = (await searchParams).card;
  const {data} = await sanityFetch({
    query: SCREENSHOTS_QUERY,
    stega: false,
  });

  return (
    <div className="w-full">
      <ShowcaseCarousel
        key={typeof card === "string" ? card : "default"}
        items={(data as ScreenshotItem[] | null) ?? []}
        initialActiveId={typeof card === "string" ? card : undefined}
      />
    </div>
  );
}
