import { SocialLinks } from "@/components/social-links";
import Image from "next/image";

export function AboutBio() {
  return (
    <div className="flex flex-col gap-8 text-body-md text-ink">
      <div className="flex flex-col gap-5 px-4">
        <p>
          Product Designer at{" "}
          <Image
            src="/icons/prax.webp"
            alt=""
            width={20}
            height={20}
            className="-rotate-6 ml-1 mr-1.5 inline-block size-5 rounded-[4px] align-middle object-cover"
          />
          Prax Industries.
        </p>
        <p>Previously worked at Caura and JPMorgan.</p>
        <p>Also ran the product studio Visual Binary.</p>
        <p>In my spare time, I enjoy running, making music, and cinema.</p>
      </div>
      <SocialLinks />
    </div>
  );
}
