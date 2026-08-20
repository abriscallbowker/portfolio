import {urlFor} from "@/sanity/lib/image";
import type {SanityImageValue} from "@/sanity/lib/types";

export const PHONE_ASPECT = 9 / 19.5;
export const SCREENSHOT_SOURCE_WIDTH = 1200;
export const SCREENSHOT_IMAGE_SIZES = "(min-width: 810px) 40vw, 92vw";

export function screenshotMediaUrl(image: SanityImageValue | null | undefined) {
  if (!image?.asset) return null;
  return urlFor(image).width(SCREENSHOT_SOURCE_WIDTH).url();
}

export function screenshotImageSize(image: SanityImageValue) {
  const dimensions = image.asset?.metadata?.dimensions;
  const width = dimensions?.width ?? 800;
  const height = dimensions?.height ?? Math.round(800 / PHONE_ASPECT);
  return {width, height};
}
