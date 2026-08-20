import {
  SCREENSHOT_IMAGE_SIZES,
  screenshotImageSize,
  screenshotMediaUrl,
} from "@/lib/screenshot-media";
import {sanityFetch} from "@/sanity/lib/live";
import {SCREENSHOTS_QUERY} from "@/sanity/lib/queries";
import type {ScreenshotItem} from "@/sanity/lib/types";
import {getImageProps} from "next/image";
import {preload} from "react-dom";

export async function preloadGalleryImages() {
  const {data} = await sanityFetch({
    query: SCREENSHOTS_QUERY,
    stega: false,
  });

  const items = (data as ScreenshotItem[] | null) ?? [];
  for (const item of interleaveFromEnds(items)) {
    preloadGalleryItem(item);
  }
}

function interleaveFromEnds<T>(items: T[]) {
  const ordered: T[] = [];
  let newest = 0;
  let oldest = items.length - 1;

  while (newest <= oldest) {
    ordered.push(items[newest]);
    if (newest !== oldest) ordered.push(items[oldest]);
    newest += 1;
    oldest -= 1;
  }

  return ordered;
}

function preloadGalleryItem(item: ScreenshotItem) {
  const image = item.image?.asset ? item.image : null;
  const src = screenshotMediaUrl(image);
  if (!image || !src) return;

  if (item.video?.asset?.url) {
    preload(src, {as: "image", fetchPriority: "low"});
    return;
  }

  const {width, height} = screenshotImageSize(image);
  const {props} = getImageProps({
    src,
    alt: item.alt || item.title,
    width,
    height,
    sizes: SCREENSHOT_IMAGE_SIZES,
  });

  preload(props.src, {
    as: "image",
    imageSrcSet: props.srcSet,
    imageSizes: props.sizes,
    fetchPriority: "low",
  });
}
