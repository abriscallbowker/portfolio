import {experience, music, personalPhotos} from "@/lib/site";
import {getImageProps} from "next/image";
import {preload} from "react-dom";

export function preloadAboutImages() {
  for (const photo of personalPhotos) {
    preloadNextImage({
      src: photo.src,
      alt: photo.alt,
      fill: true,
      sizes: "(min-width: 768px) 184px, 50vw",
    });
  }

  for (const item of experience) {
    preloadNextImage({
      src: item.logo,
      alt: item.company,
      width: 20,
      height: 20,
    });
  }

  preloadNextImage({
    src: music.cover,
    alt: `${music.title} cover`,
    width: 56,
    height: 56,
  });

  preloadNextImage({
    src: music.arrow,
    alt: "",
    width: 28,
    height: 36,
  });
}

function preloadNextImage(image: Parameters<typeof getImageProps>[0]) {
  const {props} = getImageProps(image);
  preload(props.src, {
    as: "image",
    imageSrcSet: props.srcSet,
    imageSizes: props.sizes,
    fetchPriority: "low",
  });
}
