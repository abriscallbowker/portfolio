import {ExperienceList} from "@/components/experience-list";
import {MusicCard} from "@/components/music-card";
import {PhotoCollage} from "@/components/photo-collage";
import {SocialLinks} from "@/components/social-links";
import {preloadGalleryImages} from "@/lib/preload-gallery-images";
import {site} from "@/lib/site";
import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "About",
  description: site.description,
};

export default async function AboutPage() {
  await preloadGalleryImages();
  return (
    <div className="site-column flex w-full flex-col gap-10">
      <div className="flex flex-col gap-12 md:gap-20">
        <ExperienceList />
        <section className="flex flex-col gap-4 px-4">
          <PhotoCollage />
          <MusicCard />
        </section>
      </div>
      <SocialLinks />
    </div>
  );
}
