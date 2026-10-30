import { SocialLinks } from "@/components/social-links";
import Image from "next/image";

export function AboutBio() {
  return (
    <div className="flex flex-col gap-8 text-body-md text-ink">
      <div className="flex flex-col gap-5 px-4">
        <p className="flex flex-wrap items-center">
          Product Designer
          at
          <a
            href="https://prax.io"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-[8px] inline-flex items-center gap-1.5 transition-opacity hover:opacity-60 focus-visible:opacity-60"
          >
            <Image
              src="/icons/prax.webp"
              alt=""
              width={18}
              height={18}
              className="size-[18px] shrink-0 rounded-[4px] object-cover"
            />
            Prax Industries.
          </a>
        </p>
        <p>Previously worked at Caura and JPMorgan.</p>
        <p>Also ran the product studio Visual Binary.</p>
        <p>In my spare time, I enjoy running, making music, and cinema.</p>
      </div>
      <SocialLinks />
    </div>
  );
}
