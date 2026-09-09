import {AboutBio} from "@/components/about-bio";
import {HomeFooter} from "@/components/site-footer";
import {site} from "@/lib/site";
import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "About",
  description: site.description,
};

export default function AboutPage() {
  return (
    <>
      <div className="site-column flex w-full flex-col gap-10">
        <AboutBio />
      </div>
      <HomeFooter />
    </>
  );
}
