import {AboutBio} from "@/components/about-bio";
import {preloadAboutImages} from "@/lib/preload-about-images";
import {preloadGalleryImages} from "@/lib/preload-gallery-images";

export default async function Home() {
  preloadAboutImages();
  await preloadGalleryImages();
  return (
    <div className="site-column flex w-full flex-col gap-10">
      <AboutBio />
    </div>
  );
}
