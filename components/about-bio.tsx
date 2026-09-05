import { SocialLinks } from "@/components/social-links";

export function AboutBio() {
  return (
    <div className="flex flex-col gap-8 text-body-md text-ink">
      <div className="flex flex-col gap-5 px-4">
        <p>Product Designer at Prax Industries.</p>
        <p>Previously worked at Caura and JPMorgan.</p>
        <p>Also ran the product studio Visual Binary.</p>
        <p>In my spare time, I enjoy running, making music, and cinema.</p>
      </div>
      <SocialLinks />
    </div>
  );
}
