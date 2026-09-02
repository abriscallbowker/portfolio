import {SocialLinks} from "@/components/social-links";

export function AboutBio() {
  return (
    <div className="flex flex-col gap-5 text-body-md text-ink">
      <div className="flex flex-col gap-5 px-4">
        <p>I currently lead Product Design at Prax.</p>
        <p>I previously worked at Caura &amp; JPMorgan.</p>
        <p>
          In my spare time, I enjoy running, making music, and cinema.
        </p>
      </div>
      <SocialLinks />
    </div>
  );
}
